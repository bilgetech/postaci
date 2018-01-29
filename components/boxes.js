const Box = require('./box');

const items = [];

function init(boxesArr, cb) {
  boxesArr.forEach((opts) => {
    const box = new Box(opts);
    items.push(box);

    console.log(`Starting to refresh box:${box.address}`);

    box.refresh((err) => {
      if (err) {
        console.log(`Box refresh error: ${err}`);
        cb(err);
      } else {
        console.log(`Box refresh completed: ${box.address}`);
        console.log(`Starting to run box:${box.address}`);
        box.run((err2) => {
          if (err2) {
            console.log(`Box run error: ${err2}`);
            cb(err2);
          } else {
            console.log('Box run completed: ', box.address);
            cb(null);
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
