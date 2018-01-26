const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Hello world');
});

module.exports = router;
