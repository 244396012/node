/*
*  bundle：DOM、BOM操作
* 导入模块，压缩、打包，注册__bundle__全局对象，调用
* author：zhaoyong
* */
import './modal';
import promptTxt from './promptTxt';
import { getQueryString, togglePassword, dragSlide, formatTime, throttleFn } from './utils';

(function (bundle, global, document, $){

    bundle.promptTxt = promptTxt;
    bundle.dragSlide = dragSlide;
    bundle.togglePassword = togglePassword;
    bundle.getQueryString = getQueryString;
    bundle.formatTime = formatTime;
    bundle.throttleFn = throttleFn;

//注册到global全局
    global.__bundle__ = bundle;

}(window.__bundle__ || {}, window, document, jQuery));

