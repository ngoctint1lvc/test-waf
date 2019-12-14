const LOGIN_URL = 'http://localhost/login.php';
const DELIMITER_CHAR = '[[<=>]]';
const utils = require('../../utils.js');
const fs = require('fs');

let chrome = require('../../chrome.js');

async function testAll() {
    let testData = JSON.parse(fs.readFileSync(__dirname + '/test.json').toString());
    for (let item of testData) {
        await test(item);
    }
}

/**
 *
 * @param {{url, payloadFile: {attack, normal}, attackType, testLocation: {selector, submit}, constValues: Array<{selector,value}> }} options
 */
async function test(options) {
    console.log(`----------- [${options.attackType}] Begin of attack test cases -----------`);
    let fileLocation = require.resolve(options.payloadFile.attack);
    let payloads = utils.readTxtFile(fileLocation);
    let outputFileName = __dirname + `/outputs/${options.attackType} output.csv`;

    for (let payload of payloads) {
        console.log("Testing", payload);

        let isBlocked = false;
        try {
            await chrome.clearSiteData();
            await login();
            await setSecurityLevel("low");
            await chrome.goTo(options.url);

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

            await page.waitForNavigation({ waitUntil: 'load' });

            if (await chrome.isBlocked()) {
                console.log("Fail to bypass firewall");
                isBlocked = true;
            }
            else {
                console.log("Bypass firewall success");
            }

            utils.appendResult(payload, 'BLOCKED', isBlocked ? 'SUCCESS' : 'FAILED', {
                fileName: outputFileName,
                delim: DELIMITER_CHAR
            });
        }
        catch (err) {
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
            await chrome.goTo(options.url);

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

            await page.waitForNavigation({ waitUntil: 'load' });

            if (await chrome.isBlocked()) {
                console.log("Why firewall block me!");
                isBlocked = true;
            }

            utils.appendResult(payload, 'PASS', isBlocked ? 'FAILED' : 'SUCCESS', {
                fileName: outputFileName,
                delim: DELIMITER_CHAR
            });
        }
        catch (err) {
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
        { selector: '.loginInput[type=text]', payload: username },
        { selector: '.loginInput[type=password]', payload: password }
    ], '.submit > input');

    await page.waitForNavigation({ waitUntil: 'load' });
}

module.exports = {
    setSecurityLevel,
    login,
    test,
    testAll,
    reset
};