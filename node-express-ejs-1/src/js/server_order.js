/*
* module：views -> order （订单中心模块）
* export：orderServer
* author: zy
* date: 2019/08/09
*
* */
import { basePMUrl } from "./interceptor";
import { getResponse } from "./asyncAjax";
import { getQueryString } from "./utils";
import './modal';

const orderServer = (function (global, document, $, undefined) {

    'use strict';

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

/*
* 获取订单服务列表
* status：查询状态：10：进行中 20、已提交 25：已完成 21、终止/退稿
* type：列表类型（1、文档 2、证件 3、图书 4、dtp 5、(文档和证件)）
*
* */
//订单服务
    function getOrderListPage_1 (config){
        config = config || {};
        config.method = config.method || "POST";
        config.data = config.data || {};
        let moreBtn = $(".order_LoadMoreBtn"),
            pageEl = $('.order_PageNo'),
            pageNo = +pageEl.val();
        $.loading('获取数据...');
        $('.filter').attr('disabled', 'disabled');
        return getResponse({
            type: config.method,
            baseUrl: basePMUrl,
            url: config.url,
            data: config.data
        }).then(res => {
            if(res.success){
                let bodyStr = '',
                    joinArr = [];
                let result = res.data.list ? res.data.list : [];
                config.data.type && $('.filter>a.item').eq(0).find('span').html(res.data.totalRow);
                result.forEach(item => {
                    let totalPrice = 0, totalWork = 0;
                    //文档翻译
                    if(+item.orderType === 1){
                        totalPrice = `￥${item.unitPrice?item.unitPrice:'--'}/千字`;
                        totalWork = `约${item.workLoad?item.workLoad:'--'}字`;
                    }else{
                        //证件翻译时，是否存在多个证件类型
                        const isObj = item.workLoad.includes('{');
                        if(isObj){
                            const priceObj = JSON.parse(item.unitPrice),
                                workObj = JSON.parse(item.workLoad);
                            for(let prop in workObj){
                                totalPrice += (+workObj[prop]) * (+priceObj[prop]);
                                totalWork += (+workObj[prop]);
                            }
                        }
                        totalPrice = `￥${totalPrice?totalPrice:'--'}`;
                        totalWork = `${totalWork?totalWork:'--'}份`;
                    }
                    joinArr.push(`<div class="item" key="${item.taskId}">
                                    <div class="base">
                                        <label>${item.responsibilityTypeZh}</label>
                                        <span>订单编号：${item.taskId}</span>
                                        <span>${item.sourceLanZh}-${item.targetLanZh}</span>
                                        <span class="sy-float-r">返稿时间：${item.requireTime}</span>
                                    </div>
                                    <div class="detail">
                                        <div>
                                            <em>${item.taskName}</em>
                                            <span>${totalWork}</span>
                                        </div>
                                        <div>
                                            <em>${item.orderTypeZh}</em>
                                            <span>${item.qualityGradeZh}</span>
                                        </div>
                                        <div>
                                            <em>${totalPrice}</em>
                                            <span>${+item.orderType === 1?'原文千字':'--'}</span>
                                        </div>
                                        <div>
                                            <a href="" class="sy-btn sy-btn-sm sy-btn-green">预览</a>
                                            <a href="" class="sy-btn sy-btn-sm sy-btn-green">领取</a>
                                        </div>
                                    </div>
                                </div>`);
                });
                pageNo += 1;
                pageEl.val(pageNo);
                if(result.length > 0){
                    bodyStr = joinArr.join('');
                    moreBtn.removeClass('sy-hidden');
                }else if(res.data.totalRow === 0){
                    bodyStr = `<p class="empty sy-mg-t-50">暂无订单</p>`;
                    moreBtn.addClass('sy-hidden');
                }
                if(res.data.totalPage === pageNo-1){
                    moreBtn.addClass('sy-hidden');
                }
                $('.orderContent').append(bodyStr);
            }
            $('.my-loading').remove();
            $('.filter').removeAttr('disabled');
            moreBtn.removeAttr('disabled').html('加载更多');
        })
    }

//图书翻译
    function getOrderListPage_2 (config){
        config = config || {};
        config.method = config.method || "POST";
        config.pageSize = config.pageSize || 5;
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
        $.loading('获取数据...');
        $('.filter').attr('disabled', 'disabled');
        return getResponse({
            type: config.method,
            baseUrl: basePMUrl,
            url: config.url,
            data: config.data
        }).then(res => {
            if(res.success){
                let bodyStr = '',
                    joinArr = [];
                let result = res.data.list ? res.data.list : [];
                typeWait && $('.filter>a.item').eq(0).find('span').html(res.data.totalRow);
                result.forEach(item => {
                    let tempObj = {};
                    tempObj.prop1 = item.responsibilityTypeZh;
                    if(typeResult === '图书试译'){
                        tempObj.prop2 = typeWait ? item.tryTaskId : item.tryTransId;
                        tempObj.prop3 = item.languageZh;
                        tempObj.prop4 = item.requireReturnTraftTime;
                        tempObj.prop5 = item.bookName;
                        tempObj.prop6 = `约${item.actuallyTranslatedWord}字`;
                        tempObj.prop7 = item.domainZh;
                        tempObj.prop8 = `￥${item.unitPriceOfTranslation}/千字`;
                    }else{
                        tempObj.prop2 = item.taskId;
                        tempObj.prop3 = item.sourceLanZh + '-' + item.targetLanZh;
                        tempObj.prop4 = item.requireTime;
                        tempObj.prop5 = item.taskName;
                        tempObj.prop6 = `约${item.workLoad}字`;
                        tempObj.prop7 = item.qualityGradeZh;
                        tempObj.prop8 = `￥${item.unitPrice}/千字`;
                    }
                    joinArr.push(`<div class="item">
                                    <div class="base">
                                        <label>${ tempObj.prop1 }</label>
                                        <span>订单编号：${ tempObj.prop2 }</span>
                                        <span>${ tempObj.prop3 }</span>
                                        <span class="sy-float-r">返稿时间：${ tempObj.prop4 }</span>
                                    </div>
                                    <div class="detail">
                                        <div>
                                            <em>${ tempObj.prop5 }</em>
                                            <span>${ tempObj.prop6 }</span>
                                        </div>
                                        <div>
                                            <em>${ typeResult?'图书试译':'图书翻译' }</em>
                                            <span>${ tempObj.prop7 }</span>
                                        </div>
                                        <div>
                                            <em>${ tempObj.prop8 }</em>
                                            <span>原文千字</span>    
                                        </div>
                                        <div>
                                            <a href="" class="sy-btn sy-btn-sm sy-btn-green">预览</a>
                                            <a href="" class="sy-btn sy-btn-sm sy-btn-green">领取</a>
                                        </div>
                                    </div>
                                </div>`);
                });
                pageNo += 1;
                pageEl.val(pageNo);
                if(result.length > 0){
                    bodyStr = joinArr.join('');
                    moreBtn.removeClass('sy-hidden');
                }else if(res.data.totalRow === 0){
                    bodyStr = `<p class="empty sy-mg-t-50">暂无订单</p>`;
                    moreBtn.addClass('sy-hidden');
                }
                if(res.data.totalPage === pageNo-1){
                    moreBtn.addClass('sy-hidden');
                }
                $('.orderContent').append(bodyStr);
            }
            $('.my-loading').remove();
            $('.filter').removeAttr('disabled');
            moreBtn.removeAttr('disabled').html('加载更多');
        })
    }
    //仅用作获取“图书翻译-待领取”条数
    function getOrderPage_2_WaitNum (config){
        config = config || {};
        getResponse({
            baseUrl: basePMUrl,
            url: config.url,
            data: {
                type: config.type
            }
        }).then(res => {
            console.log(res);
        })
    }


    return {
        getOrderStatusNum,
        getOrderListPage_1,
        getOrderListPage_2,
        getOrderPage_2_WaitNum
    }

}(window, document, jQuery));

export default orderServer;