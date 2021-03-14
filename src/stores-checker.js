const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { getStores, addStoreStats } = require('./cloud-db');
const { queue, shallowEqual } = require('./utils');

puppeteer.use(StealthPlugin());

async function parsePage(store) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
    await page.goto(store.pageUrl);
    const parsed = await page.evaluate((store) => {
        const preorderStatus = store.preorderSelector ? !!document.querySelector(store.preorderSelector) : null;
        const buyStatus = store.buySelector ? !!document.querySelector(store.buySelector) : null;
        const priceRaw = document.querySelector(store.priceSelector);
        const price = priceRaw ? parseInt(priceRaw.textContent.replace(/\s/g, '')) : null;
        return { ...store, parsedStats: { preorderStatus, buyStatus, price } };
    }, store);
    await browser.close();
    return parsed;
};

function compareStats(parsedPages) {
    return parsedPages.reduce((acc, parsedPage) => {
        const oldStats = parsedPage.stats;
        const newStats = getNewStats(parsedPage);

        if (!oldStats) {
            acc.push({ ...parsedPage, updatedStats: [newStats] });
        } else if (!shallowEqual(oldStats[oldStats.length - 1], newStats, 'available', 'price')) {
            acc.push({ ...parsedPage, updatedStats: [...oldStats, newStats] });
        }
        return acc;
    }, []);
}

function getNewStats(parsedPage) {
    const { preorderStatus, buyStatus, price } = parsedPage.parsedStats;
    let available = undefined;

    if (typeof buyStatus === 'boolean') {
        available = buyStatus;
    } else if (typeof preorderStatus === 'boolean') {
        available = !preorderStatus;
    }

    return { available, price, date: Date.now() };
}

async function saveUpdatedStats(updatedStoresStats) {
    updatedStoresStats.forEach(async (updatedStore) => {
        await addStoreStats(updatedStore.id, updatedStore.updatedStats);
    });
}

module.exports.checkStores = async () => {
    const stores = await getStores();
    const parsedPages = await queue(stores, parsePage);
    const updatedStoresStats = compareStats(parsedPages);
    await saveUpdatedStats(updatedStoresStats);
    return Promise.resolve(updatedStoresStats);
};
