const express = require('express');
const path = require('path');
const Boxes = require('../components/boxes');

const router = express.Router();

function badgeFile(fileName) {
  return path.resolve(__dirname, '../assets', fileName);
}

router.get('/badge/:box/:runnable', (req, res) => {
  let { box, runnable } = req.params;

  box = Boxes.findBoxByAddress(box);
  if (box) {
    runnable = box.getRunnableByName(runnable);
    if (box.isRunning) {
      res.sendFile(badgeFile('tests-running.svg'));
    } else if (runnable) {
      if (runnable.badge) {
        res.contentType('svg').end(runnable.badge, 'binary');
      } else {
        res.sendFile(badgeFile('runnable-not-ready.svg'));
      }
    } else {
      res.sendFile(badgeFile('runnable-not-found.svg'));
    }
  } else {
    res.sendFile(badgeFile('box-not-found.svg'));
  }
});

router.get('/summary/:box/:runnable', (req, res) => {
  const { box, runnable } = req.params;

  const summary = Boxes.findBoxByAddress(box).getRunnableByName(runnable).summary;

  res.json(summary);
});

router.all('/run/:box', (req, res) => {
  const box = Boxes.findBoxByAddress(req.params.box);
  if (!box.repo.alreadyCloned) {
    res.json({
      message: 'Box is not cloned yet. Cannot run',
    });
    return;
  } else if (box.isRunning) {
    res.json({
      message: 'Another run is already going on. Queueing new run command.',
    });
  } else {
    res.json({
      message: 'Run started. Badge and summary will be updated after run is completed.',
    });
  }
  box.run();
});

router.all('/refresh/:box', (req, res) => {
  const box = Boxes.findBoxByAddress(req.params.box);
  if (box.repo.busy || box.isRunning) {
    res.json({
      message: 'Another refresh or run is already going on. Queueing new refresh command.',
    });
  } else {
    res.json({
      message: 'Refresh started. After refresh is completed postaci will run the box automatically',
    });
  }
  box.refreshAndRun();
});

module.exports = router;
