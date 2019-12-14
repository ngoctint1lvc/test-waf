const lineByLine = require('n-readlines');
const fs = require('fs');

function* readTxtFile(fileName) {
    let line;
    const liner = new lineByLine(fileName);
    while (line = liner.next()) {
        yield line.toString();
    }
}

/**
 *
 * @param {*} payload
 * @param {*} expect
 * @param {*} result
 * @param {{fileName: String, delim: String}} options
 */
function appendResult(payload, expect, result, options) {
    let fileName = options.fileName;
    let delim = options.delim;

    try {
        fs.appendFileSync(fileName, `${payload}${delim}${expect}${delim}${result}\n`);
    }
    catch (err) {
        console.error(err);
    }
}

module.exports = {
    readTxtFile,
    appendResult
}