const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const hasPageContent = async (pageUrl, contentSelector) => {
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox','--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
    await page.goto(pageUrl);
    const hasContent = await page.evaluate((contentSelector) => !!document.querySelector(contentSelector), contentSelector);
    await browser.close();
    return hasContent;
};

module.exports.test = async () => {
    const hasContent = await hasPageContent(
        'https://www.foxtrot.com.ua/ru/shop/igrovye_pristavki_sony_ps5-bluray.html',
        '.product-preorder-button'
    );
    return hasContent;
};
