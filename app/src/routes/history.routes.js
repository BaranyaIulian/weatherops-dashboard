const express = require('express');
const { getHistory, clearHistory } = require('../services/history.service');

const router = express.Router();

router.get('/', (req, res) => {
  const history = getHistory();

  res.status(200).json({
    count: history.length,
    items: history
  });
});

router.delete('/', (req, res) => {
  clearHistory();

  console.log(JSON.stringify({
    level: 'info',
    event: 'history_cleared',
    service: 'weatherops-dashboard',
    timestamp: new Date().toISOString()
  }));

  res.status(200).json({
    message: 'History cleared successfully.',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;