const Box = require('./box');
const scheduler = require('node-schedule');

const items = [];

function findBoxByAddress(address) {
  return items.find(box => box.address === address);
}

function init(boxesArr, cb) {
  boxesArr.forEach((opts) => {
    const box = new Box(opts);
    items.push(box);
    box.refreshAndRun();

    if (opts.scheduleConfig) {
      scheduler.scheduleJob(opts.scheduleConfig, (fireDate) => {
        console.log(
          'Triggering scheduled run for box:',
          opts.address,
          'at:',
          fireDate.toTimeString(),
        );
        findBoxByAddress(opts.address).run();
      });
    }
  });
}

const Boxes = {};
Boxes.init = init;
Boxes.findBoxByAddress = findBoxByAddress;

module.exports = Boxes;
