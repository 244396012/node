var express = require('express');
var routes = express.Router();

routes.get('/',function (req, res, next) {
    res.render('page/index', {
        title: 'page index'
    });
});


routes.get('/1', function (req, res, next) {
    res.render('page/a',{
        title: 'page a'
    })
})

routes.get('/2', function (req, res, next) {
    res.render('page/b',{
        title: 'page b'
    })
})

routes.get('/3', function (req, res, next) {
    res.render('page/c',{
        title: 'page c'
    })
})


module.exports = routes;