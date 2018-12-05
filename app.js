var path = require('path');
var fs = require('fs');
var express = require('express');
var ejs = require('ejs');
var ejsLayout = require('express-ejs-layouts');
// var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var favicon = require('serve-favicon');
var morgan = require('morgan');//日志组件
var FileStreamRotator = require('file-stream-rotator');//分割日志
var app = express();

//基本设置
app.use(favicon(__dirname + '/static/image/404.png'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'views')));
app.use(ejsLayout);
app.set("layout extractScripts", true);
app.set('layout','shared/layout');
app.set('view engine', 'ejs');
app.engine('.ejs', ejs.__express);
app.use(express.static('public'));
app.use('/static', express.static('static'));

//获取路由
var pageRoute = require('./routes');
var apiRoute = require('./routes/apiMiddle');


//使用路由，控制页面跳转、加载等
app.use('/', pageRoute);
//转发后端接口服务器，前端调用
app.use('/frontEnd', apiRoute);


//打印本地日志log
var logDirectory = path.join(__dirname, 'logger');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);//-- ensure log directory exists
var infoLogStream = FileStreamRotator.getStream({//-- create a rotating write stream
    date_format: 'YYYYMMDD',
    filename: path.join(logDirectory, 'log-%DATE%.log'),
    frequency: 'daily',
    verbose: false
});
app.use(morgan('short', {stream: infoLogStream}));//-- setup the logger

//catch 404 and forward to error handler
app.use(function (req, res, next) {
    if(req.url === '/favicon.ico') return;
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    switch (err.status){
        case 404:
            res.render('shared/error-404', {
                title: '404 页面不存在',
               layout: 'shared/error-404'
            });
            break;
        case 500:
            res.render('shared/error-500', {
                title: '500 服务器错误',
                layout: 'shared/error-500'
            });
            break;
        default:
            res.render('shared/error', {
                message: err.message,
                title: 'error 未知错误',
                layout: 'shared/error'
            });
    }
});


//服务启动入口
var server = app.listen(3000, '192.168.3.11', function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("应用启动，访问地址为 http://%s:%s", host, port);
});

module.exports = app;
