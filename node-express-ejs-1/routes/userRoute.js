const express = require('express'),
    routes = express.Router();
const request = require('request');
const server = require('./server');

/*
*
*   个人中心 personal
*
* */
//信息概述
routes.get('/', function (req, res ,next) {
    res.render('personal/index', {
        mark: 'personal',
        title: '个人中心-信息概述',
        layout: 'shared/layout'
    });
});
//我的主页
routes.get('/myhome', function (req, res ,next) {
    res.render('personal/myhome', {
        mark: 'personal',
        title: '个人中心-信息概述',
        layout: 'shared/layout'
    });
});
//基本信息
routes.get('/information', function (req, res ,next) {
    res.render('personal/information', {
        mark: 'personal',
        title: '个人中心-基本信息',
        layout: 'shared/layout'
    });
});
//我的简历
routes.get('/resume', function (req, res ,next) {
    res.render('personal/resume', {
        mark: 'personal',
        title: '个人中心-我的简历',
        layout: 'shared/layout'
    });
});
//技能测试
routes.get('/skill', function (req, res ,next) {
    res.render('personal/skill', {
        mark: 'personal',
        title: '个人中心-技能测试',
        layout: 'shared/layout'
    });
});
routes.get('/skill/test/choice', function (req, res ,next) {
    res.render('personal/skillChoiceTest', {
        mark: 'personal',
        title: '选择题测试',
        layout: 'shared/layout'
    });
});
routes.get('/skill/test/translation', function (req, res ,next) {
    res.render('personal/skillTransTest', {
        mark: 'personal',
        title: '翻译题测试',
        layout: 'shared/layout'
    });
});
//认证中心
routes.get('/identification', function (req, res ,next) {
    res.render('personal/identification', {
        mark: 'personal',
        title: '个人中心-认证中心',
        layout: 'shared/layout'
    });
});
//安全设置
routes.get('/safety', function (req, res ,next) {
    res.render('personal/safety', {
        mark: 'personal',
        title: '个人中心-安全设置',
        layout: 'shared/layout'
    });
});
//结算中心
routes.get('/balance', function (req, res, next) {
    res.render('personal/balance', {
        mark: 'personal',
        title: '个人中心-结算中心',
        layout: 'shared/layout'
    });
});
//提醒设置
routes.get('/attention', function (req, res ,next) {
    res.render('personal/attention', {
        mark: 'personal',
        title: '个人中心-提醒设置',
        layout: 'shared/layout'
    });
});
//我的评价
routes.get('/appraise', function (req, res ,next) {
    res.render('personal/appraise', {
        mark: 'personal',
        title: '个人中心-我的评价',
        layout: 'shared/layout'
    });
});
//消息中心
routes.get('/message', function (req, res ,next) {
    res.render('personal/message', {
        mark: 'personal',
        title: '个人中心-消息通知',
        layout: 'shared/layout'
    });
});
//邀请注册
routes.get('/application', function (req, res ,next) {
    res.render('personal/application', {
        mark: 'personal',
        title: '邀请注册',
        layout: 'shared/layout'
    });
});
//意见反馈
routes.get('/advice', function (req, res ,next) {
    res.render('personal/advice', {
        mark: 'personal',
        title: '意见反馈',
        layout: 'shared/layout'
    });
});

module.exports = routes;