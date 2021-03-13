const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');

const PORT = process.env.PORT || 8080;

const app = express();
app.use(bodyParser.json());

app.post('/github', (req, res) => {
  res.status(200);
  res.end();
  if (req.body.ref === 'refs/heads/master' ) {
    console.log('Pulling new changes and rebooting if neccessary...');
    exec('make update').stdout.pipe(process.stdout);
  }
});

app.post('/stream', (req, res) => {
  res.status(200);
  res.end();
  if (req.body.streamId) {
    exec(`make spawn video="${req.body.streamId}"`);
    console.log(`Playing ${req.body.streamId}`);
  }
});

app.get('/', (req, res) => {
  res.send('Server is running');
  res.status(200);
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}/`);
});
