const express = require('express');
const app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
const PORT = process.env.PORT || 8080;

app.post('/', function (req, res) {
  console.log(req.body);
  res.send(200);
});

app.get('/', function (req, res) {
  res.send(200);
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}/`);
});