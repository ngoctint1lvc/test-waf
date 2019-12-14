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
function appendResult(url, payload, expect, result, options) {
    let fileName = options.fileName;

    const header = [
        {id: 'url', title: 'URL'},
        {id: 'payload', title: 'Payload'},
        {id: 'expect', title: 'Expect'},
        {id: 'result', title: 'Result'}
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
            result
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
