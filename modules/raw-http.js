const net = require('net');
const utils = require('./utils.js');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

function writeSocket(client, content) {
    return new Promise((resolve, reject) => {
        client.write(content, 'utf8', () => {
            resolve();
        });
    });
}

function connectSocket() {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();
        let host = utils.hostFromUrl(_argv.url);
        client.connect(80, host, function () {
            resolve(client);
        });

        client.on('error', err => {
            console.error(chalk.red('[x] Fail to connect socket'), err);
        });
    });
}

function waitForData(client, timeout = 7000) {
    return new Promise((resolve, reject) => {
        client.on('data', data => {
            resolve(data.toString());
        });

        client.setTimeout(timeout);

        client.on('timeout', () => {
            reject('timeout!');
        })
    })
}

/**
 * @param {{payloadFile: string, type: string, delim: string, isAttack: boolean}} options
 * @param {{string}} manifestPath
 * @param {string} outputPath
 */
async function test(options, manifestPath, outputPath) {
    let payloadFilePath = utils.getAbsolutePath(options.payloadFile, manifestPath);
    let host = utils.hostFromUrl(_argv.url);
    let httpRequests = utils.readHttpRequests(payloadFilePath, options.delim, host);

    let outputFilePath = path.join(outputPath, `${options.type}-output.csv`);
    utils.removeFileIfExists(outputFilePath);

    const headers = [
        'Request',
        'Expected',
        'Result'
    ];

    for (let httpRequest of httpRequests) {
        _argv.verbose && console.log(httpRequest);

        let socket = await connectSocket();
        await writeSocket(socket, httpRequest);

        // save data
        let data = await waitForData(socket).catch(console.error);
        _argv.verbose && data && console.debug(data.toString());
        if (data) {
            // save result of test case
            let isBlocked = false;
            if (data.indexOf(_argv.blockstring) >= 0) {
                if (options.isAttack)
                    console.log(chalk.green("=> ✓ ✓ ✓ Blocked by firewall\n"));
                else
                    console.log(chalk.red("=> X X X False Positive\n"));
                isBlocked = true;
            }
            else {
                if (options.isAttack)
                    console.log(chalk.red("=> X X X Bypass firewall success\n"));
                else
                    console.log(chalk.green("=> ✓ ✓ ✓ True Positive\n"));
            }

            if (options.isAttack) {
                utils.appendCSV(outputFilePath, headers, [
                    httpRequest,
                    'BLOCKED',
                    isBlocked ? 'SUCCESS' : 'FAILED'
                ]);
            }
            else {
                utils.appendCSV(outputFilePath, headers, [
                    httpRequest,
                    'PASS',
                    isBlocked ? 'FAILED' : 'SUCCESS'
                ]);
            }
        }
        else {
            console.error('No data');
        }

        socket.end();
    }
}



module.exports = {
    test
}