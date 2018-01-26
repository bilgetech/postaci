const fs = require('fs');
const dotenv = require('dotenv');
const program = require('commander');

program
  .version('0.1.0')
  .option('-c, --config <file>', 'Configuration file.')
  .parse(process.argv);

const server = require('./server');
const Boxes = require('./components/boxes');

// Load the variables in .env file to the process.env
dotenv.config();

const contents = fs.readFileSync(program.config);
const config = JSON.parse(contents);

Boxes.init(config.boxes);

// Start Server
server.start();
