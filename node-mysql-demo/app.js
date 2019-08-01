var path = require('path');
var fs = require('fs');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var favicon = require('serve-favicon');
var morgan = require('morgan');//日志组件
var FileStreamRotator = require('file-stream-rotator');//分割日志
var ejs = require('ejs');
var app = express();

//获取路由
var userRoute = require('./routes/user');
var studentRoute = require('./routes/student');

//指定渲染模板文件的后缀名为ejs
app.set('view engine', 'ejs');
// 修改模板文件的后缀名为html
app.set('view engine', 'html');
// 运行ejs模块
app.engine('.html', ejs.__express);//engine注册模板引擎的函数，处理指定的后缀名文件，"__express"，ejs模块的一个公共属性，表示要渲染的文件扩展名。

app.use(favicon(__dirname + '/public/img/favicon.png'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'views')));
app.use('/static', express.static('public'));


app.get('/a',function(req,res){

    if(req.cookies.isVisit){
        console.log(req.cookies);
        res.send('欢迎再次进入')
    }else{
        res.cookie('isVisit',1,{maxAge:1000*60*10});
        res.send('欢迎第一次进入')
    }
});

//app.get('/index', function (req,res) {
//    res.render(__dirname+'/share/index');
//});
//app.get('/login', function (req,res) {
//    res.render(__dirname+'/share/login');
//});
//app.get('/home', function (req,res) {
//    res.render(__dirname+'/share/home');
//});


//使用路由
app.use('/user', userRoute);
app.use('/student', studentRoute);

//打印本地日志log
var logStream = fs.createWriteStream(path.join(__dirname,'log/information.log'),{flags:'a'});
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
app.listen(3000,'localhost', function () {
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
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    if (req.url != "/favicon.ico") {
        res.status(err.status || 500);
        //res.render('error', {
        //    message: err.message,
        //    error: {}
        //});
    }
});

module.exports = app;

