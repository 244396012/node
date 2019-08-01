/*
*  bundle：DOM、BOM操作
* 导入模块，压缩、打包，导出bundle全局对象，调用
* author：zhaoyong
* */
import promptTxt from './promptTxt';
import { getQueryString, togglePassword, dragSlide, formatTime, throttleFn } from './utils';
import './modal';

// import '../ts/bundle';

(function (global){

    const t = localStorage.getItem('sy_rm_client_access_token'),
        u = localStorage.getItem('sy_rm_client_ud');

    //跳转到“我的主页、我的文章”，阻止默认行为，url添加参数
    $('a.myHomePage').click(function (e) {
        e.preventDefault();
        location.href = '/personalArticle/?t='+ t +'&u=' + u;
    });
    $('a.myHomeArticle').click(function (e) {
        e.preventDefault();
        location.href = '/personalArticle/list/?t='+ t +'&u=' + u;
    });


    !global.bundle &&
    (global.bundle = {
        promptTxt,
        dragSlide,
        togglePassword,
        getQueryString,
        formatTime,
        throttleFn
    });

}(window));

