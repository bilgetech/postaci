const Box = require('./box');

const items = [];

function init(boxesArr) {
  boxesArr.forEach((item) => {
    const box = new Box(item.boxAddress, item.gitConfig);

    console.log(`Starting to refresh box:${item.boxAddress}`);
    box.refresh((err) => {
      if (err) {
        console.log(`Box refresh error: ${err}`);
        console.error(err);
      } else {
        console.log(`Box refresh completed: ${item.boxAddress}`);
      }
    });
    items.push(box);
  });
}

function findBoxByAddress(address) {
  return items.find(box => box.address === address);
}

const Boxes = {};
Boxes.init = init;
Boxes.findBoxByAddress = findBoxByAddress;
module.exports = Boxes;
