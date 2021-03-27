const { exec } = require('child_process');
const ENDPOINT = process.env.CONTROLLER_URL || 'ws://localhost:8080';
const WebSocket = require('ws');


const MAX_CONTAINERS = process.env.MAX_CONTAINERS;
function connect () {
  const ws = new WebSocket(ENDPOINT);
  ws.on('play', (data) => {
    const imageName = process.env.WATCHER_IMAGE || 'ghcr.io/livetl/watcher:latest';
    exec(
      `docker run -d --rm \\
      --workdir /usr/src/watcher \\
      -e VIDEO=${data.streamId} \\
      --name ${data.streamId} \\
      ${imageName}`
    ).stdout.pipe(process.stdout);
    console.log(`Playing ${data.streamId}`);
    ws.send('status', {
      playing: true,
      id: data.id
    });
  });
  ws.on('open', () => {
    console.log('Runner is active!');
  });
  ws.on('message', (data) => {
    console.log(JSON.parse(data));
  });
  ws.on('close', () => {
    console.log('Socket disconnected. Retrying...');
    setTimeout(connect, 1000);
  });
  ws.on('error', console.log);
}
connect();
console.log(`Runner started, connecting to ${ENDPOINT}`);
