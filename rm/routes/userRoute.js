const express = require('express'),
    routes = express.Router();
const server = require('./promise'),
    getTokenMsg = server.getTokenMessage;

/*
*
*   个人中心 personal
*
* */
//信息概述
routes.get('/', function (req, res) {
    res.render('personal/index', {
        mark: 'personal',
        title: '个人中心 | 信息概述',
        layout: 'shared/layout'
    });
});
//我的主页
routes.get('/myhome', function (req, res) {
    res.render('personal/myhome', {
        mark: 'personal',
        title: '个人中心 | 信息概述',
        layout: 'shared/layout'
    });
});
//个人基本信息
routes.get('/baseInfo', function (req, res) {
    const userId = req.query.u,
        token = req.query.t;
    getTokenMsg({
        url: '/userExtension/findResumeByUserId',
        token: token,
        data: { userId: userId }
    }).done(redata => {
        const data = JSON.parse(redata);
        res.render('personal/baseInfo', {
            mark: 'personal',
            title: '个人中心 | 基本信息',
            layout: 'shared/layout',
            data: data
        });
    });
});
//团队基本信息
routes.get('/teamInfo', function (req, res) {
    const userId = req.query.u,
        token = req.query.t;
    getTokenMsg({
        url: '/userExtension/findResumeByUserId',
        token: token,
        data: { userId: userId }
    }).done(redata => {
        const data = JSON.parse(redata);
        res.render('personal/baseTeamInfo', {
            mark: 'personal',
            title: '个人中心 | 团队基本信息',
            layout: 'shared/layout',
            data: data
        });
    });
});
//我的简历
routes.get('/resume', function (req, res) {
    res.render('personal/resume', {
        mark: 'personal',
        title: '个人中心 | 我的简历',
        layout: 'shared/layout'
    });
});
/*
* 技能测试
* */
routes.get('/skill', function (req, res) {
    res.render('personal/skill', {
        mark: 'personal',
        title: '个人中心 | 技能测试',
        layout: 'shared/layout'
    });
});
//技能测试 -> 选择题测试
routes.get('/skill/test/choice', function (req, res) {
    res.render('personal/skillChoiceTest', {
        mark: 'personal',
        title: '选择题测试',
        layout: 'shared/layout'
    });
});
//技能测试 -> 翻译题测试
routes.get('/skill/test/translation', function (req, res) {
    res.render('personal/skillTransTest', {
        mark: 'personal',
        title: '翻译题测试',
        layout: 'shared/layout'
    });
});
//技能测试 -> 桌面排版
routes.get('/skill/typeset', function (req, res) {
    const token = req.cookies.sy_rm_client_tk;
    getTokenMsg({
        url: '/newSkillController/getCurrentUserDtp',
        token: token
    }).done(redata => {
        const data = JSON.parse(redata);
        if(!data.data || !data.data.id){
            data.data = {};
        }
        res.render('personal/skill-typeset', {
            mark: 'personal',
            title: '个人中心 | 技能测试-桌面排版',
            layout: 'shared/layout',
            data: data
        });
    });
});
//技能测试 -> 会展(口译)
routes.get('/skill/meeting', function (req, res) {
    const token = req.cookies.sy_rm_client_tk;
    getTokenMsg({
        url: '/newSkillController/getNewSkillInterpretation',
        token: token
    }).done(redata => {
        const data = JSON.parse(redata);
        if(!data.data || !data.data.id){
            data.data = {};
        }
        res.render('personal/skill-meeting', {
            mark: 'personal',
            title: '个人中心 | 技能测试-会展',
            layout: 'shared/layout',
            data: data
        })
    })
});
//技能测试 -> 外派
routes.get('/skill/assign', function (req, res) {
    const token = req.cookies.sy_rm_client_tk;
    getTokenMsg({
        url: '/newSkillController/getNewSkillExpatriate',
        token: token
    }).done(redata => {
        const data = JSON.parse(redata);
        if(!data.data || !data.data.id){
            data.data = {};
        }
        res.render('personal/skill-assign', {
            mark: 'personal',
            title: '个人中心 | 技能测试-外派',
            layout: 'shared/layout',
            data: data
        });
    })
});
//技能测试 -> 培训
routes.get('/skill/train', function (req, res) {
    const token = req.cookies.sy_rm_client_tk;
    getTokenMsg({
        url: '/newSkillController/getNewSkillTrain',
        token: token
    }).done(redata => {
        const data = JSON.parse(redata);
        if(!data.data || !data.data.id){
            data.data = {};
        }
        res.render('personal/skill-train', {
            mark: 'personal',
            title: '个人中心 | 技能测试-培训',
            layout: 'shared/layout',
            data: data
        });
    })
});
//技能测试 -> 设备
routes.get('/skill/device', function (req, res) {
    const token = req.cookies.sy_rm_client_tk;
    getTokenMsg({
        url: '/newSkillController/getNewSkillEquip',
        token: token
    }).done(redata => {
        const data = JSON.parse(redata);
        if(!data.data || !data.data.id){
            data.data = {};
        }
        res.render('personal/skill-device', {
            mark: 'personal',
            title: '个人中心 | 技能测试-设备',
            layout: 'shared/layout',
            data: data
        });
    })
});
//技能测试 -> 搭建
routes.get('/skill/setup', function (req, res) {
    const token = req.cookies.sy_rm_client_tk;
    getTokenMsg({
        url: '/newSkillController/getNewSkillBuild',
        token: token
    }).done(redata => {
        const data = JSON.parse(redata);
        if(!data.data || !data.data.id){
            data.data = {};
        }
        res.render('personal/skill-setup', {
            mark: 'personal',
            title: '个人中心 | 技能测试-搭建',
            layout: 'shared/layout',
            data: data
        });
    })
});
//认证中心
routes.get('/identification', function (req, res) {
    res.render('personal/identification', {
        mark: 'personal',
        title: '个人中心 | 认证中心',
        layout: 'shared/layout'
    });
});
//安全设置
routes.get('/safety', function (req, res) {
    res.render('personal/safety', {
        mark: 'personal',
        title: '个人中心 | 安全设置',
        layout: 'shared/layout'
    });
});
//结算中心
routes.get('/balance', function (req, res) {
    res.render('personal/balance', {
        mark: 'personal',
        title: '个人中心 | 结算中心',
        layout: 'shared/layout'
    });
});
//提醒设置
routes.get('/attention', function (req, res) {
    res.render('personal/attention', {
        mark: 'personal',
        title: '个人中心 | 提醒设置',
        layout: 'shared/layout'
    });
});
//我的评价
routes.get('/appraise', function (req, res) {
    res.render('personal/appraise', {
        mark: 'personal',
        title: '个人中心 | 我的评价',
        layout: 'shared/layout'
    });
});
//消息中心
routes.get('/message', function (req, res) {
    res.render('personal/message', {
        mark: 'personal',
        title: '个人中心 | 消息通知',
        layout: 'shared/layout'
    });
});
//邀请注册
routes.get('/application', function (req, res) {
    res.render('personal/application', {
        mark: 'personal',
        title: '邀请注册',
        layout: 'shared/layout'
    });
});
//意见反馈
routes.get('/advice', function (req, res) {
    res.render('personal/advice', {
        mark: 'personal',
        title: '意见反馈',
        layout: 'shared/layout'
    });
});


module.exports = routes;