import { loginUrl, baseUrl } from "./interceptor";
import { getResponse } from "./asyncAjax";
import {countDown, getQueryString} from "./utils";
import './modal';

/*
*
* module：views -> account （登录模块）
* export：accountServer
* author：zhaoyong
* date：2019-04-20
*
* */

(function (window, document, $, undefined) {
    'use strict';

//获取手机验证码
    $('#telValidateBtn_Account').on('click', function () {
        const _this = this;
        const isSlide = $('#slideBtn').attr('data-pass'),
            sMobile = $('#telPhone').val();
        if(!(/^1[1-9][0-9]{9}$/.test(sMobile))){
            $.warning('请输入正确的手机号');
            return false;
        }
        if(!isSlide){
            $.warning('请先拖动滑块进行安全验证');
            return false;
        }
        countDown(_this);
        getResponse({
            baseUrl: loginUrl,
            url: '/customer/sendCode',
            data: {
                telephone: sMobile
            }
        }).then(res => {
            res.message === 'success'
                ? $.success('验证码发送成功')
                : $.error(res.message);
        })
    });
//注册
    $('#regBtn_Account').on('click', function () {
        const _this = this;
        const isSlide = $('#slideBtn').attr('data-pass'),
            requiredEles = $('input[required]');
        for(let i = 0; i < requiredEles.length; i++){
            const el = requiredEles[i];
            if(el.value.trim() === ''){
                el.focus();
                $.warning('请输入'+$(el).attr('placeholder'));
                return false;
            }
        }
        if(!isSlide){
            $.warning('请先拖动滑块进行安全验证');
            return false;
        }
        const mobile = $('#telPhone').val(),
            yzCode = $('#telCode').val(),
            password = $('#password').val(),
            applyCode = $('#applyCode').val();
        if(!(/^1[1-9][0-9]{9}$/.test(mobile))){
            $.warning('请输入正确的手机号');
            return false;
        }
        if(password.length < 6 || password.length > 20){
            $.warning('请输入长度为6-20的密码');
            return false;
        }
        $(_this).attr('disabled','disabled');
        $(_this).html('<i class="am-icon-spinner am-icon-pulse"></i>');
        getResponse({
            type: 'post',
            baseUrl: loginUrl,
            url: '/customer/customerRegister',
            data: {
                telephone: mobile,
                password: password,
                invitationCode: applyCode,
                validateCode: yzCode
            }
        }).then(res => {
            if(res.code === '200' && res.message === 'success'){
                $.success('注册成功');
                window.setTimeout(() => {
                    location.href = '/login';
                },1500);
            }else{
                $.error(res.message);
            }
            $(_this).removeAttr('disabled');
            $(_this).html('注 册');
        })
    });
//登录
    $('#loginBtn_Account').on('click', function () {
        const _this = this;
        const requiredEles = $('input[required]');
        for(let i = 0; i < requiredEles.length; i++){
            const el = requiredEles[i];
            if(el.value.trim() === ''){
                el.focus();
                $.warning('请输入'+$(el).attr('placeholder'));
                return false;
            }
        }
        $(_this).attr('disabled','disabled');
        $(_this).html('<i class="am-icon-spinner am-icon-pulse"></i>');
        getResponse({
            type: 'post',
            baseUrl: baseUrl,
            url: '/auth/oauth/token',
            data: {
                client_id: '1',
                client_secret: 'server',
                grant_type: 'password',
                username: $('#account').val(),
                password: $('#password').val()
            }
        }).then(res => {
            return new Promise(resolve => {
                resolve(res);
            })
        }).catch(err => {
            err.responseJSON.error === "invalid_grant"
                ? $.error('用户名和密码不匹配')
                : $.error(err.responseJSON.error);
            $(_this).removeAttr('disabled');
            $(_this).html('登 录');
        }).then(res => {
            //登录获取token成功
            if(res.access_token){
                $.success('登录成功');
                localStorage.setItem('sy_rm_client_access_token', res.access_token);
                getResponse({
                    baseUrl: baseUrl,
                    url: '/auth/current',
                    data: {
                        name: $('#account').val()
                    }
                }).then(res => {
                    if(res.name){
                        localStorage.setItem('sy_rm_client_ud',res.principal.user.id);
                        window.setTimeout(() => {
                            //若存在重定向，则登录成功后跳转
                            if(getQueryString('redirect')){
                                location.href = decodeURIComponent(getQueryString('redirect'));
                            }else{
                                location.href = '/personal/';
                            }
                        }, 500);
                    }
                });
                $(_this).removeAttr('disabled');
                $(_this).html('登 录');
            }
        });
    });
/*
* 忘记密码
* */
//1、获取验证码
    $('#nextBtn_Account').on('click', function () {
        const _this = this;
        const requiredEles = $('input[required]');
        for(let i = 0; i < requiredEles.length; i++){
            const el = requiredEles[i];
            if(el.value.trim() === '' && (el.id === 'telPhone' || el.id === 'telCode')){
                el.focus();
                $.warning('请输入'+$(el).attr('placeholder'));
                return false;
            }
        }
        const isSlide = $('#slideBtn').attr('data-pass'),
            mobile = $('#telPhone').val(),
            code = $('#telCode').val();
        if(!isSlide){
            $.warning('请先拖动滑块进行安全验证');
            return false;
        }
        if(!(/^1[1-9][0-9]{9}$/.test(mobile))){
            $.warning('请输入正确的手机号');
            return false;
        }
        $(_this).attr('disabled','disabled');
        $(_this).html('<i class="am-icon-spinner am-icon-pulse"></i>');
        getResponse({
            type: 'put',
            baseUrl: loginUrl,
            url: '/customer/resetPassword',
            data: {
                tel: mobile,
                verifyCode: code
            }
        }).then(res => {
            if(res.code === '200' && res.message === 'success'){
                const currentForm = $(_this).parents('.am-form'),
                    index = currentForm.next('form').index();
                $('div.sy-sp').eq(index-1).addClass('sy-forget-active');
                currentForm.addClass('sy-hidden').next('form').removeClass('sy-hidden');
            }else{
                $.error(res.message);
            }
            $(_this).removeAttr('disabled');
            $(_this).html('下一步');
        });
    });
//2、重置密码
    $('#updateBtn_Account').on('click', function () {
        const _this = this;
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
        if(password.length < 6 || password.length > 20 || rePassword.length < 6 || rePassword.length > 20){
            $.warning('请输入长度为6-20的密码');
            return false;
        }
        if(password !== rePassword){
            $.warning('两次输入的密码不相同');
            return false;
        }
        $(_this).attr('disabled','disabled');
        $(_this).html('<i class="am-icon-spinner am-icon-pulse"></i>');
        getResponse({
            type: 'put',
            baseUrl: loginUrl,
            url: '/customer/setNewPassword',
            data: {
                newPawwword: password
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
            $(_this).removeAttr('disabled');
            $(_this).html('提 交');
        });

    });
//Enter键：登录、注册
    $(document).keyup(function (event) {
        if(event.keyCode === 13){
            $('#regBtn_Account').click();
            $('#loginBtn_Account').click();
        }
    })
})(window, document, jQuery);
