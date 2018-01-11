const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const app = express();

// Load the variables in .env file to the process.env
dotenv.config();

// Configure Middlewares
app.use(morgan(process.env.LOGGING_LEVEL || 'tiny'));
app.use(bodyParser.json());

// Configure Routes
app.use('/', require('./routes/index'));

const port = process.env.PORT || 3000;
app.listen(port);
console.log(`Listening on port: ${port}`);
