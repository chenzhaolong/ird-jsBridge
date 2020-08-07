/**
 * @file exam
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    // 不管是什么请求，对文件的请求的话，应该是针对后缀名进行内容读取发放。
    let suffix = req.url.substr(req.url.length - 2, req.url.length);
    console.log(req.url)
    if (suffix === 'js') {
        res.writeHead(200,{"content-type":"application/javascript"});
        let jsPath;
        if (req.url === '/ird-RnBridge/dist/RnBridge.js') {
            jsPath = path.join(__dirname, '../ird-RnBridge/dist/RnBridge.js');
        } else if (req.url === '/superagent.js') {
            jsPath = path.join(__dirname, './superagent.js');
        } else if (req.url === '/axios.js') {
            jsPath = path.join(__dirname, './axios.js');
        }

        const js = fs.readFileSync(jsPath);
        res.write(js);
        res.end();
    }  else if (req.url === '/demo/a') {
        res.write('jinao');
        res.end();
    } else if (req.url === '/demo/a1') {
        res.writeHead(400);
        res.end();
    } else {
        res.writeHead(200,{"content-type":"text/html"});
        const htmlPath = path.join(__dirname, './index.html');
        const html = fs.readFileSync(htmlPath);
        res.write(html);
        res.end();
    }
});

server.listen(9001, '192.168.1.102', () => {
    console.log('start');
});