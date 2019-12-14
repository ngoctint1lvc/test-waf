const puppeteer = require('puppeteer');
const isHeadless = process.env.HEADLESS === "true";

async function openBrowser() {
    console.log(`Running test with headless is ${isHeadless ? 'on' : 'off'}`);
    global.browser = await puppeteer.launch({ headless: isHeadless });
    global.page = await browser.newPage();

    page.on('dialog', async dialog => {
        setTimeout(() => {
            dialog.dismiss();
        }, 250);
    });
}

/**
 *
 * @param {Array<{selector,payload}>} inputs
 * @param {*} submitSelector
 */
async function submit(inputs, submitSelector) {
    await Promise.all(inputs.map(item => page.waitForSelector(item.selector)));

    await page.evaluate((inputs, submitSelector) => {
        inputs.forEach(item => {
            document.querySelector(item.selector).value = item.payload;
        })
        document.querySelector(submitSelector).click();
    }, inputs, submitSelector);
}

async function isBlocked() {
    let pageHtml = await page.evaluate(() => {
        return document.body.innerHTML;
    });

    return pageHtml.indexOf(process.env.BLOCK_STRING) >= 0;
}

async function clearSiteData() {
    const client = await page.target().createCDPSession();
    await client.send('Network.clearBrowserCookies');
    await client.send('Network.clearBrowserCache');
}

async function goTo(url) {
    const response = await page.goto(url).catch(console.error);
    return response;
}

module.exports = {
    submit,
    goTo,
    clearSiteData,
    openBrowser,
    isBlocked
}
