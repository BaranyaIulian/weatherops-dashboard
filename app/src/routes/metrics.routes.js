const express = require('express');
const logger = require('../utils/logger');
const { register } = require('../utils/metrics');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.status(200).send(metrics);
  } catch (error) {
    logger.error('metrics_export_failed', {
      request_id: req.requestId,
      error
    });

    res.status(500).json({
      error: 'Failed to export metrics.',
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;