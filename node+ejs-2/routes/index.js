var express = require('express');
var routes = express.Router();

//首页
routes.get('/',function (req, res, next) {
    res.render('index', {
        title: '知识说-专业词典'
    });
});

/*
*
*  ****** 专业词典 start ******
*
* */

//快速搜索
routes.get('/dict/qSearch',function (req, res, next) {
    res.render('page/dict/qSearchDict', {
        title: '专业词典'
    });
});

//搜索
routes.get('/dict/search',function (req, res, next) {
    res.render('page/dict/dictDetail', {
        title: '专业词典'
    });
});

//帖子详情
routes.get('/dict/detail',function (req, res, next) {
    res.render('page/dict/topicDetail', {
        title: '帖子详情'
    });
});

/*
*
*  ****** 专业词典 end ******
*
* */

/*
*
* ****** 术语标记 start ******
*
* */

//首页：上传、提取术语
routes.get('/tb',function (req, res, next) {
    res.render('page/tb_mark/index', {
        title: '术语标记'
    });
});
//提取结果
routes.get('/tb/result',function (req, res, next) {
    res.render('page/tb_mark/result', {
        title: '提取结果'
    });
});
//导出术语
routes.get('/tb/export',function (req, res, next) {
    res.render('page/tb_mark/export', {
        title: '导出术语'
    });
});

/*
*
*  ****** 术语标记 end ******
*
* */

module.exports = routes;