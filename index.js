require('dotenv').config();

// Overwrite global function
var consoleError = console.error;
console.error = (...args) => {
    console.log('-------- Begin of error ---------');
    consoleError(...args);
    console.log('-------- End of error ---------');
}

// using to reload after change without restart chrome browser (using in REPL console)
function reload() {
    delete require.cache[require.resolve('./chrome.js')];
    delete require.cache[require.resolve('./tests/dvwa/script.js')];
    delete require.cache[require.resolve('./utils.js')];
    chrome = require('./chrome.js');
    dvwa = require('./tests/dvwa/script.js');
}

let chrome = require('./chrome.js');
let dvwa = require('./tests/dvwa/script.js');
