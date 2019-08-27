const request = require('request');
const api = require('../api_config');

Promise.prototype.done = function (full, fail) {
  this.then(full, fail).catch(err => {
      setTimeout(() => {
          throw err;
      }, 0)
  })
};

//GET方法，获取信息
exports.getMessage = function(config) {
    config = config || {};
    config.data = config.data || {};
    return new Promise((resolve, reject) => {
        request({
            method: 'get',
            url: api.baseRMURL + config.url,
            qs: config.data,
            headers: {
                Authorization: 'bearer ' + config.token
            }
        }, function (err, response, body) {
            if(!err){
                resolve(body);
            }else{
                reject(err);
            }
        });
    });
};

//非token请求，GET
exports.getNoTokenMessage = function (config) {
    config = config || {};
    config.data = config.data || {};
    return new Promise((resolve, reject) => {
        request({
            method: 'get',
            url: api.baseRMURL + config.url,
            qs: config.data
        }, function (err, response, body) {
            if(!err){
                resolve(body);
            }else{
                reject(err);
            }
        });
    });
};

