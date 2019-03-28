var mysql = require('mysql');

function querySQL(sql, param, callback){
    var db = mysql.createConnection({
        host: 'localhost',
        port: '3306',
        user: 'root',
        password: 'zhaoyong',
        database: 'test'
    });
    db.connect(function (err) {
        if(err){
            console.log("mysql进行断线重连：" + new Date());
            setTimeout(querySQL,1000);
            return;
        }
        console.log('mysql连线成功');
    });
    db.query(sql, param, callback);
    db.end();
}
module.exports = querySQL;


//exports.QuerySQL = function(sql, param, callback) {
//    var bin = mysql.createConnection({
//        host: 'localhost',
//        port: '3306',
//        user: 'root',
//        password: 'zhaoyong',
//        database: 'test'
//    });
//    bin.connect();
//    bin.query(sql, param, callback);
//    bin.end();
//};
