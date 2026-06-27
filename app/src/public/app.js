const form = document.getElementById('weatherForm');
const cityInput = document.getElementById('cityInput');
const weatherResult = document.getElementById('weatherResult');
const errorBox = document.getElementById('errorBox');
const historyList = document.getElementById('historyList');

const localHistory = [];

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove('hidden');
}

function clearError() {
  errorBox.textContent = '';
  errorBox.classList.add('hidden');
}

function renderPlaceholderWeather(city) {
  weatherResult.classList.remove('empty');

  weatherResult.innerHTML = `
    <div class="weather-card">
      <strong>${city}</strong>
      <div class="temp">--°C</div>
      <p class="muted">
        Integrarea cu API-ul meteo va fi implementată în pasul următor.
      </p>
      <div class="weather-details">
        <span>Humidity: --%</span>
        <span>Wind: -- m/s</span>
        <span>Pressure: -- hPa</span>
        <span>Source: pending</span>
      </div>
    </div>
  `;
}

function updateLocalHistory(city) {
  localHistory.unshift({
    city,
    timestamp: new Date().toLocaleString()
  });

  const latest = localHistory.slice(0, 5);

  historyList.innerHTML = latest
    .map((item) => `<li><strong>${item.city}</strong><br><span class="muted">${item.timestamp}</span></li>`)
    .join('');
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (!city) {
    showError('Te rog introdu un oraș.');
    return;
  }

  clearError();
  renderPlaceholderWeather(city);
  updateLocalHistory(city);
  cityInput.value = '';
});