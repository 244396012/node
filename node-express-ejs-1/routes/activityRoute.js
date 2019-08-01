const express = require('express');
const routes = express.Router();

/*
*
* 活动中心：activity (可能随时会更改，所以js、css、image单独引入，方便删除和修改)
*
* */
routes.get('/', function (req, res, next) {
    res.render('activity/index', {
        mark: 'activity',
        title: '活动中心',
        layout: 'shared/layout'
    });
});

routes.get('/a1', function (req, res, next) {
    res.render('activity/a1', {
        mark: 'activity',
        title: '国庆活动',
        layout: 'shared/layout'
    });
});

routes.get('/a1_detail', function (req, res, next) {
    res.render('activity/a1_detail', {
        mark: 'activity',
        title: '国庆活动详情',
        layout: 'shared/layout'
    });
});
routes.get('/a2', function (req, res, next) {
    res.render('activity/a2', {
        mark: 'activity',
        title: '推荐制度拉新活动',
        layout: 'shared/layout'
    });
});


module.exports = routes;
