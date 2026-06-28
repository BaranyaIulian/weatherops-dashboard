const axios = require('axios');
const config = require('../config/config');
const { getMockWeather } = require('./mock-weather.service');

function normalizeCity(city) {
  return city.trim();
}

function validateCity(city) {
  if (!city || typeof city !== 'string' || city.trim().length === 0) {
    const error = new Error('City query parameter is required.');
    error.statusCode = 400;
    throw error;
  }

  if (city.trim().length < 2) {
    const error = new Error('City name must contain at least 2 characters.');
    error.statusCode = 400;
    throw error;
  }
}

function mapOpenWeatherResponse(data) {
  return {
    city: data.name,
    country: data.sys?.country || 'N/A',
    temperature: data.main?.temp,
    feelsLike: data.main?.feels_like,
    humidity: data.main?.humidity,
    pressure: data.main?.pressure,
    windSpeed: data.wind?.speed,
    description: data.weather?.[0]?.description || 'N/A',
    source: 'openweathermap',
    timestamp: new Date().toISOString()
  };
}

async function getWeatherByCity(city) {
  validateCity(city);

  const normalizedCity = normalizeCity(city);

  if (config.mockMode) {
    return getMockWeather(normalizedCity);
  }

  if (!config.weatherApiKey || config.weatherApiKey === 'replace-me') {
    const error = new Error('Weather API key is not configured.');
    error.statusCode = 503;
    throw error;
  }

  try {
    const response = await axios.get(config.weatherApiUrl, {
      params: {
        q: normalizedCity,
        appid: config.weatherApiKey,
        units: config.weatherUnits
      },
      timeout: 5000
    });

    return mapOpenWeatherResponse(response.data);
  } catch (err) {
    if (err.response?.status === 404) {
      const error = new Error(`City "${normalizedCity}" was not found.`);
      error.statusCode = 404;
      throw error;
    }

    if (err.response?.status === 401) {
      const error = new Error('Invalid Weather API key.');
      error.statusCode = 503;
      throw error;
    }

    const error = new Error('Weather provider is currently unavailable.');
    error.statusCode = 503;
    throw error;
  }
}

module.exports = {
  getWeatherByCity,
  validateCity,
  mapOpenWeatherResponse
};