const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const ping = async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(process.env.HEROKU_URL);
    await browser.close();
};

let counter = 0;
module.exports.startPingSession = async () => {
    setInterval(() => {
        counter += 10;
        const mins = counter / 60;

        if (!(counter % 60)) {
            ping();
            console.log('Ping session:' + mins);
        }
    }, 10_000);
};
