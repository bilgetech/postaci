const Box = require('./box');

const items = [];

function init(boxesArr, cb) {
  boxesArr.forEach((opts) => {
    const box = new Box(opts);
    items.push(box);
    box.refreshAndRun();
  });
}

function findBoxByAddress(address) {
  return items.find(box => box.address === address);
}

const Boxes = {};
Boxes.init = init;
Boxes.findBoxByAddress = findBoxByAddress;

module.exports = Boxes;
