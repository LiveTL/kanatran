const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { exec } = require('child_process');
app.use(bodyParser.json());
const PORT = process.env.PORT || 8080;

app.post('/github', function (req, res) {
  res.status(200);
  if(req.body.ref === 'refs/heads/master' ) {
    console.log('Pulling new changes and rebooting...');
    exec('git reset --hard HEAD; git fetch --all; git pull;');
  }
});

app.get('/', function (req, res) {
  res.status(200);
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}/`);
});
