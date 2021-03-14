const { ucfirst } = require('./utils');

function getPriceDiffIcon(stats) {
  if (stats.length >= 2) {
    const oldPrice = stats[stats.length - 2].price;
    const newPrice = stats[stats.length - 1].price;

    if (!isNaN(oldPrice) && !isNaN(newPrice)) {
      return oldPrice < newPrice ? '↑' : '↓';
    }
  }
  return '';
}

function formatStoreStats(store, stats) {
  const lastStat = stats[stats.length - 1];
  const name = `🛍️ \*${ucfirst(store.name)}*`;
  const available = lastStat.available ? '🟢 Availabe' : '🔴 Unavailable';
  const price = `💰 ${lastStat.price} ${getPriceDiffIcon(stats)}`;
  const link = `🔗 [Open store page](${store.pageUrl})`

  return `${name} \n${available} \n${price} \n${link}`;
}

module.exports.formatStoresStats = (stores, statsKey = 'stats') => {
  return stores.reduce((acc, store) => {
    acc += `${formatStoreStats(store, store[statsKey])} \n\n`;
    return acc;
  }, 
  '');
};