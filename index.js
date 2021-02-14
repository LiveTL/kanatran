const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');

const PORT = process.env.PORT || 8080;

const app = express();
app.use(bodyParser.json());

app.post('/github', (req, res) => {
  res.status(200);
  res.end();
  if(req.body.ref === 'refs/heads/master' ) {
    console.log('Pulling new changes and rebooting if neccessary...');
    exec('make update');
    console.log('Done updating');
  }
});

app.get('/', (req, res) => {
  res.redirect('https://github.com/LiveTL/kanatran');
  res.status(200);
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}/`);
});
