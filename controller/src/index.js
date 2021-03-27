const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');

const app = express();
const server = require('http').createServer(app);
const ws = require('ws');

const PORT = process.env.PORT || 8000;
app.use(bodyParser.json());

let sockets = {};

app.get('/', (req, res) =>{
  res.send('Running');
});
app.post('/stream', (req, res) => {
  let item = null;
  Object.keys(sockets).forEach(id => {
    if (item == null || 
        sockets[id].runningContainers / sockets[id].maxContainers 
        < sockets[item].runningContainers / sockets[item].maxContainers) {
      item = id;
    }
  });
  if (item){
    sockets[item].socket.send(JSON.stringify({
      event: 'play', 
      id: item,
      streamId: req.body.streamId
    }));
    sockets[item].runningContainers++;
    console.log(`Playing ${req.body.streamId} on ${item}`);
    res.status(200);
  } else {
    console.log('No machines to play on');
    res.status(503);
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
      break;
    } case 'info':{
      sockets[socket.id].maxContainers = data.maxContainers;
      sockets[socket.id].runningContainers = 0;
      console.log(`Initialized ${socket.id} limits`);
      break;
    }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}/`);
}).on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    socket.id = request.socket.remoteAddress;
    wsServer.emit('connection', socket, request);
  });
});

/*
await fetch('/stream', {
  method: 'post',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    streamId: 'xHP6lpOepk4'
  })
})
*/