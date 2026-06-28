function getMockWeather(city) {
  return {
    city,
    country: 'MOCK',
    temperature: 24,
    humidity: 45,
    pressure: 1013,
    windSpeed: 3.4,
    description: 'mock clear sky',
    source: 'mock',
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  getMockWeather
};