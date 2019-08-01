const express = require('express'),
      routes = express.Router();
const server = require('./server');

/*
* personalArticle 
* 文章管理（本人访问）
*
* */
//主页
routes.get('/', function (req, res, next){
    const token = req.query.t,
        uid = req.query.u;
    server.getMessage({
        url: '/userExtension/findResumeByUserId', //获取个人简历信息
        token: token,
        data: { userId: uid }
    }).done(response => {
        const { data } = JSON.parse(response);
        const rebackData = {
            base: '',
            lanPair: [],
            labelArr: [],
            workExp: [],
            projectExp: []
        };
        if(JSON.parse(response).message === 'success'){
            const areaArr = data.userExtension.area.split(','),
                selfArr = data.userExtension.individualization.split(',');
            rebackData.labelArr = [...areaArr, ...selfArr];
            rebackData.workExp = data.workExperienceList;
            rebackData.projectExp = data.projectExperienceList;
            rebackData.lanPair = data.userExtendList.slice(0,4);
            rebackData.base = {
                picturePath: data.picturePath,
                nickName: data.nickName,
                currentPointSummary: data.currentPointSummary,
                translateYear: data.userExtension.translateYear,
                yxTotalScore: data.yxTotalScore
            }
        }
        res.render('personalArticle/index', {
            mark: 'article',
            title: '我的主页-介绍',
            layout: 'shared/layout',
            data: rebackData
        });
    });
});
//文章列表
routes.get('/list', function (req, res, next){
    const token = req.query.t,
        uid = req.query.u;
    server.getMessage({
        url: '/userExtension/findResumeByUserId', //获取个人简历信息
        token: token,
        data: { userId: uid }
    }).done(response => {
        const { data } = JSON.parse(response);
        const rebackData = {
            base: '',
            lanPair: [],
            labelArr: [],
            workExp: [],
            projectExp: []
        };
        if(JSON.parse(response).message === 'success'){
            const areaArr = data.userExtension.area.split(','),
                selfArr = data.userExtension.individualization.split(',');
            rebackData.labelArr = [...areaArr, ...selfArr];
            rebackData.workExp = data.workExperienceList;
            rebackData.projectExp = data.projectExperienceList;
            rebackData.lanPair = data.userExtendList.slice(0,4);
            rebackData.base = {
                picturePath: data.picturePath,
                nickName: data.nickName,
                currentPointSummary: data.currentPointSummary,
                translateYear: data.userExtension.translateYear,
                yxTotalScore: data.yxTotalScore
            }
        }
        res.render('personalArticle/list', {
            mark: 'article',
            title: '我的主页-文章列表',
            layout: 'shared/layout',
            data: rebackData
        });
    });
});
//创建文章
routes.get('/create', function (req, res, next){
    res.render('personalArticle/create', {
        mark: 'article',
        title: '我的主页-创建文章',
        layout: 'shared/layout'
    });
});
//预览文章
routes.get('/preview', function (req, res) {
    res.render('personalArticle/preview', {
        mark: 'article',
        title: '发布预览',
        layout: 'shared/layout'
    });
});
//编辑文章
routes.get('/edit', function (req, res, next){
    const token = req.query.t,
        aid = req.query.aid;
    server.getMessage({
        url: '/interpreterArticle/InterpreterArticle', //获取文章详情，填充
        token: token,
        data: { articleId: aid }
    }).done((data) => {
        const _data = JSON.parse(data);
        res.render('personalArticle/edit', {
            mark: 'article',
            title: '我的主页-编辑文章',
            layout: 'shared/layout',
            data: _data
        });
    });
});
//文章详情
routes.get('/detail', function (req, res, next){
    const token = req.query.t,
          aid = req.query.aid;
    server.getMessage({
        url: '/interpreterArticle/InterpreterArticle', //获取文章详情
        token: token,
        data: { articleId: aid }
    }).done((data) => {
        const _data = JSON.parse(data);
        res.render('personalArticle/detail', {
            mark: 'article',
            title: '我的主页-文章详情',
            layout: 'shared/layout',
            data: _data
        });
    });
});


module.exports = routes;