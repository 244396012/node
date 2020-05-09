/*
*
* module：views -> account （登录模块）
* export：accountServer
* author：zhaoyong
* date：2019-04-20
*
* */

import { loginUrl, baseUrl } from "./interceptor";
import { getResponse } from "./asyncAjax";
import {countDown, getQueryString} from "./utils";
import './modal';

(function (window, document, $, undefined) {

    'use strict';

// 获取DOM元素
    function getEl(str) {
        return document.getElementsByClassName(str).item(0);
    }

// 获取手机验/邮箱证码
    const validateCode_acc = function (_this) {
        const isSlide = __api__.sid,
            account = $('#accountPut').val(),
            codeType = _this.getAttribute('data-type'); //类型：注册 1，忘记密码 2
        if(account.trim() === ''){
            $.warning('请输入手机号/邮箱');
            return false;
        }
        //手机号、邮箱验证
        const regEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
            regTel = /^1[1-9][0-9]{9}$/;
        if(account.includes(' ')){
            $.warning('手机号/邮箱存在多余空格');
            return false
        }
        if(!(regTel.test(account) || regEmail.test(account))){
            $.warning('请输入正确的手机号/邮箱');
            return false;
        }
        if(!isSlide){
            $.warning('请先拖动滑块进行安全验证');
            return false;
        }
        getResponse({
            baseUrl: loginUrl,
            url: '/customer/sendCode',
            data: {
                validateCodeType: codeType,
                telephone: account
            }
        }).then(res => {
            if(res.message === 'success'){
                $.success('验证码发送成功');
                //倒计时120s
                countDown(_this);
            }else{
                $.error(res.message);
            }
        })
    };
// 个人用户注册
    const register_acc = function (_this) {
        const isSlide = __api__.sid,
            requiredEles = $('input[required]');
        //空值验证
        for(let i = 0; i < requiredEles.length; i++){
            const el = requiredEles[i];
            if(el.value.trim() === ''){
                el.focus();
                $.warning('请输入'+$(el).attr('placeholder'));
                return false
            }
        }
        if(!isSlide){
            $.warning('请先拖动滑块进行安全验证');
            return false
        }
        const account = $('#accountPut').val(),
            yzCode = $('#accountCode').val(),
            password = $('#password').val(),
            applyCode = $('#applyCode').val();
        //手机号、邮箱验证
        if(!(/^1[1-9][0-9]{9}$/.test(account) || /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(account))){
            $.warning('请输入正确的手机号/邮箱');
            return false
        }
        if(password.length < 6 || password.length > 20){
            $.warning('请输入长度为6-20的密码');
            return false
        }
        $(_this).attr('disabled','disabled').html('<i class="am-icon-spinner am-icon-pulse"></i>');
        getResponse({
            type: 'post',
            baseUrl: loginUrl,
            url: '/customer/customerRegister',
            data: {
                userName: account,
                password: password,
                invitationCode: applyCode,
                validateCode: yzCode
            }
        }).then(res => {
            if(res.message === 'success'){
                $.success('注册成功');
                setTimeout(() => {
                    location.href = '/login'
                },1500)
            }else{
                $.error(res.message)
            }
            $(_this).removeAttr('disabled').html('注 册')
        })
    };
// 个人/团队用户登录
    const login_acc = function (_this) {
        const requiredEles = $('input[required]');
        //空值验证
        for(let i = 0; i < requiredEles.length; i++){
            const el = requiredEles[i];
            if(el.value.trim() === ''){
                el.focus();
                $.warning('请输入'+$(el).attr('placeholder'));
                return false
            }
        }
        const account = $('#account').val(),
            pwd = $('#password').val();
        if(account.includes(' ')){
            $.warning('手机号/邮箱存在多余空格');
            return false
        }
        $(_this).attr('disabled','disabled').html('<i class="am-icon-spinner am-icon-pulse"></i>');
        getResponse({
            type: 'post',
            baseUrl: baseUrl,
            url: '/auth/oauth/token',
            data: {
                client_id: '1',
                client_secret: 'server',
                grant_type: 'password',
                usertype: '0',
                username: account.trim(),
                password: pwd
            }
        }).then(res => {
            res.access_token && $.success('登录成功');
            return new Promise(resolve => {
                resolve(res);
            })
        }).catch(err => {
            $.error(err.responseJSON.error);
        }).finally(() => {
            $(_this).removeAttr('disabled').html('登 录');
        }).then(resLog => {
            //登录成功，本地存储token
            if(resLog.access_token){
                //设置1天过期的cookie
                let date = new Date(),
                    moreDate = date.getTime() + 24*60*60*1000;
                sessionStorage.setItem('sy_rm_client_access_token', resLog.access_token);
                document.cookie = "sy_rm_client_tk="+ resLog.access_token + ";expires=" + new Date(moreDate)+';';
                //登录成功后，再获取userId
                getResponse({
                    baseUrl: baseUrl,
                    url: '/auth/current',
                    data: {
                        name: $('#account').val()
                    }
                }).then(res => {
                    const user = res.principal.user;
                    if(user.id){
                        const baseStr = {
                            account: user.account,
                            userCode: user.userCode,
                            nickName: user.nickName,
                            realName: user.userExtension.realName,
                            picture: user.picturePath,
                            receipt: user.userExtension.receipt,
                            isTeam: user.userExtension.wheatherTeam
                        };
                        sessionStorage.setItem('sy_rm_client_ubase', JSON.stringify(baseStr));
                        sessionStorage.setItem('sy_rm_client_ud', user.id);
                        document.cookie = "sy_rm_client_ud="+ user.id + ";expires=" + new Date(moreDate);
                        setTimeout(() => {
                            //若存在重定向，则登录成功后跳转
                            if(getQueryString('redirect')){
                                location.href = decodeURIComponent(getQueryString('redirect'));
                            }else{
                                location.href = '/personal/';
                            }
                        }, 500)
                    }
                });
            }
        });
    };

    $('.validateCodeBtn_acc').click(function () {
        validateCode_acc(this);
    });
    $('.registerBtn_acc').click(function () {
        register_acc(this);
    });
    $('.loginBtn_acc').click(function () {
        login_acc(this);
    });

/*
* 忘记密码
* */
// 1、第一步，获取验证码
    const forgetPwdStep_1 = function (_this) {
        const requiredEles = $('input[required]');
        for(let i = 0; i < requiredEles.length; i++){
            const el = requiredEles[i];
            if(el.value.trim() === '' && (el.id === 'telPhone' || el.id === 'telCode')){
                el.focus();
                $.warning('请输入'+$(el).attr('placeholder'));
                return false;
            }
        }
        const isSlide = __api__.sid,
            account = $('#accountPut').val(),
            code = $('#accountCode').val();
        //手机号、邮箱验证
        if(!(/^1[1-9][0-9]{9}$/.test(account) || /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(account))){
            $.warning('请输入正确的手机号/邮箱');
            return false
        }
        if(!isSlide){
            $.warning('请先拖动滑块进行安全验证');
            return false
        }
        if(!code.trim()){
            $.warning('请先输入验证码');
            return false
        }
        $(_this).attr('disabled','disabled').html('<i class="am-icon-spinner am-icon-pulse"></i>');
        getResponse({
            type: 'put',
            baseUrl: loginUrl,
            url: '/customer/resetPassword',
            data: {
                tel: account,
                verifyCode: code
            }
        }).then(res => {
            if(res.message === 'success'){
                const currentForm = $(_this).parents('.am-form'),
                    index = currentForm.next('form').index();
                $('div.sy-sp').eq(index-1).addClass('sy-forget-active');
                currentForm.addClass('sy-hidden').next('form').removeClass('sy-hidden');
                $('.forgetPwdStepBtn_2_acc').attr('data-act', account);
            }else{
                $.error(res.message);
            }
            $(_this).removeAttr('disabled').html('下一步');
        })
    };
// 2、第二步，重置密码
    const forgetPwdStep_2 = function (_this) {
        const requiredEles = $('input[required]');
        for(let i = 0; i < requiredEles.length; i++){
            const el = requiredEles[i];
            if(el.value.trim() === '' && (el.id === 'password' || el.id === 'rePassword')){
                el.focus();
                $.warning('请输入'+$(el).attr('placeholder'));
                return false;
            }
        }
        const password = $('#password').val(),
            rePassword = $('#rePassword').val();
        //密码长度限制、相同验证
        if(password.length < 6 || password.length > 20 || rePassword.length < 6 || rePassword.length > 20){
            $.warning('请输入长度为6-20的密码');
            return false;
        }
        if(password !== rePassword){
            $.warning('两次输入的密码不一致');
            return false;
        }
        $(_this).attr('disabled','disabled').html('<i class="am-icon-spinner am-icon-pulse"></i>');
        getResponse({
            type: 'put',
            baseUrl: loginUrl,
            url: '/customer/setNewPassword',
            data: {
                telphone: $(_this).attr('data-act'),
                newPawwword: password,
                reNewPassword: rePassword,
            }
        }).then(res => {
            if(res.code === '200' && res.message === 'success'){
                $.success('密码重置成功');
                const currentForm = $(_this).parents('.am-form'),
                    index = currentForm.next('form').index();
                $('div.sy-sp').eq(index-1).addClass('sy-forget-active');
                currentForm.addClass('sy-hidden').next('form').removeClass('sy-hidden');
            }else{
                $.warning(res.message);
            }
            $(_this).removeAttr('disabled').html('提 交');
        })
    };

    $('.forgetPwdStepBtn_1_acc').click(function () {
        forgetPwdStep_1(this);
    });
    $('.forgetPwdStepBtn_2_acc').click(function () {
        forgetPwdStep_2(this);
    });

})(window, document, jQuery);
