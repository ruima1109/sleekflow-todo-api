const serverless = require('serverless-http');
const express = require('express');
const userRoutes = require('./routes/userRoutes');
const streamRoutes = require('./routes/streamRoutes');

const app = express();

app.use(express.json());
app.use('/users', userRoutes);

app.use('/stream', streamRoutes);

app.get('/status', (req, res) => {
  res.send('Hello World!');
});

module.exports.handler = serverless(app);