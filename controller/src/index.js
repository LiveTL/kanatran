const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const { Queue } = require('./queue.js');
const app = express();
const server = require('http').createServer(app);
const ws = require('ws');
const fs = require('fs');
const { validateVersion } = require('./versionValidation.js');
const IS_PRODUCTION = (process.env.MODE || 'development').toLowerCase() === 'production';

const log = console.log;
console.log = (...args) => { if (!IS_PRODUCTION) log(new Date(), ...args); };

const PORT = process.env.PORT || 8000;
app.use(bodyParser.json());
app.use(express.static('public'));

let sockets = {};

function updateLog(override) {
  if (IS_PRODUCTION && !override) return;
  const data = JSON.stringify(sockets, 
    (key, val) => key == 'socket' ? undefined : val, 2);
  fs.writeFile('sockets.txt', data, () => {}); 
}

if (IS_PRODUCTION) setInterval(() => updateLog(true), 30);

const queue = new Queue();

setInterval(runQueue, 2500);

function runQueue() {
  if (queue.length) console.log(`Attempting to assign ${queue.length} streams`);
  while (queue.length) {
    const allKeys = Object.keys(sockets);
    let item = null;
    allKeys.forEach(id => {
      if (!sockets[id].locked && sockets[id].relativeLoad <= 100 &&
          (item == null || sockets[id].relativeLoad < sockets[item].sockets[id].relativeLoad)) {
        item = id;
      }
    });
    if (item){
      sockets[item].socket.send(JSON.stringify({
        event: 'play', 
        id: item,
        streamId: queue.top.data
      }));
      sockets[item].runningContainers[queue.top.data] = false;
      console.log(`Requesting to play ${queue.top.data} on ${item}`);
      // sockets[item].locked = true;
      queue.pop();
    } else {
      console.log('No machines currently available');
      break;
    }
  }
  updateLog();
}

app.post('/stream', (req, res) => {
  if (typeof req.body.streamId === 'string' && 
      req.body.streamId.indexOf(' ') >= 0) {
    res.status(400);
  } else {
    queue.push(req.body.streamId);
    console.log(`Queued ${req.body.streamId} (priority: ${queue.length})`);
    res.status(200);
  }
  res.end();
});
app.post('/github', (req, res) => {
  res.status(200);
  res.end();
  if (req.body.ref === 'refs/heads/master' ) {
    console.log('Pulling new changes and rebooting if neccessary...');
    exec('cd ..; make update &').stdout.pipe(process.stdout);
  }
});

const wsServer = new ws.Server({ noServer: true });
wsServer.on('connection', (socket) => {
  console.log(`Connected to ${socket.id}`);
  sockets[socket.id] = {socket};
  socket.send(JSON.stringify({
    event: 'socketid',
    id: socket.id
  }));
  socket.on('message', data => {
    data = JSON.parse(data);
    switch (data.event){
    case 'status': {
      if (data.playing) {
        sockets[socket.id].runningContainers[data.video] = true;
        console.log(
          `${data.video} is ${data.alreadyPlaying ? 'already ' : ''}playing on ${socket.id}`
        );
        // setTimeout(() => sockets[socket.id].locked = false, 
        //   data.alreadyPlaying ? 0 : 7500);
      } else {
        if (sockets[socket.id]) {
          delete sockets[socket.id].runningContainers[data.video];
        }
        console.log(`Finished playing ${data.video} on ${socket.id}`);
      }
      break;
    } case 'startinit': {
      sockets[socket.id].relativeLoad = 0.0;
      sockets[socket.id].locked = false;
      sockets[socket.id].runningContainers = {};
      console.log(`Initialized ${socket.id} limits`);
      socket.send(JSON.stringify({
        event: 'initdone'
      }));
      break;
    } case 'usage': {
      sockets[socket.id].relativeLoad = data.relativeLoad;
      updateLog();
      break;
    }
    }
  });
  socket.on('close', () => {
    console.log(`${socket.id} disconnected. Reallocating...`);
    if (sockets[socket.id]) {
      Object.keys(sockets[socket.id].runningContainers).forEach(item => {
        queue.push(item);
      });
      delete sockets[socket.id];
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}/`);
  updateLog();
}).on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    if (!validateVersion(request.headers['sec-websocket-protocol'])) {
      socket.close(4269, 'Runner version is incompatible with controller');
      return;
    }
    socket.id = request.headers['sec-websocket-key'];
    wsServer.emit('connection', socket, request);
  });
});
