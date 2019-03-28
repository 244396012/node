const express = require('express');
const http = require('http');
const querystring = require('querystring');
const router = express.Router();

// 接口服务器地址
const connectServer = {
    protocol: 'http://',
    host: '192.168.0.199',
    port: '5790'
};
const serverDomainPort = connectServer.port;
const serverDomainProtocol = connectServer.protocol;
const serverDomainHost = connectServer.host;
const serverDomain = serverDomainProtocol + serverDomainHost + ':' + serverDomainPort;

// 定义一个通用 Get 接口，转接所有数据
router.get('*', function(req, res) {
    let reqUrl = serverDomain + req.url;
    http.get(reqUrl, function(sres) {
        let statusCode = sres.statusCode;
        let contentType = sres.headers['content-type'];
        let error;
        if (statusCode !== 200) {
            error = new Error(`Request Failed.\n` + `Status Code: ${statusCode}`);
        } else if (!/^application\/json/.test(contentType)) {
            error = new Error(`Invalid content-type.\n` + `Expected application/json but received ${contentType}`);
        }
        if (error) {
            // consume response data to free up memory
            sres.resume();
            res.status(500).end();
            return;
        }
        sres.setEncoding('utf8');
        let rawData = '';
        sres.on('data', function(chunk) {
            rawData += chunk;
        });
        sres.on('end', function() {
            try {
                let parsedData = JSON.parse(rawData);
                res.json(parsedData);
            } catch (e) {
                res.status(500).send(e.message);
            }
        });
    }).on('error', function(e) {
        console.log(`Got error: ${e.message}`);
        res.status(500).end();
    });
});

// 定义一个通用的 Post 接口，转接所有数据
router.post('*', function(req, res) {
    let reqUrl = serverDomain + req.url;
    let reqContentType = req.headers['content-type'];
    let reqBody = req.body;
    // 根据 请求的 content-type 判断用哪种格式化方式
    let reqData = reqContentType.indexOf('json') !== -1 ? JSON.stringify(reqBody) : querystring.stringify(reqBody);
    let postOpt = {
        host: serverDomainHost,
        port: serverDomainPort,
        path: req.url,
        method: 'POST',
        headers: {
            'Content-Type': reqContentType
        }
    };
    let sreq = http.request(postOpt, function(sres) {
        let rowData = '';
        let error;
        if (sres.statusCode !== 200) {
            error = new Error(`Request Failed.\n` + `Status Code: ${sres.statusCode}`)
        }
        if (error) {
            console.log(error.message);
            sres.resume();
            res.status(500).end();
            return;
        }
        sres.on('data', function(data) {
            rowData += data;
        });
        sres.on('end', function() {
            try {
                let parsedData = JSON.parse(rowData);
                res.json(parsedData);
            } catch (e) {
                console.log(e.message);
                res.status(500).send(e.message);
            }
        });
        sres.on('error', function() {
            console.log('[ERROR] when req url:', reqUrl, reqData);
            res.status(500).send('error');
        });
    });
    sreq.write(reqData);
    sreq.end();
});

module.exports = router;