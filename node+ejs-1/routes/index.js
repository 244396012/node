var express = require('express');
var routes = express.Router();

//首页
routes.get('/',function (req, res, next) {
    res.render('index', {
        title: 'page index'
    });
});


/*
*
*
*  ***** 用户中心 *****
*
*
* */

/*
* 1、个人中心
* */
//首页
routes.get('/personal', function (req, res ,next) {
    res.render('user/personal', {
        title: '个人中心',
        layout: 'shared/layout-u'
    });
});



/*
* 2、项目管理
* */
//首页
routes.get('/project', function (req, res ,next) {
    res.render('user/project', {
        title: '项目管理',
        layout: 'shared/layout-u'
    });
});




/*
*
* 3、收益管理
*
* */
//首页
routes.get('/income', function (req, res ,next) {
    res.render('user/income', {
        title: '收益管理',
        layout: 'shared/layout-u'
    });
});
//收入明细
routes.get('/income/detail', function (req, res ,next) {
    res.render('user/income/detail', {
        title: '收入明细',
        layout: 'shared/layout-u'
    });
});
//提现设置
routes.get('/income/withdraw', function (req, res ,next) {
    res.render('user/income/withdraw', {
        title: '提现设置',
        layout: 'shared/layout-u'
    });
});
/*
* 申请提现
* */
routes.get('/income/application', function (req, res ,next) {
    res.render('user/income/application', {
        title: '申请提现',
        layout: 'shared/layout-u'
    });
});
//--提现明细
routes.get('/income/application/detail', function (req, res ,next) {
    res.render('user/income/appDetail', {
        title: '提现明细',
        layout: 'shared/layout-u'
    });
});
//--提现详情
routes.get('/income/application/dtlDetail', function (req, res ,next) {
    res.render('user/income/appDtlDetail', {
        title: '提现详情',
        layout: 'shared/layout-u'
    });
});

module.exports = routes;