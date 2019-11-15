const express = require('express'),
      routes = express.Router();
const server = require('./promise'),
    getNoTokenMsg = server.getNoTokenMessage;

//获取个人简历(no token)
function getResume(uid, callback) {
    getNoTokenMsg({
        url: '/userExtension/findResumeByUserId', //获取个人简历信息
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
                id: data.id,
                picturePath: data.picturePath,
                nickName: data.nickName,
                currentPointSummary: data.currentPointSummary,
                translateYear: data.userExtension.translateYear,
                yxTotalScore: data.yxTotalScore
            }
        }
        callback(backData)
    })
}


/*
* article
* 文章管理（非本人访问）
*
* */
//主页
routes.get('/', function(req, res){
    const uid = req.query.uid;
    getResume(uid, function (data) {
        let title = data.base.nickName?'"' + data.base.nickName+'"的主页':'XXX的主页';
        res.render('article/index', {
            mark: 'article',
            title: title,
            layout: 'shared/layout',
            data: data
        });
    })
});
//文章
routes.get('/list', function (req, res){
    const uid = req.query.uid;
    getResume(uid, function (data) {
        let title =  data.base.nickName?'"'+data.base.nickName+'"的文章':'XXX的文章';
        res.render('article/list', {
            mark: 'article',
            title: title,
            layout: 'shared/layout',
            data: data
        });
    })
});
//文章详情
routes.get('/detail', function (req, res){
    const uid = req.query.uid,
        aid = req.query.aid;
    //获取文章详情
    let detailData = getNoTokenMsg({
        url: '/interpreterArticle/InterpreterArticle',
        data: { articleId: aid }
    });
    //获取译员信息
    let userData = getNoTokenMsg({
        url: '/userExtension/findResumeByUserId',
        data: { userId: uid }
    });
    Promise.all([detailData, userData]).done(data => {
        const articleBase = JSON.parse(data[0]),
            title = articleBase.data.articleTitle ? articleBase.data.articleTitle : 'XXX的文章详情';
        res.render('article/detail', {
            mark: 'article',
            title: title,
            layout: 'shared/layout',
            detail: JSON.parse(data[0]),
            userBase: JSON.parse(data[1])
        });
    })
});

/*
*
* 啄语者说
*
* */
//主页
routes.get('/pecker', function(req, res){
    res.render('article/pecker', {
        mark: 'information',
        title: '啄语者说',
        layout: 'shared/layout'
    });
});


/*
*
* 行业资讯
*
* */
//主页
routes.get('/industry', function(req, res){
    res.render('article/industry', {
        mark: 'information',
        title: '行业资讯',
        layout: 'shared/layout'
    });
});
//详情
routes.get('/i-detail', function(req, res){
    const aid = req.query.aid;
    getNoTokenMsg({
        url: '/officialArticle/officialArticleDetails',
        data: {
            articleId: aid
        }
    }).done(result => {
        const detail = JSON.parse(result),
            title = detail.data.articleTitle ? detail.data.articleTitle : '行业资讯 | 文章详情';
        res.render('article/industryDetail', {
            mark: 'information',
            title: title,
            layout: 'shared/layout',
            data: detail
        })
    })
});


module.exports = routes;