const express = require('express'),
      routes = express.Router();
const server = require('./promise'),
    getTokenMsg = server.getTokenMessage;

//获取个人简历信息
function getResume(token, uid, callback) {
    getTokenMsg({
        url: '/userExtension/findResumeByUserId',
        token: token,
        data: { userId: uid }
    }).done(redata => {
        const { data, message } = JSON.parse(redata);
        const backData = {
            base: '',
            lanPair: [],
            labelArr: [],
            workExp: [],
            projectExp: []
        };
        if(message === 'success'){
            const areaArr = data.userExtension.area.split(','),
                selfArr = data.userExtension.individualization.split(',');
            backData.labelArr = [...areaArr, ...selfArr];
            backData.workExp = data.workExperienceList;
            backData.projectExp = data.projectExperienceList;
            backData.lanPair = data.userExtendList.slice(0,4);
            backData.base = {
                picturePath: data.picturePath,
                nickName: data.nickName,
                currentPointSummary: data.currentPointSummary,
                translateYear: data.userExtension.translateYear,
                yxTotalScore: data.yxTotalScore
            }
        }
        callback(backData);
    })
}

/*
* personalArticle 
* 文章管理（本人访问）
*
* */
//主页
routes.get('/', function (req, res){
    const token = req.query.t,
        uid = req.query.u;
    getResume(token, uid, function (data) {
        res.render('personalArticle/index', {
            mark: 'article',
            title: '我的主页 | 介绍',
            layout: 'shared/layout',
            data: data
        });
    });
});
//文章列表
routes.get('/list', function (req, res){
    const token = req.query.t,
        uid = req.query.u;
    getResume(token, uid, function (data) {
        res.render('personalArticle/list', {
            mark: 'article',
            title: '我的主页 | 文章列表',
            layout: 'shared/layout',
            data: data
        });
    });
});
//创建文章
routes.get('/create', function (req, res){
    res.render('personalArticle/create', {
        mark: 'article',
        title: '我的主页 | 创建文章',
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
routes.get('/edit', function (req, res){
    const token = req.query.t,
        aid = req.query.aid;
    getTokenMsg({
        url: '/interpreterArticle/InterpreterArticle', //获取文章详情，填充
        token: token,
        data: { articleId: aid }
    }).done(redata => {
        const data = JSON.parse(redata);
        res.render('personalArticle/edit', {
            mark: 'article',
            title: '我的主页 | 编辑文章',
            layout: 'shared/layout',
            data: data
        });
    });
});
//文章详情
routes.get('/detail', function (req, res){
    const token = req.query.t,
          aid = req.query.aid;
    getTokenMsg({
        url: '/interpreterArticle/InterpreterArticle', //获取文章详情
        token: token,
        data: { articleId: aid }
    }).done((redata) => {
        const data = JSON.parse(redata);
        res.render('personalArticle/detail', {
            mark: 'article',
            title: '我的主页 | 文章详情',
            layout: 'shared/layout',
            data: data
        });
    });
});


module.exports = routes;