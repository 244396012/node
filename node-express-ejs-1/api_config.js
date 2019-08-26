const domain = "http://192.168.2.203:5790";
const api = {
    "baseURL": domain,
    "loginURL": domain + "/permission",
    "baseRMURL": domain + "/rm",
    "basePMURL": domain + '/pm'
};

// export default api;
module.exports = api;