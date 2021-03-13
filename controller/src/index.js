const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

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
    sockets[id].emit('play', {
      id,
      streamId: req.body.streamId
    });
  });
});
app.post('/github', (req, res) => {
  res.status(200);
  res.end();
  if (req.body.ref === 'refs/heads/master' ) {
    console.log('Pulling new changes and rebooting if neccessary...');
    exec('cd ..; make update').stdout.pipe(process.stdout);
  }
});
io.on('connection', (socket) => {
  sockets[socket.id] = socket;
});
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}/`);
});
