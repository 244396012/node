const path = require('path');
// const fs = require('fs');
// const https = require('https');
const express = require('express');
const ejs = require('ejs');
const ejsLayout = require('express-ejs-layouts');
const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
const favicon = require('serve-favicon');
const compression = require('compression');
/*
*
"express-session": "^1.15.6",
"file-stream-rotator": "^0.2.0",
"morgan": "^1.9.0",
*
var session = require('express-session');
var morgan = require('morgan');//日志组件
var FileStreamRotator = require('file-stream-rotator');//分割日志
*
* */
const app = express();

//基本设置
app.use(favicon(__dirname + '/static/image/404.png'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'views')));
app.use(ejsLayout);
app.set("layout extractScripts", true);
app.set('layout','shared/layout');
app.set('view engine', 'ejs');
app.engine('.ejs', ejs.__express);
app.use(express.static('public', {
    //'maxAge': '2h'
}));
app.use('/static', express.static('static', {
    //static里面的文件不会更改，设置缓存时长30天
    // 'maxAge': '30d',
    // 'Expires': '30d',
    'ETag': false,
    'lastModified': false
}));
app.use(compression());//gzip

//获取路由
const pageRoute = require('./routes'),
      pageInfoRoute = require('./routes/informationRoute'),
      pageUserRoute = require('./routes/userRoute'),
      pageUserArticleRoute = require('./routes/userArticleRoute'),
      pageArticleRoute = require('./routes/articleRoute');
const pageActivityRoute = require('./routes/activityRoute');


//使用路由，控制页面跳转、加载
app.use('/', pageRoute);
app.use('/information', pageInfoRoute);
app.use('/personal', pageUserRoute);
app.use('/personalArticle', pageUserArticleRoute);
app.use('/article', pageArticleRoute);
app.use('/activity', pageActivityRoute);

/*
*
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
*
* */

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
            res.render('shared/404', {
                title: '404 页面不存在',
                layout: 'shared/404'
            });
            break;
        default:
            res.render('shared/500', {
                message: err.message,
                title: '500 服务器错误',
                layout: 'shared/500'
            });
    }
});

//https证书
// const httpsOption = {
//     key: fs.readFileSync('./ce/private.pem','utf8'),
//     cert: fs.readFileSync('./ce/file.crt','utf8'),
//     passphrase: '123456'
// };

//服务启动入口
// const httpsServer = https.createServer(httpsOption, app).listen(3001, '0.0.0.0', function () {
//     const host = httpsServer.address().address;
//     const port = httpsServer.address().port;
//     console.log("应用启动，访问地址为 https://%s:%s", host, port);
// });

const server = app.listen(3001, '0.0.0.0', function () {
    const host = server.address().address;
    const port = server.address().port;
    console.log("应用启动，访问地址为 http://%s:%s", host, port);
});
