/*
* utils: 工具类
* author: zy
* date: 2019/04/20
* */

//清除本地数据
export function clearLocalData() {
    sessionStorage.removeItem('sy_rm_client_ud');
    sessionStorage.removeItem('sy_rm_client_ubase');
    sessionStorage.removeItem('sy_rm_client_access_token');
    sessionStorage.removeItem('sy_rm_client_choice_test');
    sessionStorage.removeItem('sy_rm_client_choice_test_no');
    sessionStorage.removeItem('sy_rm_client_choice_test_id');
}

//随机生成12位字符串
export function guid() {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return (S4() + S4() + S4());
}
//判断是否为guid格式
export function isGuidFormat(guid) {
    const reg = new RegExp(/^[0-9a-zA-Z]{8}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{12}$/);
    if (reg.test(guid)) {
        return true;
    }
    return false;
}
//滑动解锁插件
export function dragSlide() {
    let slideBox = $('#slide_box')[0],
        slideXbox = $('#slide_xbox')[0],
        btn = $('#slideBtn')[0],
        slideBoxWidth = slideBox.offsetWidth,
        btnWidth = btn.offsetWidth;
    //pc端
    btn.ondragstart = function () {
        return false;
    };
    btn.onselectstart = function () {
        return false;
    };
    btn.onmousedown = function (e) {
        let disX = e.clientX - btn.offsetLeft;
        document.onmousemove = function (e) {
            let objX = e.clientX - disX + btnWidth;
            if (objX < btnWidth) {
                objX = btnWidth
            }
            if (objX > slideBoxWidth) {
                objX = slideBoxWidth
            }
            $('#slide_xbox').width(objX + 'px');
        };
        document.onmouseup = function (e) {
            let objX = e.clientX - disX + btnWidth;
            if (objX < slideBoxWidth) {
                objX = btnWidth;
            } else {
                objX = slideBoxWidth;
                $('#slide_xbox').html('验证通过<div id="slideBtn"><i class="am-icon-check" style="color: #41cca6;"></i></div>');
                __api__.sid = guid();
            }
            $('#slide_xbox').width(objX + 'px');
            document.onmousemove = null;
            document.onmouseup = null;
        };
    };
}
//显示/隐藏输入的密码
export function togglePassword (_this) {
    const input = _this.nextElementSibling;
    const iconCls = _this.classList;
    if(iconCls.contains('am-icon-eye-slash')){
        iconCls.remove('am-icon-eye-slash');
        iconCls.add('am-icon-eye');
        input.setAttribute('type','text');
    }else{
        iconCls.remove('am-icon-eye');
        iconCls.add('am-icon-eye-slash');
        input.setAttribute('type','password');
    }
}
//验证码倒计时
export function countDown(el) {
    $(el).attr('disabled','disabled');
    let time = 120;
    let down = setInterval(function(){
        time --;
        $(el).html(time + 's后重发');
        if(time === 0){
            clearInterval(down);
            $(el).removeAttr('disabled').html('获取验证码');
            return false;
        }
    }, 1000);
}
//获取url参数
export function getQueryString(name) {
    let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    let r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURI(r[2]);
    return null;
}
//格式化时间格式，形如 2010-10-01 20:20
export function formatTime(date) {

    const myDate = new Date(date);
    let timeStr, years, months, days, hours, minutes;

    years = myDate.getFullYear();
    months = myDate.getMonth()+1;
    days = myDate.getDate();
    hours = myDate.getHours() < 10 ? "0"+myDate.getHours() : myDate.getHours();
    minutes = myDate.getMinutes() < 10 ? "0"+myDate.getMinutes(): myDate.getMinutes();
    timeStr = `${years}-${months}-${days}  ${hours}:${minutes}`;

    return timeStr;
}
//函数节流
export function throttleFn(fn, delay) {
    let timer = null;
    return function () {
        const cnt = this,
            args = arguments;
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(cnt, args);
        }, delay);
    };
}
//隐藏手机号、邮箱
export function hiddenAccount(str) {
    if(str.includes('@')){//邮箱  123456@qq.com
        return str.replace(/(\w{1})(\w+)/, '$1****')
    }
    //手机号 13900000000
    return str.replace(/(\d{3})(\d{4})/, '$1****')
}

//数组去重（hash）
Array.prototype.unique = function () {
    const newArr = [],
        tempArr = [];
    this.forEach(item => {
       if(!tempArr[item]){
           tempArr[item] = 'add';
           newArr.push(item);
       }
    });
    return newArr;
};

//socket连接
export function connectSocket(url, callback) {

    let isConnected = null;
    let stompClient = null,
        userId = sessionStorage.getItem('sy_rm_client_ud');

    function connect() {
        const socket = new SockJS(url);
        stompClient = Stomp.over(socket);
        stompClient.connect({}, function (frame) {
            clearInterval(isConnected);
            stompClient.subscribe('/topic/sendMessage/'+userId, function (res) {
                if(res.body){
                    callback(res.body);
                }
            });
        }, function (err) {
            clearInterval(isConnected);
            isConnected = setInterval(() => {
                connect()
            }, 5000);
        })
    }

    function disconnect() {
        if (stompClient !== null) {
            stompClient.disconnect();
        }
        console.log("Disconnected");
    }

    connect();
}


