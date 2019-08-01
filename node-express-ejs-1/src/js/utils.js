/*
* utils: 工具类
* author: zy
* date: 2019/04/20
* */
//滑动解锁插件
export function dragSlide() {
    let slideBox = $('#slide_box')[0];
    let slideXbox = $('#slide_xbox')[0];
    let btn = $('#slideBtn')[0];
    let slideBoxWidth = slideBox.offsetWidth;
    let btnWidth = btn.offsetWidth;
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
                $('#slideBtn').attr('data-pass',true);
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
    let time = 60;
    let down = setInterval(function(){
        time --;
        $(el).html(time + 's后重发');
        if(time === 0){
            clearInterval(down);
            $(el).removeAttr('disabled').html('获取验证码');
            return false;
        }
    },1000);
}
//获取url参数
export function getQueryString(name) {
    let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    let r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURI(r[2]);
    return null;
}
//格式化时间格式
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