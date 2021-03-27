const { exec } = require('child_process');
const ENDPOINT = process.env.CONTROLLER_URL || 'ws://localhost:8000';
const WebSocket = require('ws');

function play(data, ws){
  const imageName = process.env.WATCHER_IMAGE || 'watcher';
  exec(
    `docker run -d --rm \\
      --workdir /usr/src/watcher \\
      -e VIDEO=${data.streamId} \\
      --name ${data.streamId} \\
      ${imageName}`
  ).stdout.pipe(process.stdout);
  console.log(`Playing ${data.streamId}`);
  ws.send(JSON.stringify({
    event: 'status',
    playing: true,
    video: data.id
  }));
}

const MAX_CONTAINERS = process.env.MAX_CONTAINERS || 2;
function connect () {
  const ws = new WebSocket(ENDPOINT);
  ws.on('open', () => {
    console.log('Runner is active!');
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
      play(data, ws);
    }
    }
  });
  ws.on('close', () => {
    console.log('Socket disconnected. Retrying...');
    setTimeout(connect, 1000);
  });
  ws.on('error', console.log);
}
connect();
console.log(`Runner started, connecting to ${ENDPOINT}`);
