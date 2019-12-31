const utils = require('./utils.js');
let chrome = require('./chrome.js');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

/**
 *
 * @param {{url, payloadFile, type, isAttack: boolean, testLocation: {selector, submit}, constValues: Array<{selector,value}> }} options
 */
async function test(options, manifestPath, outputPath) {
    let payloadFilePath = utils.getAbsolutePath(options.payloadFile, manifestPath);
    let payloads = utils.readTxtFile(payloadFilePath);

    let outputFilePath = path.join(outputPath, `${options.type}-output.csv`);
    utils.removeFileIfExists(outputFilePath);

    const headers = [
        'URL',
        'Payload',
        'Expect',
        'Result',
        // 'tag-scores',
        // 'sqli-waf-scores',
        // 'sqli-result',
        // 'xss-waf-scores',
        // 'xss-result',
        // 'lfi-waf-scores',
        // 'lfi-result',
        // 'rfi-waf-scores',
        // 'rfi-result',
        // 'rce-waf-scores',
        // 'rce-result',
        // 'Request ID',
    ];

    for (let payload of payloads) {
        console.log("Testing", payload);

        let isBlocked = false;
        try {
            await chrome.clearSiteData();
            await login();
            await setSecurityLevel("low");
            await chrome.goTo(_argv.url + options.url);

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
                if (options.isAttack)
                    console.log(chalk.green("=> ✓ ✓ ✓ Blocked by firewall\n"));
                else
                    console.log(chalk.red("=> X X X False Positive\n"));
                isBlocked = true;
            } else {
                if (options.isAttack)
                    console.log(chalk.red("=> X X X Bypass firewall success\n"));
                else
                    console.log(chalk.green("=> ✓ ✓ ✓ True Positive\n"));
            }

            if (options.isAttack) {
                utils.appendCSV(outputFilePath, headers, [
                    options.url,
                    payload,
                    'BLOCKED',
                    isBlocked ? 'SUCCESS': 'FAILED'
                ]);
            }
            else {
                utils.appendCSV(outputFilePath, headers, [
                    options.url,
                    payload,
                    'PASS',
                    isBlocked ? 'FAILED' : 'SUCCESS'
                ]);
            }
        } catch (err) {
            console.error(err);
        }
    }
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
    await chrome.goTo(_argv.url);

    await chrome.submit([
        {selector: '.loginInput[type=text]', payload: username},
        {selector: '.loginInput[type=password]', payload: password}
    ], '.submit > input');

    await page.waitForNavigation({waitUntil: 'load'});
}

function isBlockedByFirewall(html) {
    return html.indexOf(_argv.blockstring) >= 0;
}

module.exports = {
    setSecurityLevel,
    login,
    test,
    reset
};
