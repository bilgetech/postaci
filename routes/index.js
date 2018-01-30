const express = require('express');
const Boxes = require('../components/boxes');

const router = express.Router();

router.get('/badge/:box/:runnable', (req, res) => {
  const { box, runnable } = req.params;

  const badge = Boxes.findBoxByAddress(box).getRunnableByName(runnable).badge;

  res.contentType('svg').end(badge, 'binary');
});

router.get('/summary/:box/:runnable', (req, res) => {
  const { box, runnable } = req.params;

  const summary = Boxes.findBoxByAddress(box).getRunnableByName(runnable)
    .summary;

  res.json(summary);
});

module.exports = router;
