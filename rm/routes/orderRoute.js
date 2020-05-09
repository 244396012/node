const express = require('express'),
    routes = express.Router();
const server = require('./promise'),
    getTokenMsg = server.getTokenMessage;

/*
*
* 订单中心
*
* */
//订单服务
routes.get('/', (req, res) => {
    const token = req.cookies.sy_rm_client_tk,
        userid = req.cookies.sy_rm_client_ud;
    getTokenMsg({
        url: '/userExtension/listPassedSkills',
        token: token,
        data: { userId: userid }
    }).done(data => {
        res.render('order/index.ejs', {
            mark: 'order',
            title: '语言桥 | 订单中心',
            layout: 'shared/layout',
            data: JSON.parse(data)
        })
    })
});
//图书翻译
routes.get('/book', (req, res) => {
    const token = req.cookies.sy_rm_client_tk,
        userid = req.cookies.sy_rm_client_ud;
    getTokenMsg({
        url: '/userExtension/listPassedSkills',
        token: token,
        data: { userId: userid }
    }).done(data => {
        res.render('order/book.ejs', {
            mark: 'order',
            title: '语言桥 | 图书翻译',
            layout: 'shared/layout',
            data: JSON.parse(data)
        })
    })
});
//桌面排版
routes.get('/typeset', (req, res) => {
    const token = req.cookies.sy_rm_client_tk,
        userid = req.cookies.sy_rm_client_ud;
    getTokenMsg({
        url: '/userExtension/listPassedSkills',
        token: token,
        data: { userId: userid }
    }).done(data => {
        res.render('order/typeset.ejs', {
            mark: 'order',
            title: '语言桥 | 桌面排版',
            layout: 'shared/layout',
            data: JSON.parse(data)
        })
    })
});
//会展
routes.get('/meeting', (req, res) => {
    const token = req.cookies.sy_rm_client_tk,
        userid = req.cookies.sy_rm_client_ud;
    getTokenMsg({
        url: '/userExtension/listPassedSkills',
        token: token,
        data: { userId: userid }
    }).done(data => {
        res.render('order/meeting.ejs', {
            mark: 'order',
            title: '语言桥 | 会展订单',
            layout: 'shared/layout',
            data: JSON.parse(data)
        })
    })
});
//外派
routes.get('/interpret', (req, res) => {
    const token = req.cookies.sy_rm_client_tk,
        userid = req.cookies.sy_rm_client_ud;
    getTokenMsg({
        url: '/userExtension/listPassedSkills',
        token: token,
        data: { userId: userid }
    }).done(data => {
        res.render('order/interpret.ejs', {
            mark: 'order',
            title: '语言桥 | 外派订单',
            layout: 'shared/layout',
            data: JSON.parse(data)
        })
    })
});
//培训
routes.get('/train', (req, res) => {
    const token = req.cookies.sy_rm_client_tk,
        userid = req.cookies.sy_rm_client_ud;
    getTokenMsg({
        url: '/userExtension/listPassedSkills',
        token: token,
        data: { userId: userid }
    }).done(data => {
        res.render('order/train.ejs', {
            mark: 'order',
            title: '语言桥 | 培训订单',
            layout: 'shared/layout',
            data: JSON.parse(data)
        })
    })
});
//搭建设备
routes.get('/device', (req, res) => {
    const token = req.cookies.sy_rm_client_tk,
        userid = req.cookies.sy_rm_client_ud;
    getTokenMsg({
        url: '/userExtension/listPassedSkills',
        token: token,
        data: { userId: userid }
    }).done(data => {
        res.render('order/device.ejs', {
            mark: 'order',
            title: '语言桥 | 设备搭建订单',
            layout: 'shared/layout',
            data: JSON.parse(data)
        })
    })
});

module.exports = routes;
