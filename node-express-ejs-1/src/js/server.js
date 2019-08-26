/*
*
* server： ajax请求
* 导入模块，压缩、打包，注册__api__全局对象，调用
* author：zhaoyong
*
* */
import { baseUrl, loginUrl, baseRMUrl, basePMUrl } from './interceptor';
import { getResponse } from "./asyncAjax";
import './server_account';
import serverArticle from './server_article';
import serverPersonal from './server_personal';
import serverOrder from './server_order';
import freeLancer from './server_freelancer';

//url 对外api接口
(function (api, global) {

    api.baseUrl = baseUrl;
    api.loginUrl = loginUrl;
    api.baseRMUrl = baseRMUrl;
    api.basePMUrl = basePMUrl;
    api.getResponse = getResponse;

    global.__api__ = api;

})(window.__api__||{}, window);

// 个人中心 对外api
(function (global){

    const __api__ = {
        initBaseInfoPage: serverPersonal.initBaseInfoPage,
        getPageResume: serverPersonal.getPageResume,
        initResumePageBase: serverPersonal.initResumePageBase,
        getPageSkill: serverPersonal.getPageSkill,
        deletePageSkill: serverPersonal.deletePageSkill,
        getPageSkillChoiceTest: serverPersonal.getPageSkillChoiceTest,
        getPageSkillTransTestBase: serverPersonal.getPageSkillTransTestBase,
        pageSkillTempTransTxt: serverPersonal.pageSkillTempTransTxt,
        pageSkillConfirmTransTxt: serverPersonal.pageSkillConfirmTransTxt,
        getPageIdentification: serverPersonal.getPageIdentification,
        getPageMessage: serverPersonal.getPageMessage,
        getApplication: serverPersonal.getApplication,
        getApplicationCode: serverPersonal.getApplicationCode,
        getAdviceList: serverPersonal.getAdviceList,
        getAppraiseList: serverPersonal.getAppraiseList,
        getFinanceInfo: serverPersonal.getFinanceInfo,
        getFinanceList: serverPersonal.getFinanceList,
        judgeFinanceInfo: serverPersonal.judgeFinanceInfo,
        getFinanceTax: serverPersonal.getFinanceTax,
        getUserAllInfo: serverPersonal.getUserAllInfo,
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

    api.getOrderStatusNum = serverOrder.getOrderStatusNum;
    api.getOrderListPage_1 = serverOrder.getOrderListPage_1;
    api.getOrderListPage_2 = serverOrder.getOrderListPage_2;
    api.getOrderPage_2_WaitNum = serverOrder.getOrderPage_2_WaitNum;

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