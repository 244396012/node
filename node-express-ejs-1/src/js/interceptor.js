import api_config from '../../api_config';

export const baseUrl = api_config.baseURL;
export const loginUrl = api_config.loginURL;
export const baseRMUrl = api_config.baseRMURL;

/*
*
* request拦截器，给请求头headers添加 token
*
* */
$.ajaxSetup({
    headers: {
        'Cache-Control': 'no-cache',
        'If-Modified-Since': '0',
        'WithCredentials': true,
        'CrossDomain': true
    },
    timeout: 10000,
    beforeSend: function (xhr, request) {
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

        }else {
            const token = localStorage.getItem('sy_rm_client_access_token');
            xhr.setRequestHeader('Authorization','bearer '+token);
        }
    },
    error: function (xhr) {
        const path = location.pathname + location.search;
        //用户登录信息已过期，做相应处理
        if(xhr.status === 401){
            //清除storage本地数据
            localStorage.removeItem('sy_rm_client_ud');
            localStorage.removeItem('sy_rm_client_access_token');
            localStorage.removeItem('sy_rm_client_choice_test');
            localStorage.removeItem('sy_rm_client_choice_test_no');
            /*
            * 根据uri做判断，若uri中包括 ‘personal’和‘personalArticle’
            * 即在非“个人中心”、“个人主页”，则不跳转留在当前页面
            * 否则提示用户，跳转到登录页面
            */
            if(!(path.includes('/personal/') || path.includes('/personalArticle/'))){
                return false;
            }
            $.error('登录信息已过期，请重新登录');
            window.setTimeout(() => {
                location.href = '/login?redirect='+ encodeURIComponent(path);
            }, 1000);
        }
    }
});

//判断用户是否登录，处理header标签中用户信息展示
(function () {
    const path = location.pathname + location.search;
    $.ajax({
        type: 'post',
        url: loginUrl + '/user/judgeUserLogin/test',
        headers: {
          'Cache-Control': 'private,max-age=3600'
        },
        dataType: 'json',
        error: function (res) {
            const afterLogin = ['/personal/', '/personalArticle/'];
            if(res.responseJSON.error === 'invalid_token' || res.responseJSON.error === 'unauthorized'){
                if(location.pathname.includes('/personal/') ||
                    location.pathname.includes('/personalArticle/')){
                    location.href = '/login?redirect='+ encodeURIComponent(path);
                    return false;
                }
                $('div.hasLogin').remove();
                $('div.noLogin').removeClass('sy-hidden');
            }
        },
        success: function (res) {
            if(res === 0){
                const hasLogin = $('div.hasLogin'),
                    noLogin = $('div.noLogin');
                if(location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgetPwd'){
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
        if(isLog === 0){
            //设置index首页，slider中“成为译员”按钮跳转
            $('#sliderTranslator_Index').html('立即前往 >>').on('click',function (e){
                e.preventDefault();
                location.href = '/personal/';
            });
            $('#translatorBtn_Index').remove();
            /*
            * 用户已登录，获取个人信息
            * 主要用于header标签中用户设置
            * */
            $.ajax({
                method: 'get',
                url: baseRMUrl +'/userExtension/findResumeByUserId',
                data: {
                    userId: localStorage.getItem('sy_rm_client_ud')
                },
                dataType: 'json',
                success: function (res){
                    if(res.message ==='success'){
                        const receiptBtn = $('#receiptOrder_Header');
                        if(res.data.userExtension){
                            +res.data.userExtension.receipt
                                ? receiptBtn.removeClass('on').addClass('off')
                                : receiptBtn.removeClass('off').addClass('on')
                            ;
                        }
                        $('.account_AsideU').html(res.data.account).attr('title', res.data.account);
                        $('.nickName_AsideU').html(res.data.nickName).attr('title', res.data.nickName);
                        if(res.data.picturePath){
                            $('.headIcon_AsideU').attr('src', res.data.picturePath);
                            $('#headIcon_Header').attr('src', res.data.picturePath);
                        }
                        const baseStr = {
                            account: res.data.account,
                            nickName:res.data.nickName,
                            phone:res.data.telephone,
                            picture: res.data.picturePath
                        };
                        $('body').append(`<div id="loginUserBase" class="sy-hidden">${JSON.stringify(baseStr)}</div>`);

                        //注册全局，“身份认证、技能认证”是否通过
                        const resIdentity = res.data.userExtension.certificatePassed;
                        const resSkill = res.data.cuLevelList;
                        __api__.isAuth =  __api__.judgeAuth({
                            identity: resIdentity,
                            skill: resSkill
                        });
                        //阻止默认跳转，添加userCode参数
                        $('a.myAppraise').click((e) => {
                            e.preventDefault();
                            location.href = '/personal/appraise?uc=' + res.data.userCode;
                        });

                    }
                }
            });
        }
    })
}());
