const axios = require('axios');
const config = require('../config/config');
const { getMockWeather } = require('./mock-weather.service');

function createServiceError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeCity(city) {
  return city.trim();
}

function validateCity(city) {
  if (!city || typeof city !== 'string' || city.trim().length === 0) {
    throw createServiceError('City query parameter is required.', 400);
  }

  if (city.trim().length < 2) {
    throw createServiceError(
      'City name must contain at least 2 characters.',
      400
    );
  }

  if (city.trim().length > 100) {
    throw createServiceError('City name is too long.', 400);
  }
}

function getWeatherDescription(weatherCode) {
  const code = Number(weatherCode);

  switch (code) {
    case 0:
      return 'cer senin';

    case 1:
      return 'predominant senin';

    case 2:
      return 'parțial noros';

    case 3:
      return 'cer acoperit';

    case 45:
      return 'ceață';

    case 48:
      return 'ceață cu depunere de chiciură';

    case 51:
      return 'burniță slabă';

    case 53:
      return 'burniță moderată';

    case 55:
      return 'burniță densă';

    case 56:
      return 'burniță înghețată slabă';

    case 57:
      return 'burniță înghețată densă';

    case 61:
      return 'ploaie slabă';

    case 63:
      return 'ploaie moderată';

    case 65:
      return 'ploaie puternică';

    case 66:
      return 'ploaie înghețată slabă';

    case 67:
      return 'ploaie înghețată puternică';

    case 71:
      return 'ninsoare slabă';

    case 73:
      return 'ninsoare moderată';

    case 75:
      return 'ninsoare puternică';

    case 77:
      return 'grăunțe de zăpadă';

    case 80:
      return 'averse slabe';

    case 81:
      return 'averse moderate';

    case 82:
      return 'averse puternice';

    case 85:
      return 'averse slabe de zăpadă';

    case 86:
      return 'averse puternice de zăpadă';

    case 95:
      return 'furtună';

    case 96:
      return 'furtună cu grindină slabă';

    case 99:
      return 'furtună cu grindină puternică';

    default:
      return 'condiții meteo necunoscute';
  }
}

async function geocodeCity(city) {
  try {
    const response = await axios.get(config.openMeteoGeocodingUrl, {
      params: {
        name: city,
        count: 1,
        language: config.openMeteoLanguage,
        format: 'json'
      },
      timeout: config.weatherRequestTimeoutMs
    });

    const location = response.data?.results?.[0];

    if (!location) {
      throw createServiceError(`City "${city}" was not found.`, 404);
    }

    return {
      name: location.name,
      country: location.country || null,
      countryCode: location.country_code || null,
      region: location.admin1 || null,
      latitude: location.latitude,
      longitude: location.longitude,
      timezone: location.timezone || 'auto'
    };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    const providerReason = error.response?.data?.reason;

    throw createServiceError(
      providerReason
        ? `Open-Meteo geocoding error: ${providerReason}`
        : 'Open-Meteo geocoding service is currently unavailable.',
      503
    );
  }
}

function mapOpenMeteoResponse(location, data) {
  const current = data?.current;

  if (!current) {
    throw createServiceError(
      'Open-Meteo returned an invalid weather response.',
      502
    );
  }

  return {
    city: location.name,
    country: location.countryCode || location.country || 'N/A',
    countryName: location.country,
    region: location.region,

    latitude: location.latitude,
    longitude: location.longitude,

    temperature: current.temperature_2m,
    feelsLike: current.apparent_temperature,
    humidity: current.relative_humidity_2m,
    pressure: current.pressure_msl,

    windSpeed: current.wind_speed_10m,
    windDirection: current.wind_direction_10m,

    precipitation: current.precipitation,
    weatherCode: current.weather_code,
    description: getWeatherDescription(current.weather_code),

    source: 'open-meteo',
    timezone: data.timezone || location.timezone,
    observedAt: current.time,
    timestamp: new Date().toISOString()
  };
}

async function fetchOpenMeteoWeather(location) {
  try {
    const response = await axios.get(config.openMeteoForecastUrl, {
      params: {
        latitude: location.latitude,
        longitude: location.longitude,

        current: [
          'temperature_2m',
          'relative_humidity_2m',
          'apparent_temperature',
          'precipitation',
          'weather_code',
          'pressure_msl',
          'wind_speed_10m',
          'wind_direction_10m'
        ].join(','),

        temperature_unit: 'celsius',
        wind_speed_unit: 'ms',
        precipitation_unit: 'mm',
        timezone: 'auto'
      },
      timeout: config.weatherRequestTimeoutMs
    });

    return mapOpenMeteoResponse(location, response.data);
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    const providerReason = error.response?.data?.reason;

    throw createServiceError(
      providerReason
        ? `Open-Meteo forecast error: ${providerReason}`
        : 'Open-Meteo weather service is currently unavailable.',
      503
    );
  }
}

async function getWeatherByCity(city) {
  validateCity(city);

  const normalizedCity = normalizeCity(city);

  if (config.mockMode) {
    return getMockWeather(normalizedCity);
  }

  const location = await geocodeCity(normalizedCity);

  return fetchOpenMeteoWeather(location);
}

module.exports = {
  getWeatherByCity,
  validateCity,
  geocodeCity,
  fetchOpenMeteoWeather,
  mapOpenMeteoResponse,
  getWeatherDescription
};