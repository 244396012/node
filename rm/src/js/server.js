/*
*
* server： ajax请求
* 导入模块，压缩、打包，注册__api__全局对象，调用
* author：zhaoyong
*
* */
import { baseUrl, loginUrl, baseRMUrl, basePMUrl,orderApi } from './interceptor';
import { getResponse } from "./asyncAjax";
import './server_account';
import serverArticle from './server_article';
import serverPersonal from './server_personal';
import serverOrder from './server_order';
import './server_freelancer';
import './activity';
import './index';

//url 对外api接口
(function (api, global) {

    api.baseUrl = baseUrl;
    api.loginUrl = loginUrl;
    api.baseRMUrl = baseRMUrl;
    api.basePMUrl = basePMUrl;
    api.orderApi = orderApi;
    api.getResponse = getResponse;

    global.__api__ = api;

})(window.__api__||{}, window);

// 个人中心 对外api调用
(function (global){

    const __api__ = {
        getBaseInfo: serverPersonal.getBaseInfo,
        commitBaseInfo: serverPersonal.commitBaseInfo,
        commitBaseTeamInfo: serverPersonal.commitBaseTeamInfo,
        getResumeInfo: serverPersonal.getResumeInfo,
        getResumeBaseInfo: serverPersonal.getResumeBaseInfo,
        getAdeptLanguageList: serverPersonal.getAdeptLanguageList,
        deleteSkillPageRow: serverPersonal.deleteSkillPageRow,
        confirmChoiceResult: serverPersonal.confirmChoiceResult,
        createChoiceTest: serverPersonal.createChoiceTest,
        createTransTest: serverPersonal.createTransTest,
        tempCommitTrans: serverPersonal.tempCommitTrans,
        confirmCommitTrans: serverPersonal.confirmCommitTrans,
        getIdentyResult: serverPersonal.getIdentyResult,
        getPageMessage: serverPersonal.getPageMessage,
        getApplication: serverPersonal.getApplication,
        getApplicationCode: serverPersonal.getApplicationCode,
        getAdviceList: serverPersonal.getAdviceList,
        getAppraiseList: serverPersonal.getAppraiseList,
        initAccount: serverPersonal.initAccount,
        getIncomeDetail: serverPersonal.getIncomeDetail,
        getTaxRate: serverPersonal.getTaxRate,
        getUserAllInfo: serverPersonal.getUserAllInfo,
        getSafetyResult: serverPersonal.getSafetyResult,
        modifyPwd: serverPersonal.modifyPwd,
        getValidateCode: serverPersonal.getValidateCode,
        settlePwd: serverPersonal.settlePwd,
        getEmailCode: serverPersonal.getEmailCode,
        bindingEmail: serverPersonal.bindingEmail
    };

    //注册到global全局
    if(global.__api__){
        Object.assign(global.__api__, __api__);
    }else{
        global.__api__ = __api__;
    }

}(window));

// 订单中心 对外api
(function (api, global) {

    api.receiveOrder = serverOrder.receiveOrder;
    api.getOrderStatusNum = serverOrder.getOrderStatusNum;
    api.getOrderService = serverOrder.getOrderService;
    api.getOrderBook = serverOrder.getOrderBook;
    api.getOrderDtp = serverOrder.getOrderDtp;
    api.getOrderOther = serverOrder.getOrderOther;

    global.__api__ = api;

})(window.__api__||{}, window);

// 文章管理 对外api
(function (api, global) {

    api.previewArticle = serverArticle.previewArticle;
    api.releaseArticle = serverArticle.releaseArticle;
    api.getUserListArticle = serverArticle.userListArticle;
    api.getIndexGoodArticle = serverArticle.getIndexGoodArticle;
    api.getGoodArticle = serverArticle.getGoodArticle;
    api.getIndustryArticle = serverArticle.getIndustryArticle;
    api.userNotListArticle = serverArticle.userNotListArticle;
    api.getCommentsList = serverArticle.getCommentsList;

    global.__api__ = api;

})(window.__api__||{}, window);

// 是否权限认证，注册到全局
(function (api, global) {

    /*
   * 判断“认证权限”
   * @params：identity身份认证
   * @params：skill技能认证
   * */
    api.judgeAuth = function (config){

        config = config || {};
        const identity = config.identity || "";
        const skillArr = config.skill || [];

        const result = {
            isPassIdentity: false,
            isPassSkill: false
        };
        if(+identity !== 1){
            return result;
        }else{
            result.isPassIdentity = true;
        }
        if(Array.isArray(skillArr) && skillArr.length > 0){
            let isPass = skillArr.some(item => {
                return item.passedStatue === '已通过' && item.levelType !== 'select';
            });
            if(!isPass){
                return result;
            }
            result.isPassSkill = true;
        }
        return result;
    };

    global.__api__ = api;

})(window.__api__||{}, window);