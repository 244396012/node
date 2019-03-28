/*
* request拦截器，统一给headers添加token
* */
const token = 'Bearer ' + localStorage.getItem('yyq_zss_client_access_token');
$.ajaxSetup({
    headers: {
      //  'Authorization': token
    },
    error: function (xhr) {
        if(xhr.status === 401){
            $.fail('登录信息已过期，重新登录');
        }
    }
});

const api = {
    protocol: 'http://',
    host: '192.168.0.199',
    port: '5790'
};

export const dict = api.protocol + api.host+ ":" + api.port + '/dictionary';