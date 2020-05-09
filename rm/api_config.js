/*
    判断配置文件运行环境
    浏览器环境，根据 cookie: name="ENV" 判断
    node环境，process.env.NODE_ENV 判断
*/
let env = typeof window !== 'undefined' ? (function () { 
    // 获取cookie
    function getCookie(name) { 
        var arr,reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        if (arr = document.cookie.match(reg)) {
            return unescape(arr[2]);
        } else {
            return null;
        }
    }
    return (getCookie('ENV') || 'production')
 })() : process.env.NODE_ENV;
let domain = {};
switch (env){
    case 'dev':  // 开发环境
        domain = {
            api: "http://192.168.2.203:5790",
            orderApi: 'http://192.168.3.95:8080/#',
            orderOtherApi: 'http://192.168.3.181:9995'
        };
        break
    case 'test': // 测试环境
        domain = {
            api: "http://192.168.2.203:5791",
            orderApi: 'http://192.168.2.208:3005/#',
            orderOtherApi: 'http://192.168.2.205:9995'
        };
        break
    case 'production': // 线上环境
        domain = {
            api: "http://pangu1.lan-bridge.cn:5791",
            orderApi: 'http://pm.lan-bridge.cn/#', // 前端
            orderOtherApi: 'http://pangu1.lan-bridge.cn:9995'
        };
        break
}

const api = {
    "baseURL": domain.api,
    "loginURL": domain.api + "/permission",
    "baseRMURL": domain.api + "/rm",
    "basePMURL": domain.api + '/pm',
    "orderApi": domain.orderApi,
    "orderOtherApi": domain.orderOtherApi
};

module.exports = api