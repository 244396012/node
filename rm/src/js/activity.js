/*
* module：views -> activity （活动模块）
* export：activityServer
* author: zy
* date: 2019/10/18
*
* */
import { baseRMUrl } from "./interceptor";
import { getResponse } from "./asyncAjax";
import {  } from "./utils";
import './modal';

;(function (api, global, document, $) {

    //获取抽奖次数
    const getPrizeTimes = async function (id) {
        return await getResponse({
            url: '/operateActivity/getPrizeChance',
            data: { activityId: id }
        }).then(res => {
            if(res.message === 'success'){
                $('.rewardTimes').html(res.data)
            }
        })
    };

    //未中奖消息提示
    const noPrizeModal = function () {
        const rewardTip = `
             <div class="am-modal am-modal-confirm noRewardTipModal">
                <div class="am-modal-dialog" style="width: 360px};">
                    <div class="am-modal-hd">提示
                        <a href="javascript: void(0)" class="am-close am-close-spin" data-am-modal-close>&times;</a>
                    </div>
                    <div class="am-modal-bd">
                        <h2 class="sy-orange">谢谢参与</h2>
                        <p class="sy-font-md">不要气馁，明天再来试一下吧</p>
                    </div>
                    <div class="am-modal-footer sy-center" style="margin-bottom: 2rem;">
                        <span class="am-modal-btn sy-btn sy-btn-white sy-btn-sm" data-am-modal-close>我知道了</span>
                    </div>
                </div>
             </div>`;
        $(".am-modal.noRewardTipModal").remove();
        $('body').append(rewardTip);
        $('.noRewardTipModal').modal()
    };


    //中奖消息提示
    const prizeModal = function (param) {
        const rewardTip = `
             <div class="am-modal am-modal-confirm rewardTipModal">
                <div class="am-modal-dialog" style="width: 360px};">
                    <div class="am-modal-hd">提示
                        <a href="javascript: void(0)" class="am-close am-close-spin" data-am-modal-close>&times;</a>
                    </div>
                    <div class="am-modal-bd">
                        <h2 class="sy-orange">中奖啦</h2>
                        <p class="sy-font-md">恭喜你获得 <span class="sy-orange">${param.prizeInfo}</span></p>
                    </div>
                    <div class="am-modal-footer sy-center" style="margin-bottom: 2rem;">
                        ${!param.type ? `<span class="am-modal-btn sy-btn sy-btn-green sy-btn-sm"
                                              onclick="$('.fillLocation').modal()">填写收货地址</span>`
                                     : `<span class="am-modal-btn sy-btn sy-btn-green sy-btn-sm"
                                              onclick="location.href='/personal/'">去查看</span>
                                        <p class="tips" style="margin-top: 5px">${param.prizeType}已进入个人账户，请注意查收</p>`}
                    </div>
                </div>
             </div>`;
        $(".am-modal.rewardTipModal").remove();
        $('body').append(rewardTip);
        $('.rewardTipModal').modal()
    };

    //进入抽奖程序
    api.joinWheel = function (wheel) {

        const baseInfo = JSON.parse(sessionStorage.getItem('sy_rm_client_ubase')) || {};

        let wheelIndex = -1,
            activityId = '',
            prizeRecordId = '';

        //获取活动列表
        ;(async function () {
            if(!baseInfo.account) {
                return false
            }
            return await getResponse({
                url: '/operateActivity/getActivityList',
                data: {
                    pageNo: 0,
                    pageSize: 99,
                    state: '进行中',
                    type: '大转盘活动'
                }
            }).then(res => {
               if(res.message === 'success'){
                    for(let i = 0; i < res.data.content.length; i++){
                        const item = res.data.content[i];
                        if(item.state === '进行中' && item.type === '大转盘活动'){
                            return item.id || '';
                        }
                    }
                }
            })
        }()).then(id => {
            if(id){
                activityId = id;
                getPrizeTimes(id)
            }
        });

        let isWheelEnd = true,
            wheelTimer = null;
        //开始抽奖
        $('.zhuanpanBtn').on('click', function () {
            if(!__api__.isAuth) {
                $.warning('请先登录');
                return false
            }
            if(!activityId){
                $.warning('请稍等，活动参数正在初始化');
                return false
            }
            if($('.rewardTimes').text() === '0'){
                $.warning('对不起，您暂时没有机会抽奖哦');
                return false
            }
            if(!isWheelEnd){
                $.warning('请稍等，本次抽奖还未完成');
                return false
            }
            wheel.draw()
        });

        wheel.on('start', function () {
            isWheelEnd = false;
            // 请求获取中奖结果
            getResponse({
                type: 'post',
                url: '/operateActivity/prize',
                data: { activityId: activityId }
            }).then(res => {
                console.log(res.data);
                if(res.message === 'success' && res.data.prizeNo >= 0){
                    wheel.setResult(res.data.prizeNo);
                    //轮询，直到转盘停止转到，弹出中奖消息
                    wheelTimer = setInterval(() => {
                        if(isWheelEnd){
                            if(res.data.prizaLevel !== '明天再来'){
                                let info = res.data.prizeLevel + ' '+ res.data.prizeName;
                                if(res.data.prizeType === '积分' || res.data.prizeType === '现金红包'){
                                    info = res.data.prizeLevel + ' ' + res.data.num + res.data.prizeType
                                }
                                const param = {
                                    recordId: res.data.recordId,
                                    prizeInfo: info,
                                    prizeType: res.data.prizeType,
                                };
                                if(res.data.prizaLevel !== '幸运奖'){
                                    param.type = '1';
                                    $('.confirmLocation').attr('id', res.data.recordId)
                                }
                                prizeModal(param)
                            }else{
                                noPrizeModal()
                            }
                            clearInterval(wheelTimer)
                        }
                    }, 200);
                }else{
                    wheel.setResult(wheelIndex)
                }
            })
           // // 假如请求出错
           // setTimeout(function () {
           //   wheel.reset()
           // }, 1000)
        });
        wheel.on('end', function () {
            isWheelEnd = true;
            getPrizeTimes(activityId)
        })

        //获取抽奖记录
        ;(function () {
            if(!baseInfo.account) {
                return false
            }
            let GetMessage = new ChPaging(".rewardPagination",{
                limit: 10,
                viewNumber : false,
                xhr : {
                    url : baseRMUrl + '/operateActivity/getPrizeRecords',
                    data : {
                        pageNo: 0,
                        pageSize: 10,
                        account: baseInfo.account
                    }
                },
                xhrSuccess : function(res){
                    return {data : res, count : res.data.totalElements}
                },
                operationReady(param){//操作翻页执行前准备钩子
                    GetMessage.set({//重置请求参数
                        xhr : {
                            data : {
                                pageNo: param.current-1,
                                pageSize: param.limit
                            }
                        }
                    }, true);
                },
                operationCallback (msg, res){//处理数据
                    let resultStr = '<tr class="empty"><td colspan="3">暂无记录</td></tr>';
                    if(res.message === 'success'){
                        const data = res.data.content;
                        let mesStr = "", strArr = [];
                        data.forEach(item => {
                            let opeStr = `<a class="sy-orange add" 
                                             href="javascript:;" 
                                             data-id="${item.id}"
                                             data-area="${item.address}"
                                             data-phone="${item.telephone}">添加收货地址</a>`;
                            if(item.releaseStatus === '未发放' && item.address){
                                opeStr = `<a class="sy-orange hover add" 
                                             href="javascript:;" 
                                             data-id="${item.id}"
                                             data-area="${item.address}"
                                             data-phone="${item.telephone}"
                                             data-am-popover="{content: '${item.address}', trigger: 'hover focus'}">修改收货地址</a>`;
                            }
                            if(item.releaseStatus === '已发放'
                                || item.prizeLevel === '幸运奖'
                                || item.prizeLevel === '明天再来'){
                                opeStr = ''
                            }
                            mesStr = `
                            <tr>
                                <td>${item.winningTime}</td>
                                <td>${item.prizeName}</td>
                                <td>${opeStr}</td>
                            </tr>`;
                            strArr.push(mesStr);
                        });
                        data.length > 0 && (resultStr = strArr.join(''));
                    }
                    $('.rewardList').html(resultStr);
                    $('a.hover').popover()
                }
            });
        }());

        //抽奖记录
        $('.rewardHistoryBtn').on('click', function () {
            if(!baseInfo.account) {
                $.warning('请先登录');
                return false
            }
            $('.rewardHistory').modal()
        });

        //修改收货地址
        $('.rewardList').on('click', function (e) {
            const target = e.target;
            if($(target).hasClass('add')){
                const addressArr = $(target).attr('data-area').split(' '),
                    phone = $(target).attr('data-phone');
                $('.control-phone').val(phone);
                $('.control-province').val(addressArr[0]).change();
                $('.control-city').val(addressArr[1]);
                $('.control-area').val(addressArr[2]);
                $('.control-detail').val(addressArr[3]);
                $('.fillLocation').modal();
                $('.confirmLocation').attr('id',$(target).attr('data-id'))
            }
        });

        //添加收货地址
        $('.confirmLocation').on('click', function () {
            const _this = this;
            const phone = $('.control-phone').val(),
                province = $('.control-province').val(),
                city = $('.control-city').val(),
                area = $('.control-area').val(),
                detail =  $('.control-detail').val();
            if(!/^1[1-9][0-9]{9}$/.test(phone)){
                $.warning('请输入正确的联系方式');
                return false
            }
            if(!province){
                $.warning('请填写收件地址');
                return false
            }
            if(!_this.id) return;
            getResponse({
                type: 'post',
                url: '/operateActivity/addAddress',
                data: {
                    telephone: phone,
                    address: province + ' ' + city + ' ' + area + ' ' + detail,
                    winningRecordId: _this.id
                }
            }).then(res => {
                if(res.message === 'success'){
                    $.success('已添加收货地址');
                    setTimeout('location.reload()', 500)
                }else{
                    $.error(res.message)
                }
            })
        })
    }


}(window.__api__ || {}, window, document, jQuery));

