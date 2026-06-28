const form = document.getElementById('weatherForm');
const cityInput = document.getElementById('cityInput');
const weatherResult = document.getElementById('weatherResult');
const errorBox = document.getElementById('errorBox');
const historyList = document.getElementById('historyList');

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove('hidden');
}

function clearError() {
  errorBox.textContent = '';
  errorBox.classList.add('hidden');
}

function setLoadingState(city) {
  weatherResult.classList.remove('empty');
  weatherResult.innerHTML = `
    <div class="weather-card">
      <strong>${city}</strong>
      <p class="muted">Se încarcă datele meteo...</p>
    </div>
  `;
}

function renderWeather(weather) {
  weatherResult.classList.remove('empty');

  weatherResult.innerHTML = `
    <div class="weather-card">
      <strong>${weather.city}, ${weather.country}</strong>
      <div class="temp">${weather.temperature}°C</div>
      <p class="muted">${weather.description}</p>

      <div class="weather-details">
        <span>Feels like: ${weather.feelsLike ?? 'N/A'}°C</span>
        <span>Humidity: ${weather.humidity}%</span>
        <span>Wind: ${weather.windSpeed} m/s</span>
        <span>Pressure: ${weather.pressure} hPa</span>
        <span>Source: ${weather.source}</span>
        <span>Time: ${new Date(weather.timestamp).toLocaleTimeString()}</span>
      </div>
    </div>
  `;
}

function renderHistory(history) {
  if (!history.items || history.items.length === 0) {
    historyList.innerHTML = '<li class="muted">Nu există căutări în istoric.</li>';
    return;
  }

  historyList.innerHTML = history.items
    .map((item) => {
      const statusLabel = item.status === 'success' ? 'success' : 'failed';
      const temperature =
        item.temperature !== null && item.temperature !== undefined
          ? `${item.temperature}°C`
          : 'N/A';

      return `
        <li>
          <strong>${item.city}, ${item.country}</strong>
          <br />
          <span class="muted">
            ${temperature} | ${item.description} | ${statusLabel}
          </span>
          <br />
          <span class="muted">
            source: ${item.source} | ${new Date(item.timestamp).toLocaleString()}
          </span>
        </li>
      `;
    })
    .join('');
}

async function fetchWeather(city) {
  const response = await fetch(`/weather?city=${encodeURIComponent(city)}`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Weather request failed.');
  }

  return data;
}

async function fetchHistory() {
  const response = await fetch('/history');
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'History request failed.');
  }

  return data;
}

async function refreshHistory() {
  try {
    const history = await fetchHistory();
    renderHistory(history);
  } catch (error) {
    historyList.innerHTML = '<li class="muted">Istoricul nu poate fi încărcat.</li>';
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (!city) {
    showError('Te rog introdu un oraș.');
    return;
  }

  clearError();
  setLoadingState(city);

  try {
    const weather = await fetchWeather(city);
    renderWeather(weather);
    await refreshHistory();
    cityInput.value = '';
  } catch (error) {
    showError(error.message);
    weatherResult.classList.add('empty');
    weatherResult.innerHTML = '<p>Nu există date meteo disponibile.</p>';
    await refreshHistory();
  }
});

refreshHistory();