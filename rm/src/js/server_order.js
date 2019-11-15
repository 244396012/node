/*
* module：views -> order （订单中心模块）
* export：orderServer
* author: zy
* date: 2019/08/09
*
* */
import { basePMUrl, orderApi, orderOtherApi } from "./interceptor";
import { getResponse } from "./asyncAjax";
import './modal';

const orderServer = (function (global, document, $, undefined) {

    'use strict';

    function isEmpty(str) {
        return str || '--';
    }

    //证件类型
    function certificate(str) {
        switch (String(str)){
            case '701': return '户口本';
            case '702': return '出生证';
            case '703': return '结婚证';
            case '704': return '身份证';
            case '705': return '驾驶证';
            case '706': return '四六级';
            case '707': return '营业执照';
            case '791': return '毕业证';
            case '792': return '学位证';
            case '793': return '成绩单';
            case '794': return '出生证明';
            case '795': return '存款证明';
            case '796': return '在职证明';
            case '797': return '病例';
            case '798': return '体检报告';
            case '799': return '其他';
            default: return str
        }
    }

    //获取个人基本信息，从localStorage
    const baseInfo = JSON.parse(sessionStorage.getItem('sy_rm_client_ubase'));
/*
* 获取status条目
* 列表类型（1、文档 2、证件 3、图书 4、dtp 5、(文档和证件)）
* */
    function getOrderStatusNum(config) {
        config = config || {};
        getResponse({
            baseUrl: basePMUrl,
            url: config.url,
            data: {
                type: config.type
            }
        }).then(res => {
            if(res.success){
                const { data } = res;
                const items = $('.filter>a.item');
                let order = 2;
                items.toArray().forEach(item => {
                    const spanEl = $(item).find('span');
                    if(!config.type && !$(item).hasClass('sy-hidden')){
                        spanEl.html(data[order]);
                        order --;
                    }else{
                        const hash = item.getAttribute('href').slice(1);
                        if(hash){
                            spanEl.html(data[hash]?data[hash]:'0');
                        }
                    }
                });
            }
        })
    }


//获取未领取条目
    function getNoAcceptNum(config) {
        getResponse({
            method: 'get',
            baseUrl: basePMUrl,
            url: config.url,
            data: config.data
        }).then(res => {
            if(res.success){
                $('.filter>a.item').eq(0).find('span').html(res.data.totalRow);
            }
        })
    }

/*
* 获取订单服务列表
* status：查询状态：10：进行中 20、已提交 25：已完成 21、终止/退稿
* type：列表类型（1、文档 2、证件 3、图书 4、dtp 5、(文档和证件)）
*
* */

//领取任务
    function receiveOrder (config){
        $.confirm('确认领取该任务吗？');
        $('.confirmModal').modal({
            closeViaDimmer: false,
            onConfirm: function (e) {
                $.loading('领取中...');
                getResponse({
                    type: config.type || 'GET',
                    baseUrl: basePMUrl,
                    url: config.url,
                    data: config.params
                }).then(res => {
                    $('.my-loading').remove();
                    if(res.success){
                        $.success('领取成功');
                        location.reload();
                    }else{
                        $.error(res.msg);
                    }
                })
            },
            onCancel: function (e) { }
        })
    }
/*
* 订单服务
* */
    function getOrderService (config){

        config = config || {};
        config.method = config.method || "POST";
        config.data = config.data || {};

        let moreBtn = $(".order_LoadMoreBtn"),
            pageEl = $('.order_PageNo'),
            pageNo = +pageEl.val();

        $.loading('获取数据');
        $('.filter').attr('disabled', 'disabled');
        moreBtn.addClass('sy-hidden');
        return getResponse({
            type: config.method,
            baseUrl: basePMUrl,
            url: config.url,
            data: config.data
        }).then(res => {
            const unClaimed = config.data.type;
            const tempJson = config.data.jsonStr && JSON.parse(config.data.jsonStr) || {},
                isOn = +tempJson.status === 10;
            const tk = sessionStorage.getItem('sy_rm_client_access_token');
            pageNo <= 1 && $('section.cnt.orderContent').empty();
            if(res.success){
                let bodyStr = '',
                    joinArr = [];
                let result = res.data.list ? res.data.list : [];
                unClaimed && $('.filter>a.item').eq(0).find('span').html(res.data.totalRow);
                result.forEach(item => {
                    let totalPrice = '', totalWork = '';
                    let operateStr = '';
                    //文档翻译
                    if(+item.orderType === 1){
                        totalPrice = `<em>￥${isEmpty(item.unitPrice)}/千字</em>`;
                        totalWork = `<span>约${isEmpty(item.workLoad)}字</span>`;
                        if(unClaimed){
                            operateStr = `<a href="javascript:;"
                                             onclick="window.open('${basePMUrl}/DTPTask/view?fileId=${item.fileId}&staffNum=${baseInfo.userCode}&path=','_blank')"
                                             class="sy-btn sy-btn-sm sy-btn-green">预览</a>`;
                        }
                    }else{
                        //证件翻译时，是否存在多个证件类型
                        const isObj = item.workLoad && item.workLoad.includes('[');
                        let oneWork = '', onePrice = '', mulWork = '', mulPrice = '';
                        if(isObj){
                            const workArr = JSON.parse(item.workLoad) || [];
                            workArr.forEach((item, index) => {
                                if(index < 1){
                                    oneWork = `${certificate(item.cerType)} ${item.cerNum}份 ...`;
                                    onePrice = `￥${item.cerPirce}/份 ...`
                                }
                                mulWork += `${certificate(item.cerType)} ${item.cerNum}份；`;
                                mulPrice += `${certificate(item.cerType)} ￥${item.cerPirce}/份；`;
                            })
                        }
                        totalPrice = `<em class="popoverPrice"
                                          data-am-popover="{content:'${mulPrice}', trigger:'hover'}">${isEmpty(onePrice)}</em>`;
                        totalWork = `<span class="popoverWork" 
                                           data-am-popover="{content:'${mulWork}', trigger:'hover'}">${isEmpty(oneWork)}</span>`;
                    }
                    //待领取状态
                    if(unClaimed){
                        operateStr += `<a href="javascript:;"
                                         ${item.receiveIs === '1'?'disabled':''}
                                          onclick="__api__.receiveOrder({
                                            params: {
                                                taskId: '${item.taskId}',
                                                staffNum: '${baseInfo.userCode}',
                                                taskType: '${item.taskType}'
                                            },
                                            url: '/transTask/receiveCompleteTask'
                                          })" class="sy-btn sy-btn-sm sy-btn-green" >${item.receiveIs === '1'?'已领取':'领取'}</a>`;
                    }else{
                        let isBack = (config.data.jsonStr && config.data.jsonStr.includes('21')) || false, //退稿或终止
                            txt = isOn ? '立即进入':'查看详情';
                        if(+item.taskStatus === 21 || +item.taskStatus === 22){
                            isBack && (operateStr = `<span>${+item.taskStatus === 21 ? '已终止' : '已退稿'}</span>`);
                        }else{
                            if(+item.orderType === 1){ //文档
                                operateStr = `<a href="${orderApi}/PartTaskDetail?projectid=${item.projectId}&taskid=${item.taskId}" 
                                                 target="${tk}"
                                                 class="sy-btn sy-btn-sm sy-btn-green">${txt}</a>`
                            }else{//证件
                                operateStr = `<a href="${orderApi}/PartCertificatesTaskDetail?projectid=${item.projectId}&taskid=${item.taskId}" 
                                                 target="${tk}"
                                                 class="sy-btn sy-btn-sm sy-btn-green">${txt}</a>`
                            }
                        }
                    }
                    joinArr.push(`<div class="item" key="${item.taskId}">
                                    <div class="base">
                                        <label>${ isEmpty(item.responsibilityTypeZh) }</label>
                                        <span>订单编号：${ item.taskId }</span>
                                        <span>${item.sourceLanZh}-${item.targetLanZh}</span>
                                        <span class="sy-float-r">要求返稿时间：${item.requireTime.slice(0, -3)}</span>
                                    </div>
                                    <div class="detail">
                                        <div>
                                            <em>${isEmpty(item.taskName)}</em>
                                            ${totalWork}
                                        </div>
                                        <div>
                                            <em>${isEmpty(item.orderTypeZh)}</em>
                                            <span>${+item.orderType === 1 ? isEmpty(item.qualityGradeZh) : ''}</span>
                                        </div>
                                        <div>
                                            ${totalPrice}
                                            <span>${isEmpty(item.settlementTypeZh)}</span>
                                        </div>
                                        <div>${operateStr}</div>
                                    </div>
                                </div>`);
                });
                pageNo += 1;
                pageEl.val(pageNo);
                if(result.length > 0){
                    bodyStr = joinArr.join('');
                    moreBtn.removeClass('sy-hidden');
                }else if(res.data.totalRow === 0){
                    bodyStr = `<div class="empty"></div>`;
                    moreBtn.addClass('sy-hidden');
                }
                if(res.data.totalPage === pageNo-1){
                    moreBtn.addClass('sy-hidden');
                }
                $('.orderContent').append(bodyStr);
                $('.popoverPrice').popover();
                $('.popoverWork').popover();
            }else{
                $.error(res.msg);
                $('section.orderContent').html(`<div class="empty"></div>`)
            }
            $('.my-loading').remove();
            $('.filter').removeAttr('disabled');
            moreBtn.removeAttr('disabled').html('加载更多');
        })
    }
/*
* 图书翻译
* */
    function getOrderBook (config){
        config = config || {};
        config.method = config.method || "POST";
        config.data = config.data || {};

        let moreBtn = $(".order_LoadMoreBtn"),
            pageEl = $('.order_PageNo'),
            pageNo = +pageEl.val();
        //根据参数，判断翻译、试译类型和状态
        let typeResult = '', typeWait = '';
        if(config.data.status || (!config.data.status && !config.data.type && !config.data.jsonStr)){
            typeResult = '图书试译';
        }
        if(!config.data.status && !config.data.type && !config.data.jsonStr){
            typeWait = '试译待领取';
        }else if(config.data.type){
            typeWait = '翻译待领取';
        }

        $.loading('获取数据');
        $('.filter').attr('disabled', 'disabled');
        moreBtn.addClass('sy-hidden');
        return getResponse({
            type: config.method,
            baseUrl: basePMUrl,
            url: config.url,
            data: config.data
        }).then(res => {
            const isOn = (+config.data.status === 1)
                || (config.data.jsonStr && JSON.parse(config.data.jsonStr).status === '10');
            const tk = sessionStorage.getItem('sy_rm_client_access_token');
            pageNo <= 1 && $('section.cnt.orderContent').empty();
            if(res.success){
                let bodyStr = '',
                    joinArr = [];
                let result = res.data.list ? res.data.list : [];
                typeWait && $('.filter>a.item').eq(0).find('span').html(res.data.totalRow);
                result.forEach(item => {
                    let operateStr = '',
                        tempObj = {},
                        isWait = !(config.data.status || config.data.jsonStr);  //待领取状态
                    tempObj.prop1 = item.responsibilityTypeZh;
                    if(typeResult === '图书试译'){
                        tempObj.prop2 = typeWait ? item.tryTaskId : item.tryTransId;
                        tempObj.prop3 = item.languageZh;
                        tempObj.prop4 = item.requireReturnTraftTime.slice(0,-3);
                        tempObj.prop5 = item.bookName;
                        tempObj.prop6 = `约${isEmpty(item.actuallyTranslatedWord)}字`;
                        tempObj.prop8 = `￥${isEmpty(item.unitPriceOfTranslation)}/千字`;
                        if(isWait){
                            operateStr = `<a href="javascript:;"
                                             ${item.receiveIs === '1'?'disabled':''}
                                              onclick="__api__.receiveOrder({
                                                type: 'post',
                                                params: {
                                                    tryTransId: '${item.tryTaskId}',
                                                    staffNum: '${baseInfo.userCode}'
                                                },
                                                url: '/tryTransTask/signUpTryTrans'
                                              })" class="sy-btn sy-btn-sm sy-btn-green">${item.receiveIs === '1'?'已领取':'领取'}</a>`;
                        }
                    }else{
                        tempObj.prop2 = item.taskId;
                        tempObj.prop3 = item.sourceLanZh + '-' + item.targetLanZh;
                        tempObj.prop4 = item.requireTime.slice(0,-3);
                        tempObj.prop5 = item.taskName;
                        tempObj.prop6 = `约${isEmpty(item.workLoad)}字`;
                        tempObj.prop8 = `￥${isEmpty(item.unitPrice)}/千字`;
                        if(isWait){
                            operateStr = `<a href="javascript:;"
                                             ${item.receiveIs === '1'?'disabled':''}
                                              onclick="__api__.receiveOrder({
                                                params: {
                                                    taskId: '${item.taskId}',
                                                    staffNum: '${baseInfo.userCode}',
                                                    taskType: '${item.taskType}'
                                                },
                                                url: '/transTask/receiveCompleteTask'
                                              })" class="sy-btn sy-btn-sm sy-btn-green">${item.receiveIs === '1'?'已领取':'领取'}</a>`;
                        }
                    }
                    if(!isWait){
                        let isBack = (config.data.jsonStr && config.data.jsonStr.includes('21')) || false, //退稿或终止
                            txt = isOn ? '立即进入':'查看详情';
                        if(+item.taskStatus === 21 || +item.taskStatus === 22){
                            isBack && (operateStr = `<span>${+item.taskStatus === 21 ? '已终止' : '已退稿'}</span>`);
                        }else{
                            if(typeResult === '图书试译'){
                                operateStr = `<a href="${orderApi}/PartTrialDetail?id=${item.id}&projectid=${item.projectId}&taskid=${item.tryTransId}" 
                                                 target="${tk}"
                                                 class="sy-btn sy-btn-sm sy-btn-green">${txt}</a>`
                            }else{
                                operateStr = `<a href="${orderApi}/PartBookTaskDetail?projectid=${item.projectId}&taskid=${item.taskId}" 
                                                 target="${tk}"
                                                 class="sy-btn sy-btn-sm sy-btn-green">${txt}</a>`
                            }
                        }
                    }
                    joinArr.push(`<div class="item">
                                    <div class="base">
                                        <label>${ isEmpty(tempObj.prop1) }</label>
                                        <span>订单编号：${ tempObj.prop2 }</span>
                                        <span>${ tempObj.prop3 }</span>
                                        <span class="sy-float-r">要求返稿时间：${ tempObj.prop4 }</span>
                                    </div>
                                    <div class="detail">
                                        <div>
                                            <em>${ isEmpty(tempObj.prop5) }</em>
                                            <span>${ tempObj.prop6 }</span>
                                        </div>
                                        <div>
                                            <em>${ typeResult?'图书试译':'图书翻译' }</em>
                                        </div>
                                        <div>
                                            <em>${ tempObj.prop8 }</em>
                                            <span>原文千字</span>    
                                        </div>
                                        <div>${operateStr}</div>
                                    </div>
                                </div>`);
                });
                pageNo += 1;
                pageEl.val(pageNo);
                if(result.length > 0){
                    bodyStr = joinArr.join('');
                    moreBtn.removeClass('sy-hidden');
                }else if(res.data.totalRow === 0){
                    bodyStr = `<div class="empty"></div>`;
                    moreBtn.addClass('sy-hidden');
                }
                if(res.data.totalPage === pageNo-1){
                    moreBtn.addClass('sy-hidden');
                }
                $('.orderContent').append(bodyStr);
            }else{
                $.error(res.msg);
                $('section.orderContent').html(`<div class="empty"></div>`)
            }
            $('.my-loading').remove();
            $('.filter').removeAttr('disabled');
            moreBtn.removeAttr('disabled').html('加载更多');
        })
    }
/*
* 桌面排版
* */
    function getOrderDtp (config){
        config = config || {};
        config.method = config.method || "POST";
        config.data = config.data || {};

        let moreBtn = $(".order_LoadMoreBtn"),
            pageEl = $('.order_PageNo'),
            pageNo = +pageEl.val();

        $.loading('获取数据');
        $('.filter').attr('disabled', 'disabled');
        moreBtn.addClass('sy-hidden');
        return getResponse({
            type: config.method,
            baseUrl: basePMUrl,
            url: config.url,
            data: config.data
        }).then(res => {
            const tempJson = config.data.jsonStr && JSON.parse(config.data.jsonStr) || {},
                isOn = +tempJson.status === 10;
            const isUnclaimed = !config.data.jsonStr;
            const tk = sessionStorage.getItem('sy_rm_client_access_token');
            pageNo <= 1 && $('section.cnt.orderContent').empty();
            if(res.success){
                let bodyStr = '',
                    joinArr = [];
                let result = res.data.list || [];
                isUnclaimed && $('.filter>a.item').eq(0).find('span').html(res.data.totalRow);
                result.forEach(item => {
                    let operateStr = '',
                        tempObj = {
                            prop1: '',
                            prop2: ''
                        };
                    const workLoad = item.workloads || item.workLoad;
                    if(workLoad && typeof(workLoad) === 'object'){
                        workLoad.forEach(wl => {
                            tempObj.prop1 += `<em>${wl.dtpTypeZh}：${wl.originWorkload}${wl.unit} &nbsp;${wl.unitPrice}元/${wl.unit}</em>`;
                            if(isUnclaimed){
                                tempObj.prop2 += parseFloat(wl.originWorkload)*parseFloat(wl.unitPrice);
                            }
                        })
                    }
                    if(isUnclaimed){
                        operateStr = `<a href="javascript:;"
                                         ${item.receiveIs === '1'?'disabled':''}
                                          onclick="__api__.receiveOrder({
                                            params: {
                                                taskId: '${item.taskId}',
                                                staffNum: '${baseInfo.userCode}',
                                                taskType: '${item.taskType}'
                                            },
                                            url: '/transTask/receiveCompleteTask'
                                          })" class="sy-btn sy-btn-sm sy-btn-green">${item.receiveIs === '1'?'已领取':'领取'}</a>`;
                    }else{
                        tempObj.prop2 = item.totalPrice;
                        let isBack = (config.data.jsonStr && config.data.jsonStr.includes('21')) || false, //退稿或终止
                            txt = isOn ? '立即进入':'查看详情';
                        if(+item.taskStatus === 21 || +item.taskStatus === 22){
                            isBack && (operateStr = `<span>${+item.taskStatus === 21 ? '已终止' : '已退稿'}</span>`);
                        }else{
                            operateStr = `<a href="${orderApi}/PartDTPTaskDetail?taskid=${item.taskId}" 
                                             target="${tk}"
                                             class="sy-btn sy-btn-sm sy-btn-green">${txt}</a>`;
                        }
                    }
                    joinArr.push(`<div class="item">
                                    <div class="base">
                                        <label>${ isEmpty(item.orderTypeZh) }</label>
                                        <span>订单编号：${ item.taskId }</span>
                                        <span style="padding-left: 200px">DTP经理：${ item.dtpManager }</span>
                                        <span class="sy-float-r">要求返稿时间：${ item.requireTime.slice(0,-3) }</span>
                                    </div>
                                    <div class="detail">
                                        <div>
                                            <em>${isEmpty(item.taskName)}</em>
                                        </div>
                                        <div>
                                            <em>${item.taskTypeZh}</em>
                                        </div>
                                        <div>${isEmpty(tempObj.prop1)}</div>
                                        <div>
                                            <em>${isEmpty(tempObj.prop2)}元</em>
                                        </div>
                                        <div>
                                            <a href="${basePMUrl}/transTask/tasking/exportFile?fileId=${item.fileId}"
                                               target="_blank"
                                               class="download"><em>${item.fileName}</em></a>
                                        </div>
                                        <div>${operateStr}</div>
                                    </div>
                                </div>`);
                });
                pageNo += 1;
                pageEl.val(pageNo);
                if(result.length > 0){
                    bodyStr = joinArr.join('');
                    moreBtn.removeClass('sy-hidden');
                }else if(res.data.totalRow === 0){
                    bodyStr = `<div class="empty"></div>`;
                    moreBtn.addClass('sy-hidden');
                }
                if(res.data.totalPage === pageNo-1){
                    moreBtn.addClass('sy-hidden');
                }
                $('.orderContent').append(bodyStr);
            }else{
                $.error(res.msg);
                $('section.orderContent').html(`<div class="empty"></div>`)
            }
            $('.my-loading').remove();
            $('.filter').removeAttr('disabled');
            moreBtn.removeAttr('disabled').html('加载更多');
        })
    }
/*
* 会展、外派、培训、设备搭建
* */
    function getOrderOther(config) {
        config = config || {};
        config.data = config.data || {};

        let moreBtn = $(".order_LoadMoreBtn"),
            pageEl = $('.order_PageNo'),
            pageNo = +pageEl.val();

        $.loading('获取数据');
        moreBtn.addClass('sy-hidden');
        return getResponse({
            type: 'post',
            baseUrl: orderOtherApi,
            url: config.url,
            data: config.data
        }).then(res => {
            pageNo <= 1 && $('section.cnt.orderContent').empty();
            if(res.Success){
                let bodyStr = '',
                    joinArr = [];
                let result = res.Data.Data.rows || [];
                result.forEach(item => {
                    let tempStr = '',
                        timeStr = `<span class="sy-float-r">${item.RequireTimeStart} - ${item.RequireTimeEnd}</span>`;
                    if(config.data.taskType === 'A'){//外派
                        tempStr = `<div class="detail">
                                        <div>单价：${item.Price}</div>
                                        <div>天数：${item.dayNum}</div>
                                        <div>其他费用：${item.OtherFee}</div>
                                        <div>预支费用：${item.Yuzhi}</div>
                                        <div>总价：${item.TotalMoney}</div>
                                    </div>`;
                    }else if(config.data.taskType === 'R'){ //培训
                        tempStr = `<div class="detail">
                                        <div>任务需求：${item.ProjectName}</div>
                                        <div>课时：${item.CourseHour}</div>
                                        <div>课酬：${item.BasicCoursePrice}</div>
                                        <div>奖金：${item.OtherPrice}</div>
                                        <div>总价：${item.TotalMoney}</div>
                                    </div>`;
                        timeStr = `<span class="sy-float-r">${item.CompleteTime}</span>`
                    }else{//会展、设备搭建
                        tempStr = `<div class="detail">
                                        <div>
                                            <em>单价：${item.Price}</em>
                                            <em>加班费：${item.OvertimePrice}</em>
                                        </div>
                                        <div>
                                            <em>天数：${item.DayNum}</em>
                                            <em>加班时长：${item.OvertimeHours}</em>
                                        </div>
                                        <div>
                                            <em>住宿费：${item.HotelFee}</em>
                                            <em>其他费用：${item.OtherFee}</em>
                                        </div>
                                        <div>
                                            <em>交通费：${item.TranFee}</em>
                                            <em>预支费用：${item.Yuzhi}</em>
                                        </div>
                                        <div>
                                            <em>扣款：${item.koukuan}</em>
                                            <em>比例：${item.Percentage}</em>
                                        </div>
                                        <div>总价：${item.TotalMoney}</div>
                                    </div>`;
                    }
                    joinArr.push(`<div class="item">
                                    <div class="base">
                                        <label>普通订单</label>
                                        <span>子订单编号：${item.ProjectID}</span>
                                        <span style="padding-left: 120px">${item.COrgName}</span>
                                        <span style="padding-left: 120px">PM：${item.PM}</span>
                                        ${timeStr}
                                    </div>
                                    ${tempStr}
                                </div>`);
                });
                pageNo += 1;
                pageEl.val(pageNo);
                if(result.length > 0){
                    bodyStr = joinArr.join('');
                    moreBtn.removeClass('sy-hidden');
                }else if(res.Data.Data.total === 0){
                    bodyStr = `<div class="empty"></div>`;
                    moreBtn.addClass('sy-hidden');
                }
                if(Math.ceil(res.Data.Data.total/config.data.pagesize) === pageNo-1){
                    moreBtn.addClass('sy-hidden');
                }
                $('.orderContent').append(bodyStr);
            }else{
                $.error(res.msg);
                $('section.orderContent').html(`<div class="empty"></div>`)
            }
            $('.my-loading').remove();
            moreBtn.removeAttr('disabled').html('加载更多');
        })
    }


    return {
        getNoAcceptNum,
        receiveOrder,
        getOrderStatusNum,
        getOrderService,
        getOrderBook,
        getOrderDtp,
        getOrderOther
    }

}(window, document, jQuery));

export default orderServer;