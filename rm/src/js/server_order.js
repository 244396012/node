/*
* module：views -> order （订单中心模块）
* export：orderServer
* author: zy
* date: 2019/08/09
*
* */
import { basePMUrl, orderApi, orderOtherApi } from "./interceptor";
import { getResponse } from "./asyncAjax";
import { formatMoneyTypeEn, formatMoneyType } from './utils';
import './modal';

const orderServer = (function (global, document, $, undefined) {

    'use strict'; 

    function isEmpty(str) {
        return typeof(str) === "number" ? str : str || '--';
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
                isOn = tempJson.status === '10';
            const tk = sessionStorage.getItem('sy_rm_client_access_token');
            pageNo <= 1 && $('section.cnt.orderContent').empty();
            if(res.success){
                let bodyStr = '',
                    joinArr = [];
                let result = res.data.list ? res.data.list : [];
                unClaimed && $('.filter>a.item').eq(0).find('span').html(res.data.totalRow);
                result.forEach(item => {
                    let unitPrice = '', totalWork = '';
                    let operateStr = '';
                    //文档翻译
                    if(+item.orderType === 1){
                        unitPrice = `<em>${formatMoneyTypeEn(item.currencyType)+isEmpty(item.unitPrice)}/千字</em>`;
                        totalWork = `<span>${tempJson.status === '25' ? isEmpty(item.ratioWords) : '约'+isEmpty(item.workLoad)}字</span>`;
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
                                    onePrice = `${formatMoneyTypeEn(item.currencyType)+item.cerPirce}/份 ...`
                                }
                                mulWork += `${certificate(item.cerType)} ${item.cerNum}份；`;
                                mulPrice += `${certificate(item.cerType)} ${formatMoneyTypeEn(item.currencyType)+item.cerPirce}/份；`;
                            })
                        }
                        unitPrice = `<em class="popoverPrice"
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
                                        <label>${isEmpty(item.responsibilityTypeZh)}</label>
                                        <span>项目编号：${item.projectId}</span>
                                        <span>任务编号：${item.taskId}</span>
                                        ${item.jsTimeQuery ? `<span class="sy-float-r">结算时间：${isEmpty(item.jsTimeQuery)}</span>` : ''}
                                        <span class="sy-float-r">${
                                            tempJson.status === '25' 
                                                ? `完成时间：${item.realCompletTime.slice(0,16)}` 
                                                : `要求返稿时间：${item.requireTime.slice(0,16)}`
                                        }</span>
                                    </div>
                                    <div class="detail">
                                        <div>
                                            <em>${isEmpty(item.taskName)}</em>
                                            ${totalWork}
                                        </div>
                                        <div>
                                            <em>${isEmpty(item.orderTypeZh)}</em>
                                            <span>${item.sourceLanZh}-${item.targetLanZh}</span>
                                        </div>
                                        <div>
                                            ${unitPrice}
                                            <span>${
                                                tempJson.status === '25'
                                                    ? `总金额：${isEmpty(item.totalPrice) !== '--' ? formatMoneyTypeEn(item.currencyType)+isEmpty(item.totalPrice) : '--'}`
                                                    : ` `
                                            }</span>
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
                //最后一页，隐藏加载更多按钮
                if(res.data.totalPage === pageNo - 1){
                    moreBtn.addClass('sy-hidden');
                }
                $('.orderContent').append(bodyStr);
                $('.popoverPrice').popover();
                $('.popoverWork').popover();
                //总价计算
                if(res.data.link.totalPrice){
                    let totalArr = [];
                    for(let i = 0, len = res.data.link.totalPrice.length; i < len; i++){
                        const price = res.data.link.totalPrice[i],
                            currencyEn = formatMoneyTypeEn(price.currencyType);
                        totalArr.push(currencyEn + price.totalPrice);
                    }
                    location.hash === '#25' && $('.totalBox').html(res.data.totalRow > 0 && `总金额：${totalArr.join(',')}`);
                }
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
                        const isComp = config.data.status === '0';
                        tempObj.prop2 = typeWait ? item.tryTaskId : item.tryTransId;
                        tempObj.prop3 = item.languageZh;
                        tempObj.prop4 = isComp
                            ? `完成时间：${item.realCompletTime ? item.realCompletTime.slice(0,16) : item.requireReturnTraftTime.slice(0,16)}`
                            : `要求返稿时间：${item.requireReturnTraftTime.slice(0,16)}`;
                        tempObj.prop5 = item.bookName;
                        tempObj.prop6 = isComp
                            ? `${isEmpty(item.ratioWords ? item.ratioWords : item.actuallyTranslatedWord)}字`
                            : `约${isEmpty(item.actuallyTranslatedWord)}字`;
                        tempObj.prop8 = `${formatMoneyTypeEn(item.currencyType)+isEmpty(item.unitPriceOfTranslation)}/千字`;
                        tempObj.prop9 =  isComp
                            ? `总金额：${isEmpty(item.totalPrice) !== '--' ? formatMoneyTypeEn(item.currencyType)+isEmpty(item.totalPrice) : '--'}`
                            : ` `;
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
                        const isComp = config.data.jsonStr && JSON.parse(config.data.jsonStr).status === '25';
                        tempObj.prop2 = item.taskId;
                        tempObj.prop3 = item.sourceLanZh + '-' + item.targetLanZh;
                        tempObj.prop4 = isComp
                            ? `完成时间：${item.realCompletTime.slice(0,16)}`
                            : `要求返稿时间：${item.requireTime.slice(0,16)}`;
                        tempObj.prop5 = item.taskName;
                        tempObj.prop6 = isComp ? `${isEmpty(item.ratioWords)}字` : `约${isEmpty(item.workLoad)}字`;
                        tempObj.prop8 = `${formatMoneyTypeEn(item.currencyType)+isEmpty(item.unitPrice)}/千字`;
                        tempObj.prop9 =  isComp
                            ? `总金额：${isEmpty(item.totalPrice) !== '--' ? formatMoneyTypeEn(item.currencyType)+isEmpty(item.totalPrice) : '--'}`
                            : ` `;
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
                                        <label>${isEmpty(tempObj.prop1)}</label>
                                        <span>项目编号：${item.projectId}</span>
                                        <span>任务编号：${tempObj.prop2}</span>
                                        ${item.jsTimeQuery ? `<span class="sy-float-r">结算时间：${isEmpty(item.jsTimeQuery)}</span>` : ''}
                                        <span class="sy-float-r">${tempObj.prop4}</span>
                                    </div>
                                    <div class="detail">
                                        <div>
                                            <em>${isEmpty(tempObj.prop5)}</em>
                                            <span>${tempObj.prop6}</span>
                                        </div>
                                        <div>
                                            <em>${typeResult?'图书试译':'图书翻译'}</em>
                                            <span>${tempObj.prop3}</span>
                                        </div>
                                        <div>
                                            <em>${tempObj.prop8}</em>
                                            <span>${tempObj.prop9}</span>    
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
                //最后一页，隐藏加载更多按钮
                if(res.data.totalPage === pageNo - 1){
                    moreBtn.addClass('sy-hidden');
                }
                $('.orderContent').append(bodyStr);
                //总价计算
                if(res.data.link.totalPrice){
                    let totalArr = [];
                    for(let i = 0, len = res.data.link.totalPrice.length; i < len; i++){
                        const price = res.data.link.totalPrice[i],
                            currencyEn = formatMoneyTypeEn(price.currencyType);
                        totalArr.push(currencyEn + price.totalPrice);
                    }
                    (location.hash === '#25' && $('input[name="fileType"]:checked')[0].value === '2' )
                    && $('.totalBox').html(res.data.totalRow > 0 && `总金额：${totalArr.join(',')}`);
                }
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
                                        <label>${isEmpty(item.orderTypeZh)}</label>
                                        <span>项目编号：${item.projectId}</span>
                                        <span>任务编号：${item.taskId}</span>
                                        <span class="sy-float-r">${
                                            tempJson.status === '25'
                                                ? `完成时间：${item.realCompletTime.slice(0,16)}` 
                                                : `要求返稿时间：${item.requireTime.slice(0,16)}`
                                        }</span>
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
                //最后一页，隐藏加载更多按钮
                if(res.data.totalPage === pageNo - 1){
                    moreBtn.addClass('sy-hidden');
                }
                $('.orderContent').append(bodyStr);
                //总价计算
                if(res.data.link.totalPrice){
                    let totalArr = [];
                    for(let i = 0, len = res.data.link.totalPrice.length; i < len; i++){
                        const price = res.data.link.totalPrice[i],
                            currencyEn = formatMoneyTypeEn(price.currencyType);
                        totalArr.push(currencyEn + price.totalPrice);
                    }
                    location.hash === '#25' && $('.totalBox').html(res.data.totalRow > 0 && `总金额：${totalArr.join(',')}`);
                }
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
            headers: {
                'Content-Type': 'application/json'
            },
            url: config.url,
            data: JSON.stringify(config.data)
        }).then(res => {
            console.log(res);
            pageNo <= 1 && $('section.cnt.orderContent').empty();
            if(res.success){
                let bodyStr = '',
                    joinArr = [];
                let result = res.rows || [];
                result.forEach(item => {
                    let tempStr = '',
                        timeStr = `<span class="sy-float-r">${item.requireTimeStart} - ${item.requireTimeEnd}</span>`,
                        pmStr = `PM：${item.giverName}`,
                        proStr = `项目编号：${item.orderId}`;
                    if(config.url.includes('getAssignmentTaskPageList')){//外派
                        tempStr = `<div class="detail">
                                        <div>单价：${item.price}</div>
                                        <div>天数：${item.attNum}</div>
                                        <div>其他费用：${item.otherFee}</div>
                                        <div>预支费用：${item.yuZhiFee}</div>
                                        <div>总价：${item.payables}</div>
                                    </div>`;
                    }else if(config.url.includes('etTransTaskPageList')){ //培训
                        tempStr = `<div class="detail">
                                        <div>任务需求：${item.taskCommand}</div>
                                        <div>课时：${item.courseHour }</div>
                                        <div>课酬：${item.basicCoursePrice }</div>
                                        <div>奖金：${item.otherPrice}</div>
                                        <div>总价：${item.payables}</div>
                                    </div>`;
                        timeStr = `<span class="sy-float-r">${item.implementTime}</span>`;
                        pmStr = `PM：${item.assignerName}`;
                        proStr = `项目编号：${item.projectId}`;
                    }else if(config.url.includes('getInterpretDeviceDetailPageList')){//设备搭建
                        let infoArr = item.tbsInterpretDevicetaskDetailList || [];
                        let oneInfo = '', mulInfo = '', mulInfoArr = [];
                        infoArr.forEach((info, index) => {
                            let oInfo = info.price + '/' + info.useTime + '/' + info.percentage;
                            mulInfoArr.push(oInfo);
                            if(index < 2){
                                oneInfo += oInfo + ' ...'
                            }
                        });
                        mulInfo = mulInfoArr.join(',');
                        let infoHtml = `<span class="popoverInfo" style="font-size: 14px" 
                                           data-am-popover="{content:'${mulInfo}', trigger:'hover'}">${isEmpty(oneInfo)}</span>`;
                        tempStr = `<div class="detail">
                                        <div>
                                            <em style="font-weight: 700">单价/天数/比例</em>
                                            ${infoHtml}
                                        </div>
                                        <div>
                                            <em>住宿费：${item.hotelFee}</em>
                                            <em>其他费用：${item.otherFee}</em>
                                        </div>
                                        <div>
                                            <em>交通费：${item.tranFee }</em>
                                            <em>预支费用：${item.yuZhiFee }</em>
                                        </div>
                                        <div>
                                            <em>扣款：${item.koukuan}</em>
                                        </div>
                                        <div>总价：${item.payables}</div>
                                    </div>`;
                    }else {//会展
                        tempStr = `<div class="detail">
                                        <div>
                                            <em>单价：${item.price}</em>
                                            <em>加班费：${(item.overtimeHours*item.overtimePrice)}</em>
                                        </div>
                                        <div>
                                            <em>天数：${item.dayNum}</em>
                                            <em>加班时长：${item.overtimeHours}</em>
                                        </div>
                                        <div>
                                            <em>住宿费：${item.hotelFee}</em>
                                            <em>其他费用：${item.otherFee}</em>
                                        </div>
                                        <div>
                                            <em>交通费：${item.tranFee }</em>
                                            <em>预支费用：${item.yuZhiFee }</em>
                                        </div>
                                        <div>
                                            <em>扣款：${item.koukuan}</em>
                                            <em>比例：${item.percentage + '%'}</em>
                                        </div>
                                        <div>总价：${item.payables}</div>
                                    </div>`;
                    }
                    joinArr.push(`<div class="item">
                                    <div class="base">
                                        <label>普通订单</label>
                                        <span>${proStr}</span>
                                        <span style="padding-left: 120px">${item.orgName}</span>
                                        <span style="padding-left: 120px">${pmStr}</span>
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
                }else if(res.total === 0){
                    bodyStr = `<div class="empty"></div>`;
                    moreBtn.addClass('sy-hidden');
                }
                //最后一页，隐藏加载更多按钮
                if(Math.ceil(res.total/config.data.pageSize) === pageNo - 1){
                    moreBtn.addClass('sy-hidden');
                }
                $('.orderContent').append(bodyStr);
                $('.popoverInfo').popover();
                $('.totalBox').html(res.total > 0 && ('总金额：￥'+res.sum));
            }else{
                $.error(res.msg);
                $('section.orderContent').html(`<div class="empty"></div>`)
            }
            $('.my-loading').remove();
            $('.searchBtn').removeAttr('disabled');
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