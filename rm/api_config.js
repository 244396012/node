/*
* online api
* */
// const domain = {
//     api: "http://pangu1.lan-bridge.cn:5791",
//     orderApi: 'http://pm.lan-bridge.cn/#', //前端
//     orderOtherApi: 'http://pmr1.lan-bridge.cn'
// };

/*
* test api
* */
// const domain = {
//     api: "http://192.168.2.203:5791",
//     orderApi: 'http://192.168.2.208:3005/#',
//     orderOtherApi: 'http://192.168.2.204:8002'
// };

/*
* dev api
* */
const domain = {
    api: "http://192.168.2.203:5790",
    orderApi: 'http://192.168.3.95:8080/#',
    orderOtherApi: 'http://192.168.2.204:8002'
};


const api = {
    "baseURL": domain.api,
    "loginURL": domain.api + "/permission",
    "baseRMURL": domain.api + "/rm",
    "basePMURL": domain.api + '/pm',
    "orderApi": domain.orderApi,
    "orderOtherApi": domain.orderOtherApi
};

module.exports = api;