const express = require('express'),
    routes = express.Router();

/*
*
* 订单中心
*
* */
//订单服务
routes.get('/', (req, res) => {
    res.render('order/index.ejs', {
        mark: 'order',
        title: '啄语 | 订单中心',
        layout: 'shared/layout'
    });
});
//图书翻译
routes.get('/book', (req, res) => {
    res.render('order/book.ejs', {
        mark: 'order',
        title: '啄语 | 订单中心-图书翻译',
        layout: 'shared/layout'
    });
});
//桌面排版
routes.get('/typeset', (req, res) => {
    res.render('order/typeset.ejs', {
        mark: 'order',
        title: '啄语 | 订单中心-桌面排版',
        layout: 'shared/layout'
    });
});
//口译外派
routes.get('/interpret', (req, res) => {
    res.render('order/interpret.ejs', {
        mark: 'order',
        title: '啄语 | 订单中心-口译外派',
        layout: 'shared/layout'
    });
});
//培训
routes.get('/train', (req, res) => {
    res.render('order/train.ejs', {
        mark: 'order',
        title: '啄语 | 订单中心-培训',
        layout: 'shared/layout'
    });
});

module.exports = routes;
