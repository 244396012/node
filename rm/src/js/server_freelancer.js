/*
* module：views -> personal：skill-xxx (exclude skill/skillChoiceTest/skillTransTest files)
* 定义可扩展的模块
* author：zy
* date：2019-8-22
* */

import { baseUrl, baseRMUrl } from "./interceptor";
import { getResponse} from "./asyncAjax";
import './modal';

;(function (api, global, document, $, undefined) {

    'use strict';

    // 类数组转为数组
    function toArray(typeArr){
        return Array.prototype.slice.call(typeArr);
    }

    //根据type，返回api
    function returnApi(type) {
        switch (type){
            case 'typeset': //桌面排版
                return '/newSkillController/saveOrUpdateSkillDtp';
            case 'meeting': //会展
                return '/newSkillController/saveOrUpdateSkillIntepretation';
            case 'assign': //外派
                return '/newSkillController/saveOrUpdateNewSkillExpatriate';
            case 'train': //培训
                return '/newSkillController/saveOrUpdateNewSkillTrain';
            case 'device': //设备
                return '/newSkillController/saveOrUpdateNewSkillEquip';
            case 'setup': //搭建
                return '/newSkillController/saveOrUpdateNewSkillBuild';
        }
    }
    //根据type，返回data
    function returnData(type, id) {
        const data = {};
        id && (data.id = id);
        // 桌面排版
        if(type === 'typeset'){
            data.editionExperience = $('.experienceLabel>span.selected').text();
            data.software = toArray($('.softLabel>span.selected')).map(item => {
                 return $(item).text();
            });
            data.taskLable = [];
            toArray($('.taskLabel>span.selected')).forEach(item => {
                data.taskLable.push({
                    dtpLableCode: item.id,
                    dtpLableName: $(item).text()
                })
            });
        // 会展
        }else if(type === 'meeting'){
            data.interpretationExperience = $('.experienceLabel>span.selected').text();
            data.province = $('select.province').val();
            data.city = $('select.city').val();
            data.area = $('select.area').val();
            data.interpretationTypes = toArray($('.typeLabel>span.selected')).map(item => {
                return $(item).text();
            });
            data.languageAreaInfo = [];
            toArray($('.lanTarget td.itemData')).forEach(item => {
                data.languageAreaInfo.push(JSON.parse(item.innerHTML));
            });
        // 外派
        }else if(type === 'assign'){
            data.expatriateExperience = $('.assignExp>span.selected').text();
            data.expatriateExpertise = toArray($('.assignGood>span.selected')).map(item => {
                return $(item).text();
            });
            data.languageInfo = [];
            toArray($('.lanTarget td.itemData')).forEach(item => {
                data.languageInfo.push(JSON.parse(item.innerHTML));
            });
        //培训
        }else if(type === 'train'){
            data.trainingExperience = $('.trainExp>span.selected').text();
            data.overseasLearning = $('.abroadStudy>span.selected').text();
            data.overseasWorking = $('.abroadWork>span.selected').text();
            data.softSkills = toArray($('.skills>span.selected')).map(item => {
                return $(item).text();
            });
            data.trainerTraining = toArray($('.trainer>span.selected')).map(item => {
                return $(item).text();
            });
            data.languageInfo = [];
            toArray($('.lanTarget td.itemData')).forEach(item => {
                data.languageInfo.push(JSON.parse(item.innerHTML));
            })
        //设备、搭建
        }else if(type === 'device' || type === 'setup'){
            const temp = [];
            data.remark = $('textarea.remark').val();
            data.province = $('select.province').val();
            data.city = $('select.city').val();
            data.area = $('select.area').val();
            toArray($('.deviceTarget td.itemData')).forEach(item => {
                temp.push(JSON.parse(item.innerHTML));
            });
            if(type === 'device'){
                data.equipmentInfo = temp;
            }else{
                data.buildInfo = temp;
            }
        }
        return data;
    }

    // 提交/修改
    api.freelancerCreate = function (btn) {
        const type = $(btn).attr('data-type'),
            id = $(btn).attr('data-id');
        let url = returnApi(type),
            data = returnData(type, id);
        $(btn).attr('disabled','disabled')
            .html('<i class="am-icon-spinner am-icon-pulse"></i>');
        getResponse({
            type: 'post',
            url: url,
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(data)
        }).then(res => {
            if(res.message === 'success'){
                $.success('操作成功');
                setTimeout('location.reload()', 1000);
            }else{
                $.error(res.message);
            }
            $(btn).removeAttr('disabled').html('提 交');
        })
    };

    global.__api__ = api;

})(window.__api__ || {}, window, document, jQuery);
