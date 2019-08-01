/*
*
* server： ajax请求
* 导入模块，压缩、打包，导出__api__全局对象，调用
* author：zhaoyong
*
* */
import { baseUrl, loginUrl, baseRMUrl } from './interceptor';
import { getResponse } from "./asyncAjax";
import './server_account';
import serverArticle from './server_article';
import serverPersonal from './server_personal';

(function (global, $){

    const __api__ = {
        baseUrl: baseUrl,
        loginUrl: loginUrl,
        baseRMUrl: baseRMUrl,
        getResponse: getResponse,
        //个人中心
        getPageInformation: serverPersonal.getPageInformation,
        getPageResume: serverPersonal.getPageResume,
        getWorkedCompany: serverPersonal.getWorkedCompany,
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
        //文章
        previewArticle: serverArticle.previewArticle,
        releaseArticle: serverArticle.releaseArticle,
        getUserListArticle: serverArticle.userListArticle,
        getIndexGoodArticle: serverArticle.getIndexGoodArticle,
        getGoodArticle: serverArticle.getGoodArticle,
        getIndustryArticle: serverArticle.getIndustryArticle,
        userNotListArticle: serverArticle.userNotListArticle,
        getCommentsList: serverArticle.getCommentsList
    };
    /*
    * 判断“认证权限”
    * @params：identity身份认证
    * @params：skill技能认证
    * */
    __api__.judgeAuth = function (config){

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

    //注册到global全局
    !global.__api__ && (global.__api__ = __api__);

}(window, jQuery));
