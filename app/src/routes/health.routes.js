const express = require('express');
const config = require('../config/config');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: config.appName,
    environment: config.nodeEnv,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

router.get('/ready', (req, res) => {
  res.status(200).json({
    status: 'ready',
    service: config.appName,
    timestamp: new Date().toISOString()
  });
});

router.get('/version', (req, res) => {
  res.status(200).json({
    service: config.appName,
    version: config.appVersion,
    environment: config.nodeEnv
  });
});

module.exports = router;