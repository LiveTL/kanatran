const io = require('socket.io-client');
const { exec } = require('child_process');
const socket = io.connect('localhost', {
  port: 8080
});
socket.on('play', (data) => {
  exec(`make spawn video="${data.streamId}"`);
  io.emit('status', {
    playing: true,
    id: data.id  
  });
});
