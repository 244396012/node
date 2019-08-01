const path = require('path');
const fs = require('fs');
const express = require('express');
const ejs = require('ejs');
const ejsLayout = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const favicon = require('serve-favicon');
const app = express();

//基本设置
app.use(favicon(__dirname + '/static/image/favicon.png'));
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
const pageRoute = require('./routes');
const apiRoute = require('./routes/apiMiddle');

//使用路由，控制页面跳转、加载等
app.use('/', pageRoute);
//转发后端接口服务器，前端调用
app.use('/frontEnd', apiRoute);


//catch 404 and forward to error handler
app.use(function (req, res, next) {
    if(req.url === '/favicon.ico') return;
    const err = new Error('Not Found');
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
            res.render('shared/err404', {
                title: '404 页面不存在',
                layout: 'shared/err404'
            });
            break;
        case 500:
            res.render('shared/err500', {
                title: '500 服务器错误',
                layout: 'shared/err500'
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
const server = app.listen(3001, '0.0.0.0', function () {
    const host = server.address().address;
    const port = server.address().port;
    console.log("应用启动，访问地址为 http://%s:%s", host, port);
});

module.exports = app;
