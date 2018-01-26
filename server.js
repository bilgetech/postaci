const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const server = express();
const index = require('./routes/index');

function start() {
  // Configure Middlewares
  server.use(morgan(process.env.LOGGING_LEVEL || 'tiny'));
  server.use(bodyParser.json());

  // Configure Routes
  server.use('/', index);

  const port = process.env.PORT || 3000;
  server.listen(port);
  console.log(`Listening on port: ${port}`);
}

module.exports = { start };
