require('../../common/logs.js');

const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const { Queue } = require('./queue.js');
const app = express();
const server = require('http').createServer(app);
const ws = require('ws');

const PORT = process.env.PORT || 8000;
app.use(bodyParser.json());

let sockets = {};

app.get('/', (req, res) => {
  res.send(`
<pre>
await fetch('/stream', {
  method: 'post',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    streamId: 'xHP6lpOepk4'
  })
});
</pre>
  `);
});

const queue = new Queue();

function runQueue() {
  console.log(`Attempting to assign ${queue.length} streams`);
  if (!queue.length) return;
  const allKeys = Object.keys(sockets);
  let item = allKeys[0];
  allKeys.forEach(id => {
    const candidate = Object.keys(sockets[id].runningContainers).length;
    const current = Object.keys(sockets[item].runningContainers).length;
    if (item == null || 
        candidate / sockets[id].maxContainers <
        current / sockets[item].maxContainers) {
      item = id;
    }
  });
  if (item){
    sockets[item].socket.send(JSON.stringify({
      event: 'play', 
      id: item,
      streamId: queue.top.data
    }));
    console.log(`Requesting to play ${queue.top.data} on ${item}`);
    queue.pop();
  } else {
    console.log('No machines currently available');
  }
}

app.post('/stream', (req, res) => {
  queue.push(req.body.streamId);
  console.log(`Queued ${req.body.streamId} (priority: ${queue.length})`);
  runQueue();
  res.status(200);
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
        console.log(`${data.video} is playing on ${socket.id}`);
      } else {
        if (sockets[socket.id]) {
          delete sockets[socket.id].runningContainers[data.video];
        }
        console.log(`Finished playing ${data.video} on ${socket.id}`);
      }
      break;
    } case 'info':{
      sockets[socket.id].maxContainers = data.maxContainers;
      sockets[socket.id].runningContainers = {};
      console.log(`Initialized ${socket.id} limits`);
      runQueue();
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
    runQueue();
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}/`);
}).on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    socket.id = request.headers['sec-websocket-key'];
    wsServer.emit('connection', socket, request);
  });
});
