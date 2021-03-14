const io = require('socket.io-client');
const { exec } = require('child_process');
const socket = io.connect(process.env.CONTROLLER_URL || 'localhost', {
  port: 8080
});
socket.on('play', (data) => {
  const imageName = process.env.WATCHER_IMAGE || 'ghcr.io/livetl/watcher:latest';
  exec(`make spawn video="${data.streamId}" image=${imageName}`);
  io.emit('status', {
    playing: true,
    id: data.id
  });
});
socket.on('connect', () => {
  console.log(`Runner is active! Socket ID is ${socket.id}`);
});
socket.on('disconnect', () => {
  console.log(`${socket.id} disconnected`);
});
console.log('Runner started');
