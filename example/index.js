/**
 * @file exam
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    // 不管是什么请求，对文件的请求的话，应该是针对后缀名进行内容读取发放。
    let suffix = req.url.substr(req.url.length - 2, req.url.length);
    if (suffix === 'js') {
        res.writeHead(200,{"content-type":"application/javascript"});
        const htmlPath = path.join(__dirname, '../ird-RnBridge/dist/RnBridge.js');
        const html = fs.readFileSync(htmlPath);
        res.write(html);
        res.end();
    } else {
        res.writeHead(200,{"content-type":"text/html"});
        const htmlPath = path.join(__dirname, './index.html');
        const html = fs.readFileSync(htmlPath);
        res.write(html);
        res.end();
    }
});

server.listen(9001, '192.168.1.103', () => {
    console.log('start');
});