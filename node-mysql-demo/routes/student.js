var routes = require('express').Router();
var querySQL = require('../bin/db');
var resINFO = require('../bin/info');

//查询学生信息
routes.get('/queryStudentInfo', function (req, res) {
    var _resINFO;
    querySQL('select * from student_info', function (err,data) {
        if(err){
            _resINFO = resINFO({
                success: false,
                error: '查询失败'
            });
        }else{
            _resINFO = resINFO({
                success: true,
                msg: '查询成功',
                data: data
            });
        }
        res.send(_resINFO);
        res.end();
    });
});

//插入学生信息
routes.post('/addStudentInfo', function (req, res) {
    var _resINFO;
    var _name = req.body._name,
        _age = req.body._age,
        _sex = req.body._sex,
        _remark = req.body._remark;
    querySQL('insert into student_info(s_name,s_age,s_sex,s_remark) values(?,?,?,?)',[_name,_age,_sex,_remark], function (err,data) {
        if(err){
            _resINFO = resINFO({
                success:false,
                error:'添加失败'
            });
        }else{
            _resINFO = resINFO({
                success:true,
                msg:'添加成功'
            });
        }
        res.send(_resINFO);
        res.end();
    });
});

//删除
routes.post('/delStudentInfo', function (req,res) {
    var _resINFO;
    var _id = req.body.id;
    var sql = 'delete from student_info where s_id = ?',
        param = [_id];
    querySQL(sql, param, function (err, data) {
        if(err){
            _resINFO = resINFO({
                success:false,
                error:'删除失败'
            });
        }else{
            _resINFO = resINFO({
                success:true,
                msg:'删除成功'
            });
        }
        res.send(_resINFO);
        res.end();
    });
});

//修改
routes.post('/updateStudentInfo', function (req, res) {
    var _resINFO;
    var sql = 'update student_info set s_name=?,s_age=?,s_sex=?,s_remark=? where s_id = ?',
        param = [req.body._name,req.body._age,req.body._sex,req.body._remark,req.body._id];
    querySQL(sql, param, function (err, data) {
        if(err){
            _resINFO = resINFO({
                success:false,
                error:'修改失败'
            });
        }else{
            _resINFO = resINFO({
                success:true,
                msg:'修改成功'
            });
        }
        res.send(_resINFO);
        res.end();
    });
});

module.exports = routes;