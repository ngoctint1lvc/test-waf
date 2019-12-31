require('dotenv').config();
const chrome = require('./modules/chrome.js');
const dvwa = require('./modules/dvwa.js');
const rawHttp = require('./modules/raw-http.js');
const utils = require('./modules/utils.js');
const yargs = require('yargs');

_argv = yargs
    .command('dvwa <url>', 'Test DVWA web app', {
        headless: {
            description: 'run headless mode or not',
            type: 'boolean',
            default: false
        },
        blockstring: {
            description: 'block string return from server',
            type: 'string',
            default: '403 Forbidden'
        },
        config: {
            description: 'configuration file location',
            type: 'string',
            default: 'test.json',
            alias: 'c'
        }
    })
    .command('raw-http <url>', 'Test Raw HTTP request', {
        blockstring: {
            description: 'block string return from server',
            type: 'string',
            default: '403 Forbidden'
        },
        config: {
            description: 'configuration file location',
            type: 'string',
            default: 'test.json',
            alias: 'c'
        }
    })
    .option('verbose', {
        alias: 'v',
        description: 'verbose',
        type: 'boolean',
        default: false
    })
    .option('output', {
        description: 'output directory',
        type: 'string',
        alias: 'o',
        default: './outputs'
    })
    .help()
    .alias('help', 'h')
    .argv;

if (_argv._.includes('dvwa')) {
    testDVWA();
}
else if (_argv._.includes('raw-http')) {
    testRawHttp();
}
else {
    yargs.showHelp();
}

async function testDVWA() {
    _argv.verbose && console.log('[+] Initializing chromium browser ...');
    await chrome.openBrowser();
    _argv.verbose && console.log('[+] Chromium opened');
    
    let manifest = utils.getAbsolutePath(_argv.config);

    await utils.testAll(dvwa.test, manifest);
    if (_argv.headless) {
        console.log('[+] Closing browser ...');
        await chrome.closeBrowser();
    }
}

async function testRawHttp() {
    let manifest = utils.getAbsolutePath(_argv.config);
    await utils.testAll(rawHttp.test, manifest);
}