const express = require('express');
const routes = express.Router();
/**
 *
 * account：登录、注册、找回密码等
 *
 * */
//登陆
routes.get('/login', function (req, res) {
   res.render('account/login', {
       mark: 'account',
       title: '啄语 | 用户登录',
       layout: 'shared/layout'
   });
});
//注册
routes.get('/register', function (req, res) {
   res.render('account/register', {
       mark: 'account',
       title: '啄语 | 用户注册',
       layout: 'shared/layout'
   });
});
//忘记密码
routes.get('/forgetPwd', function (req, res) {
   res.render('account/forgetPwd', {
       mark: 'account',
       title: '啄语 | 忘记密码',
       layout: 'shared/layout'
   });
});

/*
*
*  首页：index
*  关于我们：about
*
* */

//首页
routes.get('/',function (req, res) {
    res.render('index', {
        mark: 'index',
        title: '啄语 | 首页',
        layout: 'shared/layout'
    });
});
//关于我们
routes.get('/about/', function (req, res){
    res.render('about/index', {
        mark: 'aboutExtra',
        title: '啄语 | 关于我们',
        layout: 'shared/layout'
    });
});
//帮助中心
routes.get('/about/help', function (req, res){
    res.render('about/help', {
        mark: 'about',
        title: '啄语 | 帮助中心',
        layout: 'shared/layout'
    });
});
//服务条款
routes.get('/about/clause', function (req, res){
    res.render('about/clause', {
        mark: 'about',
        title: '啄语 | 服务条款',
        layout: 'shared/layout'
    });
});
//隐私条款
routes.get('/about/secret', function (req, res){
    res.render('about/secret', {
        mark: 'about',
        title: '啄语 | 隐私条款',
        layout: 'shared/layout'
    });
});

module.exports = routes;