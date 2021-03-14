const io = require('socket.io-client');
const { exec } = require('child_process');
const socket = io.connect(process.env.CONTROLLER_URL || 'localhost', {
  port: 8080
});
socket.on('play', (data) => {
  const imageName = process.env.WATCHER_IMAGE || 'ghcr.io/livetl/watcher:latest';
  exec(
    `docker run -d --rm \\
    --workdir /usr/src/watcher \\
    -e VIDEO=${data.streamId} \\
    --name ${data.streamId} \\
    ${imageName}`
  ).stdout.pipe(process.stdout);
  console.log(`Playing ${data.streamId}`);
  socket.emit('status', {
    playing: true,
    id: data.id
  });
});
socket.on('connect', () => {
  console.log(`Runner is active! Socket ID is ${socket.id}`);
});
socket.on('disconnect', () => {
  console.log('Socket disconnected. Retrying...');
});
console.log('Runner started');
