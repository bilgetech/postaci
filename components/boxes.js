const Box = require('./box');

const items = [];

function init(boxesArr, cb) {
  boxesArr.forEach((opts) => {
    const box = new Box(opts);
    items.push(box);

    console.log(box.address, '\t\t\t', 'Starting to refresh box');

    box.refresh((err) => {
      if (err) {
        console.log(box.address, '\t\t\t', 'Box refresh error:', err);
        cb(err);
      } else {
        console.log(box.address, '\t\t\t', 'Box refresh completed');
        console.log(box.address, '\t\t\t', 'Starting to run box');
        box.run((err2) => {
          if (err2) {
            console.log(box.address, '\t\t\t', 'Box run error:', err2);
            cb(err2);
          } else {
            console.log(box.address, '\t\t\t', 'Box run completed:', box.address);
            box.generateAllBadges(cb);
          }
        });
      }
    });
  });
}

function findBoxByAddress(address) {
  return items.find(box => box.address === address);
}

const Boxes = {};
Boxes.init = init;
Boxes.findBoxByAddress = findBoxByAddress;

module.exports = Boxes;
