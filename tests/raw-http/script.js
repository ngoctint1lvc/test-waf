const { parseResponse } = require('parse-raw-http');

const data = new Buffer([
    'HTTP/1.1 200 OK\r\n',
    'Content-Type: text/plain; charset=utf-8\r\n',
    'Transfer-Encoding: chunked\r\n',
    '\r\n',
    '4\r\n', 'Foo\n',
    '1a\r\n', 'Chunk with 1a=16+10 bytes\n',
].join(''), 'utf8');

const res = parseResponse(data, {
    decodeContentEncoding: true,
});