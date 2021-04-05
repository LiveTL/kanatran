const clientVersion = '1.3.0';

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(bodyParser.json());
const {exec} = require('child_process');
const dockerstats = require('dockerstats');
const ENDPOINT = process.env.CONTROLLER_URL || 'wss://api.livetl.app/kanatran/controller';
const WebSocket = require('ws');
const monitor = require('node-docker-monitor');
const bytes = require('bytes');
const { exit } = require('process');
let ws = null;
const IMAGE_NAME = process.env.WATCHER_IMAGE || 'ghcr.io/livetl/watcher';
const LIVETL_API_KEY = process.env.LIVETL_API_KEY || 'KEY_WAS_BAD';
const API_URL = process.env.API_URL || 'https://api.livetl.app';
let initDone = false;
let MAX_MEM_VAR = process.env.MAX_MEM || '100';
const MEM_IS_BYTES = MAX_MEM_VAR.toLowerCase().endsWith('b');
if (MEM_IS_BYTES) MAX_MEM_VAR = bytes(MAX_MEM_VAR);
else MAX_MEM_VAR = parseInt(MAX_MEM_VAR);
const MAX_CPU = parseInt(process.env.MAX_CPU || '') || 100;
const INTERCOM = parseInt(process.env.INTERCOM_PORT || 6969);
const INTERCOM_NETWORK = process.env.INTERCOM_NETWORK || 'kanatran';

const log = console.log;
console.log = (...args) => log(new Date(), ...args);

let playing = {};
let shutdown = false;

const criticalError = () => {
  console.log('Critical error, logs above');
  process.exit(1);
};

const round = num => Math.round(num * 10000) / 100;

let wsQueue = [];
function send(arg) {
  arg = JSON.stringify(arg);
  if (ws.readyState === 1) ws.send(arg);
  else wsQueue.push(arg);
}

setInterval(() => {
  if (ws.readyState === 1) {
    wsQueue.forEach(item => {
      ws.send(...item);
    });
  }
  wsQueue = [];
}, 1000);

function sendStats(relativeLoad) {
  send({
    event: 'usage',
    relativeLoad
  });
}

setInterval(statsGetter, 1000);
async function statsGetter() {
  if (ws && initDone) {
    const stats = await dockerstats.dockerContainerStats();
    let usages = {
      memPercent: 0,
      totalMem: 0,
      cpuPercent: 0
    };
    stats.forEach(container => {
      usages.memPercent += container.memPercent;
      usages.totalMem += container.memUsage;
      usages.cpuPercent += container.cpuPercent;
    });
    if (MEM_IS_BYTES) usages.memPercent = usages.totalMem / MAX_MEM_VAR;
    else usages.memPercent /= MAX_MEM_VAR;
    usages.memPercent = round(usages.memPercent / 100);
    usages.cpuPercent = round(usages.cpuPercent / MAX_CPU);
    let relativeLoad = Math.max(
      usages.memPercent,
      usages.cpuPercent
    );

    if (initDone)
      sendStats(relativeLoad);
  }
}

function play(data) {
  const process = exec(
    `docker run -d --rm \\
      --workdir /usr/src/watcher \\
      -e VIDEO=${data.streamId} \\
      -e LIVETL_API_KEY='${LIVETL_API_KEY}' \\
      -e API_URL=${API_URL} \\
      --name ${data.streamId} \\
      -e RUNNER_VERSION=${clientVersion}\\
      -e INTERCOM_PORT=${INTERCOM}\\
      -e HOSTNAME=$HOSTNAME\\
      --network ${INTERCOM_NETWORK}\\
      ${IMAGE_NAME}`
  );
  // process.stdout.pipe(process.stdout);
  process.stderr.on('data', output => {
    output = output.toString();
    if (output.includes('already in use by container')) {
      send({
        event: 'status',
        playing: true,
        alreadyPlaying: true,
        video: data.streamId
      });
      console.log(`${data.streamId} is already playing`);
    } else {
      console.log(output);
      criticalError();
    }
  });
  console.log(`Starting ${data.streamId}`);
}

let dockerMonitor = null;
function connect () {
  try {
    ws = new WebSocket(ENDPOINT, clientVersion);
    ws.on('open', () => {
      initDone = false;
      console.log('Runner is active!');

      if (!dockerMonitor) monitor({
        onContainerUp: (container) => {
          if (initDone && !shutdown && container.Image === IMAGE_NAME && !playing[container.Name]) {
            send({
              event: 'status',
              playing: true,
              video: container.Name
            });
            console.log(`${container.Name} is playing!`);
            playing[container.Name] = true;
          }
        },

        onContainerDown: (container) => {
          if (initDone && !shutdown && container.Image === IMAGE_NAME && playing[container.Name]) {
            send({
              event: 'status',
              playing: false,
              video: container.Name
            });
            console.log(`${container.Name} is done`);
            delete playing[container.Name];
          }
        }
      });
    });
    ws.on('message', (data) => {
      data = JSON.parse(data);
      switch (data.event){
      case 'socketid': {
        console.log(`ID is ${data.id}`);
        send({
          event: 'startinit'
        });
        break;
      } case 'play': {
        play(data);
        break;
      } case 'initdone': {
        sendStats(0);
        Object.keys(playing).forEach(video => {
          send({
            event: 'status',
            playing: true,
            alreadyPlaying: true,
            video
          });
          console.log(`Established that ${video} is still running`);
        });
        initDone = true;
        break;
      }
      }
    });
    ws.on('close', (code, reason) => {
      if (code === 4269) {
        console.log(reason);
        exit(0);
      } else {
        console.log('Socket disconnected. Retrying...');
        setTimeout(connect, 2500);
      }
    });
    ws.on('error', () => {});
  // eslint-disable-next-line no-empty
  } catch (e) {
  }
}
connect();
console.log(`Runner started, connecting to ${ENDPOINT}`);

function exitHandler() {
  shutdown = true;
  console.log('Cleaning up before exit...');
  exec(`docker rm $(docker kill $(docker ps -a -q --filter ancestor=${IMAGE_NAME} --format="{{.ID}}"))`, () => exit(0))
    .stdout.pipe(process.stdout);
}

process.on('exit', exitHandler);
process.on('SIGINT', exitHandler);
process.on('SIGUSR1', exitHandler);
process.on('SIGUSR2', exitHandler);
process.on('SIGINT', exitHandler);
process.on('SIGTERM', exitHandler);
// process.on('uncaughtException', exitHandler);


app.post('/timestamp', (req, res) => {
  send({
    event: 'timestamp',
    video: req.body.video,
    playBegin: req.body.playBegin
  });
  console.log(`${req.body.video} started playing at time`, new Date(req.body.playBegin));
  res.status(200).send();
});

app.listen(INTERCOM, () => {
  console.log(`Intercom listening on port ${INTERCOM}`);
});
