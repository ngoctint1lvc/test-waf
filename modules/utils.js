const lineByLine = require('n-readlines');
const fs = require('fs');
const path = require('path');
const csvWriter = require('csv-writer');

function createFolderIfNotExist(folder) {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }
}

function removeFilesInFolder(directory) {
    fs.readdir(directory, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            fs.unlink(path.join(directory, file), err => {
                if (err) throw err;
            });
        }
    });
}

function removeFileIfExists(filePath) {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

function* readTxtFile(filePath) {
    let line;
    const liner = new lineByLine(filePath);
    while (line = liner.next()) {
        yield line.toString();
    }
}

function* readHttpRequests(filePath, delim, hostName) {
    let httpFile = readTxtFile(filePath);
    
    let currentRequest = '';
    let ignoreLine = false;
    for (let line of httpFile) {
        if (line.search(/^(GET|PUT|POST|DELETE|OPTIONS|TRACE|HEAD|CONNECT|PATCH) /) === 0) {
            if (currentRequest) {
                yield currentRequest;
            }
            ignoreLine = false;
            currentRequest = '';
        }

        if (delim && line.search(delim) === 0) {
            ignoreLine = true;
        }

        if (!ignoreLine)
            currentRequest += line.replace(/^Host: .*$/m, `Host: ${hostName}`) + "\n";
    }
}

/**
 *
 * @param {Array<*>} headers
 * @param {Array<*>} data
 */
async function appendCSV(filePath, headers, data) {
    const createCsvWriter = csvWriter.createArrayCsvWriter;

    if (!fs.existsSync(filePath)) {
        const csvWriter = createCsvWriter({
            path: filePath,
            header: headers,
        });
        await csvWriter.writeRecords([]);
    }

    const csvRecordWriter = createCsvWriter({
        path: filePath,
        header: headers,
        append: true,
    });

    await csvRecordWriter.writeRecords([data]).then(() => {
        _argv.verbose && console.log('...Done');
    });
}

async function testAll(testFunc, manifestFilePath) {
    let testData = require(manifestFilePath);
    const outputPath = getAbsolutePath(_argv.output);

    createFolderIfNotExist(outputPath);

    for (let item of testData) {
        console.log(`-------------Begin of test [${item.type}] ----------------`);
        // TODO: Add performed time to output folder, each perform in one folder
        let manifestDir = path.dirname(manifestFilePath);
        await testFunc(item, manifestDir, outputPath).catch(console.error);
        console.log(`-------------End of test [${item.type}] ----------------`);
    }
}

function getAbsolutePath(currentPath, baseDir = '') {
    baseDir = baseDir? baseDir: process.cwd();
    return path.isAbsolute(currentPath) ? currentPath: path.join(baseDir, currentPath);
}

function hostFromUrl(url) {
    return url.replace(/https?:\/\//, '');
}

module.exports = {
    readTxtFile,
    removeFilesInFolder,
    readHttpRequests,
    appendCSV,
    createFolderIfNotExist,
    testAll,
    getAbsolutePath,
    hostFromUrl,
    removeFileIfExists
};
