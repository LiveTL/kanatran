require('../../common/logs.js');

const {exec} = require('child_process');
const ENDPOINT = process.env.CONTROLLER_URL || 'ws://localhost:8000';
const WebSocket = require('ws');
const monitor = require('node-docker-monitor');
const { exit } = require('process');
let ws = null;
const IMAGE_NAME = process.env.WATCHER_IMAGE || 'watcher';
const LIVETL_API_KEY = process.env.LIVETL_API_KEY || 'KEY_WAS_BAD';
const API_URL = process.env.API_URL || 'https://api.livetl.app';

let playing = {};
let shutdown = false;

function play(data){
  exec(
    `docker run -d --rm \\
      --workdir /usr/src/watcher \\
      -e VIDEO=${data.streamId} \\
      -e LIVETL_API_KEY='${LIVETL_API_KEY}' \\
      -e API_URL=${API_URL} \\
      --name ${data.streamId} \\
      ${IMAGE_NAME}`
  ).stdout.pipe(process.stdout);
  console.log(`Starting ${data.streamId} if not already playing`);
}

const MAX_CONTAINERS = parseInt(process.env.MAX_CONTAINERS || 2);
let dockerMonitor = null;
function connect () {
  ws = new WebSocket(ENDPOINT);
  ws.on('open', () => {
    console.log('Runner is active!');

    if (!dockerMonitor) monitor({
      onContainerUp: (container) => {
        if (!shutdown && container.Image === IMAGE_NAME && !playing[container.Name]) {
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
        if (!shutdown && container.Image === IMAGE_NAME && playing[container.Name]) {
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
        event: 'info',
        maxContainers: MAX_CONTAINERS
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
      break;
    }
    }
  });
  ws.on('close', () => {
    console.log('Socket disconnected. Retrying...');
    setTimeout(connect, 2500);
  });
  ws.on('error', console.log);
}
connect();
console.log(`Runner started, connecting to ${ENDPOINT}`);

function exitHandler() {
  shutdown = true;
  console.log('Cleaning up before exit...');
  exec(`docker rm $(docker stop $(docker ps -a -q --filter ancestor=${IMAGE_NAME} --format="{{.ID}}"))`)
    .stdout.pipe(process.stdout);
  exit(0);
}

process.on('exit', exitHandler);
process.on('SIGINT', exitHandler);
process.on('SIGUSR1', exitHandler);
process.on('SIGUSR2', exitHandler);
process.on('SIGINT', exitHandler);
process.on('SIGTERM', exitHandler);
process.on('uncaughtException', exitHandler);
