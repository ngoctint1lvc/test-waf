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
    delete require.cache[require.resolve('./modules/chrome.js')];
    delete require.cache[require.resolve('./modules/dvwa.js')];
    delete require.cache[require.resolve('./modules/utils.js')];
    chrome = require('./modules/chrome.js');
    dvwa = require('./modules/dvwa.js');
}

let chrome = require('./modules/chrome.js');
let dvwa = require('./modules/dvwa.js');
