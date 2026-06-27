const MAX_HISTORY_ITEMS = 100;

const searchHistory = [];

function addHistoryItem(weather, status = 'success') {
  const item = {
    city: weather.city,
    country: weather.country,
    temperature: weather.temperature,
    description: weather.description,
    source: weather.source,
    status,
    timestamp: new Date().toISOString()
  };

  searchHistory.unshift(item);

  if (searchHistory.length > MAX_HISTORY_ITEMS) {
    searchHistory.pop();
  }

  return item;
}

function addFailedHistoryItem(city, errorMessage) {
  const item = {
    city: city || 'unknown',
    country: 'N/A',
    temperature: null,
    description: errorMessage,
    source: 'N/A',
    status: 'failed',
    timestamp: new Date().toISOString()
  };

  searchHistory.unshift(item);

  if (searchHistory.length > MAX_HISTORY_ITEMS) {
    searchHistory.pop();
  }

  return item;
}

function getHistory() {
  return searchHistory;
}

function clearHistory() {
  searchHistory.length = 0;
}

module.exports = {
  addHistoryItem,
  addFailedHistoryItem,
  getHistory,
  clearHistory
};