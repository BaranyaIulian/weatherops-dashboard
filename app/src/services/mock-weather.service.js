function getMockWeather(city) {
  const timestamp = new Date().toISOString();

  return {
    city,
    country: 'MOCK',
    countryName: 'Mock Country',
    region: 'Mock Region',
    latitude: 44.4268,
    longitude: 26.1025,

    temperature: 24,
    feelsLike: 24,
    humidity: 45,
    pressure: 1013,

    windSpeed: 3.4,
    windDirection: 180,

    precipitation: 0,
    weatherCode: 0,
    description: 'cer senin',

    source: 'mock',
    timezone: 'Europe/Bucharest',
    observedAt: timestamp,
    timestamp
  };
}

module.exports = {
  getMockWeather
};