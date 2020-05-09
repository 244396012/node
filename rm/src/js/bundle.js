/*
*  bundle：DOM、BOM操作
* 导入模块，压缩、打包，注册__bundle__全局对象，调用
* author：zhaoyong
* */
import './modal';
import './index';
import promptTxt from './promptTxt';
import {
    getQueryString,
    togglePassword,
    dragSlide,
    formatTime,
    throttleFn,
    hiddenAccount,
    clearLocalData
} from './utils';

// import '../ts/bundle'

;(function (bundle, global, document){

    function getEl(string){
        return document.querySelector(string);
    }

    //设置个人图片icon
    const base = sessionStorage.getItem('sy_rm_client_ubase'),
        baseData = base && JSON.parse(base);
    (baseData && baseData.picture && getEl('.headIcon_Header'))
    && getEl('.headIcon_Header').setAttribute('src', baseData.picture);

    bundle.promptTxt = promptTxt;
    bundle.dragSlide = dragSlide;
    bundle.togglePassword = togglePassword;
    bundle.getQueryString = getQueryString;
    bundle.formatTime = formatTime;
    bundle.throttleFn = throttleFn;
    bundle.hiddenAct = hiddenAccount;
    bundle.clearLocalData = clearLocalData;

//注册到global全局
    global.__bundle__ = bundle;

}(window.__bundle__ || {}, window, document));
