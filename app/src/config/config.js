const config = {
  appName: process.env.APP_NAME || 'weatherops-dashboard',
  appVersion: process.env.APP_VERSION || '1.0.0',
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',

  mockMode: process.env.MOCK_MODE === 'true',
  weatherApiUrl:
    process.env.WEATHER_API_URL ||
    'https://api.openweathermap.org/data/2.5/weather',
  weatherApiKey: process.env.WEATHER_API_KEY || '',
  weatherUnits: process.env.WEATHER_UNITS || 'metric',
  cacheTtlSeconds: Number(process.env.CACHE_TTL_SECONDS || 300)
};

module.exports = config;