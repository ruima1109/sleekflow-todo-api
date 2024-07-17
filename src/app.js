const serverless = require('serverless-http');
const express = require('express');
const users = require('./resources/user');

const app = express();

app.use(express.json());
app.use('/users', users);

app.get('/status', (req, res) => {
  res.send('Hello World!');
});

module.exports.handler = serverless(app);