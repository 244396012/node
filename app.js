var path = require('path');
var fs = require('fs');
var express = require('express');
var ejs = require('ejs');
var ejsLayout = require('express-ejs-layouts');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var favicon = require('serve-favicon');
var morgan = require('morgan');//日志组件
var FileStreamRotator = require('file-stream-rotator');//分割日志
var app = express();

//基本设置
// app.use(favicon(__dirname + '/static/image/favicon.png'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'views')));
app.set('view engine', 'ejs');
app.use(ejsLayout);
app.engine('.ejs', ejs.__express);
app.use('/public', express.static('public'));
app.use('/static', express.static('static'));

//获取路由
var indexRoute = require('./routes/index');

//使用路由
app.use('/', indexRoute);


//打印本地日志log
// var logStream = fs.createWriteStream(path.join(__dirname,'log/information.log'),{flags:'a'});
var logDirectory = path.join(__dirname, 'log');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);//-- ensure log directory exists
var infoLogStream = FileStreamRotator.getStream({//-- create a rotating write stream
    date_format: 'YYYYMMDD',
    filename: path.join(logDirectory, 'information-%DATE%.log'),
    frequency: 'daily',
    verbose: false
});
app.use(morgan('short', {stream: infoLogStream}));//-- setup the logger

//服务启动入口
app.listen(80,'localhost', function () {
    console.log('服务已启动');
});

//catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        switch (err.status){
            case 404:
                res.render('error-404', {
                    title: '404 页面不存在',
                    layout: 'error-404'
                });
                break;
            case 500:
                res.render('error-500', {
                    title: '500 服务器错误',
                    layout: 'error-500'
                });
                break;
            default:
                res.render('error', {
                    message: err.message,
                    title: 'error 错误',
                    layout: 'error'
                });
        }
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    if (req.url !== "/favicon.ico") {
        res.status(err.status || 500);
        res.render('error', {
           message: err.message,
           error: {}
        });
    }
});

module.exports = app;

