const weatherForm = document.getElementById('weatherForm');
const cityInput = document.getElementById('cityInput');
const searchButton = document.getElementById('searchButton');

const statusMessage = document.getElementById('statusMessage');
const weatherResult = document.getElementById('weatherResult');

const refreshHistoryButton =
  document.getElementById('refreshHistoryButton');

const historyList = document.getElementById('historyList');

function setStatus(message, type = 'loading') {
  statusMessage.textContent = message;

  statusMessage.className =
    `status-message visible ${type}`;
}

function clearStatus() {
  statusMessage.textContent = '';
  statusMessage.className = 'status-message';
}

function formatValue(value, suffix = '') {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return `--${suffix}`;
  }

  return `${value}${suffix}`;
}

function formatTemperature(value) {
  if (value === null || value === undefined) {
    return '--°';
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return '--°';
  }

  return `${Math.round(number)}°`;
}

function formatDate(value) {
  if (!value) {
    return '--';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ro-RO', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date);
}

function getWeatherIcon(weatherCode) {
  const code = Number(weatherCode);

  if (code === 0) {
    return '☀️';
  }

  if ([1, 2].includes(code)) {
    return '🌤️';
  }

  if (code === 3) {
    return '☁️';
  }

  if ([45, 48].includes(code)) {
    return '🌫️';
  }

  if (
    [
      51, 53, 55,
      56, 57,
      61, 63, 65,
      66, 67,
      80, 81, 82
    ].includes(code)
  ) {
    return '🌧️';
  }

  if (
    [
      71, 73, 75,
      77, 85, 86
    ].includes(code)
  ) {
    return '❄️';
  }

  if ([95, 96, 99].includes(code)) {
    return '⛈️';
  }

  return '🌡️';
}

function displayWeather(weather) {
  const city = weather.city || 'Oraș necunoscut';

  const country =
    weather.countryName ||
    weather.country ||
    '';

  const region = weather.region || '';

  const locationParts = [region, country]
    .filter(Boolean);

  document.getElementById('locationName').textContent =
    city;

  document.getElementById('locationDetails').textContent =
    locationParts.length > 0
      ? locationParts.join(', ')
      : 'Locație identificată';

  document.getElementById('weatherIcon').textContent =
    getWeatherIcon(weather.weatherCode);

  document.getElementById('temperature').textContent =
    formatTemperature(weather.temperature);

  document.getElementById('weatherDescription').textContent =
    weather.description || 'Condiții meteo indisponibile';

  document.getElementById('feelsLike').textContent =
    formatValue(weather.feelsLike, '°C');

  document.getElementById('humidity').textContent =
    formatValue(weather.humidity, '%');

  document.getElementById('windSpeed').textContent =
    formatValue(weather.windSpeed, ' m/s');

  document.getElementById('windDirection').textContent =
    formatValue(weather.windDirection, '°');

  document.getElementById('precipitation').textContent =
    formatValue(weather.precipitation, ' mm');

  document.getElementById('pressure').textContent =
    formatValue(weather.pressure, ' hPa');

  document.getElementById('observedAt').textContent =
    formatDate(weather.observedAt || weather.timestamp);

  document.getElementById('weatherSource').textContent =
    weather.source || 'necunoscută';

  const hasCoordinates =
    weather.latitude !== null &&
    weather.latitude !== undefined &&
    weather.longitude !== null &&
    weather.longitude !== undefined;

  document.getElementById('coordinates').textContent =
    hasCoordinates
      ? `Coordonate: ${weather.latitude}, ${weather.longitude}`
      : 'Coordonate indisponibile';

  weatherResult.classList.remove('hidden');
}

async function searchWeather(city) {
  searchButton.disabled = true;
  searchButton.textContent = 'Se încarcă...';

  setStatus(
    `Se caută datele meteo pentru ${city}...`,
    'loading'
  );

  try {
    const response = await fetch(
      `/weather?city=${encodeURIComponent(city)}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
        data.error ||
        'Datele meteo nu au putut fi încărcate.'
      );
    }

    displayWeather(data);

    setStatus(
      `Datele pentru ${data.city || city} au fost încărcate.`,
      'success'
    );

    await loadHistory();
  } catch (error) {
    weatherResult.classList.add('hidden');

    setStatus(
      error.message ||
      'A apărut o eroare la încărcarea datelor.',
      'error'
    );
  } finally {
    searchButton.disabled = false;
    searchButton.textContent = 'Caută vremea';
  }
}

function extractHistoryItems(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.items)) {
    return data.items;
  }

  if (Array.isArray(data.history)) {
    return data.history;
  }

  if (Array.isArray(data.results)) {
    return data.results;
  }

  return [];
}

function createHistoryItem(item) {
  const article = document.createElement('article');
  article.className = 'history-item';

  const location = document.createElement('div');
  location.className = 'history-location';

  const cityName = document.createElement('strong');
  cityName.textContent = item.city || 'Oraș necunoscut';

  const date = document.createElement('span');
  date.textContent = formatDate(
    item.observedAt ||
    item.timestamp ||
    item.searchedAt
  );

  location.append(cityName, date);

  const weather = document.createElement('div');
  weather.className = 'history-weather';

  const temperature = document.createElement('strong');
  temperature.textContent =
    formatValue(item.temperature, '°C');

  const description = document.createElement('span');
  description.textContent =
    item.description ||
    item.source ||
    'Căutare meteo';

  weather.append(temperature, description);

  article.append(location, weather);

  article.addEventListener('click', () => {
    const city = item.city;

    if (!city) {
      return;
    }

    cityInput.value = city;
    searchWeather(city);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  return article;
}

async function loadHistory() {
  try {
    const response = await fetch('/history');

    if (!response.ok) {
      throw new Error('Istoricul nu poate fi încărcat.');
    }

    const data = await response.json();
    const items = extractHistoryItems(data);

    historyList.innerHTML = '';

    if (items.length === 0) {
      const emptyMessage = document.createElement('p');

      emptyMessage.className = 'empty-message';
      emptyMessage.textContent =
        'Nu există încă nicio căutare.';

      historyList.appendChild(emptyMessage);
      return;
    }

    items
      .slice()
      .reverse()
      .slice(0, 8)
      .forEach((item) => {
        historyList.appendChild(
          createHistoryItem(item)
        );
      });
  } catch (error) {
    historyList.innerHTML = '';

    const message = document.createElement('p');

    message.className = 'empty-message';
    message.textContent =
      'Istoricul nu este disponibil momentan.';

    historyList.appendChild(message);
  }
}

weatherForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (city.length < 2) {
    setStatus(
      'Introdu un oraș cu minimum 2 caractere.',
      'error'
    );

    cityInput.focus();
    return;
  }

  await searchWeather(city);
});

refreshHistoryButton.addEventListener('click', async () => {
  refreshHistoryButton.disabled = true;
  refreshHistoryButton.textContent = 'Se încarcă...';

  await loadHistory();

  refreshHistoryButton.disabled = false;
  refreshHistoryButton.textContent = 'Actualizează';
});

window.addEventListener('DOMContentLoaded', () => {
  clearStatus();
  loadHistory();
  cityInput.focus();
});