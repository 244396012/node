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
            };
        }
        callback(backData);
    });
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
        let title =  data.base.nickName?'"'+data.base.nickName+'"的主页-文章':'XXX的主页|文章';
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
        const userBase = JSON.parse(data[1]),
            title = userBase.data.nickName?'"'+userBase.data.nickName+'"的主页-文章详情':'XXX的主页|文章详情';
        res.render('article/detail', {
            mark: 'article',
            title: title,
            layout: 'shared/layout',
            detail: JSON.parse(data[0]),
            userBase: JSON.parse(data[1])
        });
    });
});

module.exports = routes;