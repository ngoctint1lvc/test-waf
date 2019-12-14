const puppeteer = require('puppeteer');

async function openBrowser() {
    global.browser = await puppeteer.launch({ headless: false });
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

    return pageHtml.indexOf("403 Forbidden") >= 0;
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