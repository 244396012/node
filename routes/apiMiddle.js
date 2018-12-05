var express = require('express');
var http = require('http');
var querystring = require('querystring');
var router = express.Router();

// 接口服务器地址
var connectServer = {
    port: '8105',
    protocol: 'http://',
    host: 'ot.lan-bridge.com.cn'
};
var serverDomainPort = connectServer.port;
var serverDomainProtocol = connectServer.protocol;
var serverDomainHost = connectServer.host;
var serverDomain = serverDomainProtocol + serverDomainHost + ':' + serverDomainPort;

// 定义一个通用 Get 接口，转接所有数据
router.get('*', function(req, res) {
    var reqUrl = serverDomain + req.url;
    http.get(reqUrl, function(sres) {
        var statusCode = sres.statusCode;
        var contentType = sres.headers['content-type'];
        var error;
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
        var rawData = '';
        sres.on('data', function(chunk) {
            rawData += chunk;
        });
        sres.on('end', function() {
            try {
                var parsedData = JSON.parse(rawData);
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
    var reqUrl = serverDomain + req.url;
    var reqContentType = req.headers['content-type'];
    var reqBody = req.body;
    // 根据 请求的 content-type 判断用哪种格式化方式
    var reqData = reqContentType.indexOf('json') !== -1 ? JSON.stringify(reqBody) : querystring.stringify(reqBody);
    var postOpt = {
        host: serverDomainHost,
        port: serverDomainPort,
        path: req.url,
        method: 'POST',
        headers: {
            'Content-Type': reqContentType
        }
    };
    var sreq = http.request(postOpt, function(sres) {
        var rowData = '';
        var error;
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
                var parsedData = JSON.parse(rowData);
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