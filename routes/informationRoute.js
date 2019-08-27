const express = require('express'),
    routes = express.Router();
const server = require('./server');

/*
*
* 首页模块 - 译员风采（啄语）、行业资讯
*
* */

/*
*
* 译员风采
*
* */
//主页
routes.get('/', function(req, res, next){
    res.render('information/index', {
        mark: 'information',
        title: '译员风采 | 文章列表',
        layout: 'shared/layout'
    });
});
//详情
routes.get('/detail', function(req, res, next){
    const uid = req.query.uid,
        aid = req.query.aid;
    //获取文章详情
    let detailData = server.getNoTokenMessage({
        url: '/interpreterArticle/InterpreterArticle',
        data: { articleId: aid }
    });
    //获取译员信息
    let userData = server.getNoTokenMessage({
        url: '/userExtension/findResumeByUserId',
        data: { userId: uid }
    });
    Promise.all([detailData, userData]).done(data => {
        res.render('information/detail', {
            mark: 'information',
            title: '译员风采 | 文章详情',
            layout: 'shared/layout',
            detail: JSON.parse(data[0]),
            userBase: JSON.parse(data[1])
        });
    });
});

/*
*
* 行业资讯
*
* */
//主页
routes.get('/industry', function(req, res, next){
    res.render('information/industry', {
        mark: 'information',
        title: '行业资讯 | 文章列表',
        layout: 'shared/layout'
    });
});
//详情
routes.get('/industryDetail', function(req, res, next){
    const aid = req.query.aid;
    server.getNoTokenMessage({
        url: '/officialArticle/officialArticleDetails',
        data: {
            articleId: aid
        }
    }).then(result => {
        res.render('information/industryDetail', {
            mark: 'information',
            title: '行业资讯 | 文章详情',
            layout: 'shared/layout',
            data: JSON.parse(result)
        });
    });
});


module.exports = routes;