const lineByLine = require('n-readlines');
const fs = require('fs');
const path = require('path');

const removeFilesInFolder = function (directory) {
    fs.readdir(directory, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            fs.unlink(path.join(directory, file), err => {
                if (err) throw err;
            });
        }
    });
}

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
 * @param {{fileName: String}} options
 */
function appendResult(url, payload, expect, result, score = {}, options) {
    let fileName = options.fileName;

    const header = [
        {id: 'url', title: 'URL'},
        {id: 'payload', title: 'Payload'},
        {id: 'expect', title: 'Expect'},
        {id: 'result', title: 'Result'},
        {id: 'x-rule-tag-scores', title: 'tag-scores'},
        {id: 'x-rule-sqli-waf-scores', title: 'sqli-waf-scores'},
        {id: 'x-rule-sqli-result', title: 'sqli-result'},
        {id: 'x-rule-xss-waf-scores', title: 'xss-waf-scores'},
        {id: 'x-rule-xss-result', title: 'xss-result'},
        {id: 'x-rule-lfi-waf-scores', title: 'lfi-waf-scores'},
        {id: 'x-rule-lfi-result', title: 'lfi-result'},
        {id: 'x-rule-rfi-waf-scores', title: 'rfi-waf-scores'},
        {id: 'x-rule-rfi-result', title: 'rfi-result'},
        {id: 'x-rule-rce-waf-scores', title: 'rce-waf-scores'},
        {id: 'x-rule-rce-result', title: 'rce-result'},
        {id: 'x-polaris-requestid', title: 'Request ID'},
    ];

    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
    if (!fs.existsSync(fileName)) {
        const csvWriter = createCsvWriter({
            path: fileName,
            header,
        });
        csvWriter.writeRecords({});
    }

    const csvRecordWriter = createCsvWriter({
        path: fileName,
        header,
        append: true,
    });

    const records = [
        {
            url,
            payload,
            expect,
            result,
            ...score,
        },
    ];

    csvRecordWriter.writeRecords(records).then(() => {
        console.log('...Done');
    });
}

module.exports = {
    readTxtFile,
    appendResult,
    removeFilesInFolder,
};
