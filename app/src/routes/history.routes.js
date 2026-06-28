const express = require('express');
const logger = require('../utils/logger');
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

  logger.info('history_cleared', {
    request_id: req.requestId
  });

  res.status(200).json({
    message: 'History cleared successfully.',
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
