/**
 * @file exam
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    res.writeHead(200,{"content-type":"text/html"});
    const htmlPath = path.join(__dirname, './index.html');
    const html = fs.readFileSync(htmlPath);
    res.write(html);
    res.end();
});

server.listen(9001, '192.168.1.103', () => {
    console.log('start');
});