const config = {
  appName: process.env.APP_NAME || 'weatherops-dashboard',
  appVersion: process.env.APP_VERSION || '1.0.0',
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',

  mockMode: process.env.MOCK_MODE === 'true',

  openMeteoGeocodingUrl:
    process.env.OPEN_METEO_GEOCODING_URL ||
    'https://geocoding-api.open-meteo.com/v1/search',

  openMeteoForecastUrl:
    process.env.OPEN_METEO_FORECAST_URL ||
    'https://api.open-meteo.com/v1/forecast',

  openMeteoLanguage:
    process.env.OPEN_METEO_LANGUAGE || 'ro',

  weatherRequestTimeoutMs:
    Number(process.env.WEATHER_REQUEST_TIMEOUT_MS || 5000),

  cacheTtlSeconds:
    Number(process.env.CACHE_TTL_SECONDS || 300)
};

module.exports = config;