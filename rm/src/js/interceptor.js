
import api_config from '../../api_config';
import { clearLocalData, connectSocket, hiddenAccount } from './utils';
import { getResponse } from "./asyncAjax";

export const baseUrl = api_config.baseURL;
export const loginUrl = api_config.loginURL;
export const baseRMUrl = api_config.baseRMURL;
export const basePMUrl = api_config.basePMURL;
export const orderApi = api_config.orderApi;
export const orderOtherApi = api_config.orderOtherApi;

/*
*
* request拦截器，给请求头headers添加 token
*
* */
$.ajaxSetup({
    timeout: 60000,
    beforeSend: function (xhr, request) {
        /*
        const filterUrl = [
            '/oauth/token',
            '/customer/resetPassword',
            '/customer/setNewPassword',
            '/customer/customerRegister',
            '/customer/sendCode',
            '/interpreterArticle/interpreterArticleListSelect',
            '/commentAndLog/getCommentAndReply',
            '/officialArticle/listOfficialArticle'
        ];
        */
        const reqUrl = request.url;
        if(reqUrl.includes('/oauth/token') ||
            reqUrl.includes('/customer/resetPassword') ||
            reqUrl.includes('/customer/setNewPassword') ||
            reqUrl.includes('/customer/customerRegister') ||
            reqUrl.includes('/customer/sendCode') ||
            reqUrl.includes('/userExtension/findResumeByUserId') ||
            reqUrl.includes('/interpreterArticle/interpreterArticleListSelect') ||
            reqUrl.includes('/commentAndLog/getCommentAndReply') ||
            reqUrl.includes('/officialArticle/listOfficialArticle')
        ){
            //do something
        }else {
            const token = sessionStorage.getItem('sy_rm_client_access_token');
            xhr.setRequestHeader('Authorization','bearer '+token);
        }
    },
    error: function (res) {
        const path = location.pathname + location.search;
        //用户登录信息已过期/未登录，做相应处理
        if(res.status === 401){

            $('.my-loading').remove();
            //清除storage本地数据
            clearLocalData();
            /*
            * 根据uri做判断，若uri中包括 ‘personal’和‘personalArticle’、‘order’
            * 即在非“个人中心”、“个人主页”、“订单中心”，则不跳转留在当前页面
            * 否则提示用户，跳转到登录页面
            */
            if(!(path.includes('/personal/') || path.includes('/personalArticle/') || path.includes('/order/'))){
                return false;
            }
            if(res.responseJSON.error_description === 'null'){
                $.error('未登录，请先登录');
            }else if(res.responseJSON.error_description !== 'null'){
                $.error('登录信息已过期，请重新登录');
            }else {
                $.error('"未登录"或"登录信息已过期"，请重新登录');
            }
            setTimeout(() => {
                location.href = '/login?redirect='+ encodeURIComponent(path);
            }, 1000);
        }
    }
});

//判断用户是否登录，处理header标签中用户信息展示
(function (window, document, $) {
    const pathname = location.pathname,
        path = pathname + location.search;
    $.ajax({
        type: 'post',
        url: loginUrl + '/user/judgeUserLogin/test',
        headers: {
          'Cache-Control': 'private,max-age=3600'
        },
        dataType: 'json',
        error: function (res) {
            // 未登录/登录信息过期时，访问afterLogin数组里面的路径，直接跳转到登录页面
            // const afterLogin = ['/personal/', '/personalArticle/', '/order/'];
            if(res.status === 401 || res.status === 403){
                if(pathname.includes('/personal/')
                    || pathname.includes('/personalArticle/')
                    || pathname.includes('/order/')){
                    setTimeout(() => {
                        location.href = '/login?redirect='+ encodeURIComponent(path);
                    }, 1000);
                    return false;
                }
                $('div.hasLogin').remove();
                $('div.noLogin').removeClass('sy-hidden');
            }
        },
        success: function (res) {
            if(res >= 0){
                const hasLogin = $('div.hasLogin'),
                    noLogin = $('div.noLogin');
                //登录后，不能跳转到登录注册
                if(pathname === '/login'
                    || pathname === '/register'
                    || pathname === '/forgetPwd'){
                    hasLogin.remove();
                    noLogin.removeClass('sy-hidden');
                    location.href = '/';
                    return false;
                }
                noLogin.remove();
                hasLogin.removeClass('sy-hidden');
                return new Promise(resolve => {
                    resolve(res);
                })
            }
        }
    }).then(isLog => {
        //isLog=0，表示已登录
        if(isLog >= 0){
            //设置index首页，slider中“成为译员”按钮跳转
            $('.sliderTranslator').html('立即前往 >>').on('click',function (e){
                e.preventDefault();
                location.href = '/personal/';
            });
            $('.toTranslatorBtn').remove();
            /*
            * 用户已登录，获取个人/团队信息
            * 主要用于header/aside显示设置
            * */
            let userid = sessionStorage.getItem('sy_rm_client_ud');
            $.ajax({
                method: 'get',
                url: baseRMUrl + '/userExtension/findResumeByUserId',
                data: {
                    userId: userid
                },
                dataType: 'json',
                success: function (res){
                    if(res.message ==='success'){
                        const { data } = res;
                        const receiptBtn = $('.receiptOrderBtn');
                        if(data.userExtension){
                            data.userExtension.receipt
                                ? receiptBtn.removeClass('off').addClass('on')
                                : receiptBtn.removeClass('on').addClass('off')
                        }
                        $('.yxz_AsideU').html(data.yxTotalScore ? parseInt(data.yxTotalScore) : '0');
                        $('.score_AsideU').html(parseInt(data.currentPointSummary));
                        $('.idcardName').val(data.userExtension.realName);
                        $('.account_AsideU').html(data.account?hiddenAccount(data.account):' --');
                        $('.nickName_AsideU')
                            .attr('data-am-popover', `{content: '${data.nickName}', trigger: 'hover focus'}`)
                            .html(data.nickName?data.nickName:' --')
                            .popover();

                        data.picturePath && $('.headIcon_AsideU').attr('src', data.picturePath);

                        //注册全局，“身份认证、技能认证”是否通过
                        const resIdentity = data.userExtension.certificatePassed;
                        const resSkill = data.cuLevelList;
                        __api__.isAuth =  __api__.judgeAuth({
                            identity: resIdentity,
                            skill: resSkill
                        });
                    }
                }
            });

            //获取未读消息
            getResponse({
                url:　'/notice/getNoReadCount',
                data: {
                    status: 0
                }
            }).then(data => {
                if(data.message === 'success'){
                    $('.messageProps').html(+data.data ? data.data : '');
                }
            });

            //登录后，添加websocket消息回调
            const sockjs = document.createElement('script'),
                stomp = document.createElement('script');
            sockjs.type = 'text/javascript';
            sockjs.src = '/static/lib/sockjs.min.js';
            stomp.type = 'text/javascript';
            stomp.src = '/static/lib/stomp.min.js';
            document.head.appendChild(sockjs);
            sockjs.onload = function () {
                document.head.appendChild(stomp)
            };
            stomp.onload = function () {
                //连接websocket
                connectSocket(baseUrl + '/gs-guide-websocket', function (res) {
                    if(res){
                        const resJson = JSON.parse(res);
                        if(resJson){
                            //当在消息页面时，有新消息时，显示新消息通知
                            if(resJson.messageType !== '订单消息'){
                                $('label.otherMsg').addClass('will')
                            }else{
                                $('label.orderMsg').addClass('will')
                            }
                            //有新消息时，查询未读消息，显示“未读”条数
                            getResponse({
                                url:　'/notice/getNoReadCount',
                                data: {
                                    status: 0
                                }
                            }).then(data => {
                                if(data.message === 'success'){
                                    $('.messageProps').html(+data.data ? data.data : '');
                                }
                            })
                        }
                    }
                })
            }
        }
    })
}(window, document, jQuery));
