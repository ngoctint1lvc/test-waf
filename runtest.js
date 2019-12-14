require('dotenv').config();
let chrome = require('./chrome.js');
let dvwa = require('./tests/dvwa/script.js');

(async () => {
    await chrome.openBrowser();
    await dvwa.login();
    await dvwa.testAll();
})();
