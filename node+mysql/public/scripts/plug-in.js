function myAjax(opt){
    opt = opt || {};
    opt.method = opt.method.toUpperCase() || 'GET';
    opt.url = opt.url || '';
    opt.async = opt.async || true;
    opt.dataType = opt.dataType || '';
    opt.data = opt.data || '';
    opt.success = opt.success || function () {};
    opt.fail = opt.fail || function () {};
    var xmlHttp = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    var params = [],
        postData;
    for(var key in opt.data){
        params.push(key + '=' + opt.data[key]);
    }
    postData = params.join('&');
    if (opt.method.toUpperCase() === 'POST') {
        xmlHttp.open(opt.method, opt.url, opt.async);
        switch (opt.dataType){
            case 'json':
                xmlHttp.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
                postData = opt.data;
                xmlHttp.send(JSON.stringify(postData));
                break;
            default :
                xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
                postData = params.join('&');
                xmlHttp.send(postData);
        }
    }
    else if (opt.method.toUpperCase() === 'GET') {
        xmlHttp.open(opt.method, opt.url + '?' + postData, opt.async);
        xmlHttp.send(null);
    }
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && (xmlHttp.status == 304 || xmlHttp.status >= 200 && xmlHttp.status < 300)) {
            opt.success(xmlHttp.responseText,xmlHttp);
        }else if(xmlHttp.status >= 400 ){
            opt.fail(xmlHttp.responseText,xmlHttp);
        }
    };
}



