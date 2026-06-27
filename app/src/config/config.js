const config = {
  appName: process.env.APP_NAME || 'weatherops-dashboard',
  appVersion: process.env.APP_VERSION || '1.0.0',
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info'
};

module.exports = config;