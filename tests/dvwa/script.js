const utils = require('../../utils.js');
const fs = require('fs');
let chrome = require('../../chrome.js');
const chalk = require('chalk');

const DVWA_URL = process.env.DVWA_URL;

const LOGIN_URL = `${DVWA_URL}/login.php`;

async function testAll() {
    let testData = JSON.parse(fs.readFileSync(__dirname + '/test.json').toString());
    const outputPath = __dirname + '/outputs/';

    // Create output folder if not exist
    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath);
    }

    // Remove files if exist
    utils.removeFilesInFolder(outputPath);

    for (let item of testData) {
        // TODO: Add performed time to output folder, each perform in one folder
        await test(item, outputPath);
    }
}

/**
 *
 * @param {{url, payloadFile: {attack, normal}, attackType, testLocation: {selector, submit}, constValues: Array<{selector,value}> }} options
 */
async function test(options, outputPath) {
    console.log(`----------- [${options.attackType}] Begin of attack test cases -----------`);
    let fileLocation = require.resolve(options.payloadFile.attack);
    let payloads = utils.readTxtFile(fileLocation);

    const filename = 'output.csv';

    let outputFileName = `${outputPath}${options.attackType}-${filename}`;

    for (let payload of payloads) {
        console.log("Testing", payload);

        let isBlocked = false;
        try {
            await chrome.clearSiteData();
            await login();
            await setSecurityLevel("low");
            await chrome.goTo(DVWA_URL + options.url);

            let formInput = [
                {
                    selector: options.testLocation.selector,
                    payload: payload
                }
            ].concat(options.constValues.map(item => ({
                selector: item.selector,
                payload: item.value
            })));

            await chrome.submit(formInput, options.testLocation.submit);

            await page.waitForNavigation({waitUntil: 'load'});

            let pageHtml = await page.evaluate(() => {
                return document.body.innerHTML;
            });

            if (isBlockedByFirewall(pageHtml)) {
                console.log(chalk.green("=> ✓ ✓ ✓ Blocked by firewall\n"));
                isBlocked = true;
            } else {
                console.log(chalk.red("=> X X X Bypass firewall success\n"));
            }

            utils.appendResult(options.url, payload, 'BLOCKED', isBlocked ? 'SUCCESS' : 'FAILED', {
                fileName: outputFileName
            });
        } catch (err) {
            console.error(err);
        }
    }
    console.log(`----------- [${options.attackType}] End of attack test cases -----------`);

    if (!options.payloadFile.normal) return;
    console.log(`----------- [${options.attackType}] Begin of normal test cases -----------`);

    fileLocation = require.resolve(options.payloadFile.normal);
    payloads = utils.readTxtFile(fileLocation);

    for (let payload of payloads) {
        console.log("Testing", payload);

        let isBlocked = false;
        try {
            await chrome.clearSiteData();
            await login();
            await chrome.goTo(DVWA_URL + options.url);

            let formInput = [
                {
                    selector: options.testLocation.selector,
                    payload: payload
                }
            ].concat(options.constValues.map(item => ({
                selector: item.selector,
                payload: item.value
            })));

            await chrome.submit(formInput, options.testLocation.submit);

            await page.waitForNavigation({waitUntil: 'load'});

            let pageHtml = await page.evaluate(() => {
                return document.body.innerHTML;
            });

            if (isBlockedByFirewall(pageHtml)) {
                console.log(chalk.red("=> X X X False Positive\n"));
                isBlocked = true;
            } else {
                console.log(chalk.green("=> ✓ ✓ ✓ True Positive\n"));
            }

            utils.appendResult(options.url, payload, 'PASS', isBlocked ? 'FAILED' : 'SUCCESS', {
                fileName: outputFileName
            });
        } catch (err) {
            console.error(err);
        }
    }
    console.log(`----------- [${options.attackType}] End of normal test cases -----------`);
}

async function reset(payload) {
    let currentUrl = await page.evaluate(() => {
        return location.href;
    });
    await chrome.clearSiteData();
    await login();
    await setSecurityLevel("low");
    await chrome.goTo(currentUrl);
}

async function setSecurityLevel(level = 'low') {
    await page.setCookie({
        name: 'security',
        value: level
    });
}

async function login(username = 'admin', password = 'password') {
    await chrome.goTo(LOGIN_URL);

    await chrome.submit([
        {selector: '.loginInput[type=text]', payload: username},
        {selector: '.loginInput[type=password]', payload: password}
    ], '.submit > input');

    await page.waitForNavigation({waitUntil: 'load'});
}

function isBlockedByFirewall(html) {
    return html.indexOf(process.env.BLOCK_STRING) >= 0;
}

module.exports = {
    setSecurityLevel,
    login,
    test,
    testAll,
    reset
};
