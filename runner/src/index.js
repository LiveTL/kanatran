const clientVersion = '1.1.0';

const {exec} = require('child_process');
const dockerstats = require('dockerstats');
const ENDPOINT = process.env.CONTROLLER_URL || 'ws://localhost:8000';
const WebSocket = require('ws');
const monitor = require('node-docker-monitor');
const { exit } = require('process');
let ws = null;
const IMAGE_NAME = process.env.WATCHER_IMAGE || 'watcher';
const LIVETL_API_KEY = process.env.LIVETL_API_KEY || 'KEY_WAS_BAD';
const API_URL = process.env.API_URL || 'https://api.livetl.app';
let initDone = false;
let MAX_USAGES = {
  cpuPercent: process.env.MAX_CPU_PERCENT || 50,
  memPercent: process.env.MAX_MEM_PERCENT || 50
};

const log = console.log;
console.log = (...args) => log(new Date(), ...args);

let playing = {};
let shutdown = false;

setInterval(statsGetter, 1000);
async function statsGetter() {
  if (ws && initDone) {
    const stats = await dockerstats.dockerContainerStats();
    let usages = {
      memPercent: 0,
      cpuPercent: 0
    };
    stats.forEach(container => {
      usages.memPercent += container.memPercent;
      usages.cpuPercent += container.cpuPercent;
    });
    let relativeLoad = 0.0;
    Object.keys(usages).forEach(metric => {
      usages[metric] /= MAX_USAGES[metric];
      relativeLoad = Math.max(Math.round(usages[metric] * 10000) / 100, relativeLoad);
    });
    ws.send(JSON.stringify({
      event: 'usage',
      relativeLoads: usages,
      relativeLoad
    }));
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
      ${IMAGE_NAME}`
  );
  // process.stdout.pipe(process.stdout);
  process.stderr.on('data', output => {
    if (output.toString().includes('already in use by container')) {
      ws.send(JSON.stringify({
        event: 'status',
        playing: true,
        video: data.streamId
      }));
      console.log(`${data.streamId} is already playing`);
    }
  });
  console.log(`Starting ${data.streamId}`);
}

let dockerMonitor = null;
function connect () {
  ws = new WebSocket(ENDPOINT, clientVersion);
  ws.on('open', () => {
    console.log('Runner is active!');

    if (!dockerMonitor) monitor({
      onContainerUp: (container) => {
        if (initDone && !shutdown && container.Image === IMAGE_NAME && !playing[container.Name]) {
          ws.send(JSON.stringify({
            event: 'status',
            playing: true,
            video: container.Name
          }));
          console.log(`${container.Name} is playing!`);
          playing[container.Name] = true;
        }
      },
    
      onContainerDown: (container) => {
        if (initDone && !shutdown && container.Image === IMAGE_NAME && playing[container.Name]) {
          ws.send(JSON.stringify({
            event: 'status',
            playing: false,
            video: container.Name
          }));
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
      ws.send(JSON.stringify({
        event: 'startinit'
      }));
      break;
    } case 'play': {
      play(data);
      break;
    } case 'initdone': {
      Object.keys(playing).forEach(video => {
        ws.send(JSON.stringify({
          event: 'status',
          playing: true,
          video
        }));
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
  ws.on('error', console.log);
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
