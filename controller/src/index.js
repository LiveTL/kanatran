const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');

const app = express();
const server = require('http').createServer(app);
const ws = require('ws');

const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());

let sockets = {};

app.get('/', (req, res) =>{
  res.send('Running');
});
app.post('/stream', (req, res) => {
  res.status(200);
  res.end();
  Object.keys(sockets).forEach(id =>{
    sockets[id].send(JSON.stringify({
      event: 'play', 
      data:{
        id,
        streamId: req.body.streamId
      }
    }));
  });
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
wsServer.on('connection', (socket, req) => {
  const SOCKETID = req.socket.remoteAddress;
  console.log(`Connected to ${SOCKETID}`);
  sockets[SOCKETID] = socket;
  socket.send(JSON.stringify({
    event: 'socketid',
    data: SOCKETID
  }));
});
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}/`);
}).on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    wsServer.emit('connection', socket, request);
  });
});