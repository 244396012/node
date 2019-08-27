/*
*  bundle：DOM、BOM操作
* 导入模块，压缩、打包，注册__bundle__全局对象，调用
* author：zhaoyong
* */
import './modal';
import promptTxt from './promptTxt';
import { getQueryString, togglePassword, dragSlide, formatTime, throttleFn } from './utils';

// import '../ts/bundle';

(function (bundle, global, document, $){

    const t = localStorage.getItem('sy_rm_client_access_token'),
        u = localStorage.getItem('sy_rm_client_ud');

    //跳转到“（团队、个人）基本信息、我的主页、我的文章”，阻止默认行为，url添加参数
    $('a.myHomePage').click(function (e) {
        e.preventDefault();
        location.href = '/personalArticle?t='+ t +'&u=' + u;
    });
    $('a.myHomeArticle').click(function (e) {
        e.preventDefault();
        location.href = '/personalArticle/list?t='+ t +'&u=' + u;
    });
    $('a.myBaseInfo').click(function (e) {
        e.preventDefault();
        const infoJSON = JSON.parse($('#loginUserBase').html());
        if(infoJSON.isTeam === 1){
            location.href = '/personal/baseInfo?t='+ t +'&u=' + u;//0,个人
        }else{
            location.href = '/personal/teamInfo?t='+ t +'&u=' + u;//1,团队
        }
    });

    bundle.promptTxt = promptTxt;
    bundle.dragSlide = dragSlide;
    bundle.togglePassword = togglePassword;
    bundle.getQueryString = getQueryString;
    bundle.formatTime = formatTime;
    bundle.throttleFn = throttleFn;

//注册到global全局
    global.__bundle__ = bundle;

}(window.__bundle__ || {}, window, document, jQuery));

