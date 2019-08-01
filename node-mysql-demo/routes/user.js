var routes = require('express').Router();
var querySQL = require('../bin/db');
var resINFO = require('../bin/info');

//register
routes.post('/register',function(req, res){
    var responseInfo;
    var _name = req.body.name,
        _pwd = req.body.pwd,
        _info = req.body.info;
    var sql = 'insert into user_register(user_name,user_pwd,user_info) values(?,?,?)';
    querySQL(sql, [_name,_pwd,_info], function (err, data) {
        if(err){
            responseInfo = resINFO({
                success:false,
                error: '注册失败'
            });
        }else{
            responseInfo = resINFO({
                success:true,
                msg: '注册成功'
            });
        }
        res.send(responseInfo);
        res.end();
    });
});

//index
//--加载数据
routes.get('/index', function (req,res) {
    var responseInfo;
    var sql = 'SELECT * from user_register';
    querySQL(sql, function (err,data) {
        if(err){
            responseInfo = resINFO({
                success:false,
                error: '加载失败'
            });
        }else{
            responseInfo = resINFO({
                success:true,
                msg: '加载成功',
                data: data
            });
        }
        res.send(responseInfo);
        res.end();
    });
});
//--删除数据
routes.post('/del', function (req, res) {
    var responseInfo;
    var sql = 'delete from user_register where id = ?',
        param = req.body.id;
    querySQL(sql, [param], function (err, data) {
        if(err){
            responseInfo = resINFO({
                success:false,
                error: '删除失败'
            });
        }else{
            responseInfo = resINFO({
                success:true,
                msg: '删除成功'
            });
        }
        res.send(responseInfo);
        res.end();
    });
});

module.exports = routes;
