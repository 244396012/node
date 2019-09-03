
/*
*
* module：views -> personal （个人中心）
* export：personalServer
* author：zhaoyong
* date：2019-04-20
*
* */

import { baseRMUrl, loginUrl} from "./interceptor";
import { getResponse } from "./asyncAjax";
import { countDown, getQueryString } from "./utils";
import promptTxt from './promptTxt';
import './modal';


const personalServer = (function (window, document, $, undefined) {
    'use strict';
    /*
    * 匹配后端，格式化时间格式
    * */
    function enFormatTime(val) {
        return val + ' 00:00:00';
    }
    function deFormatTime(val) {
        return val.split(' ')[0];
    }

//退出账号
    $('.userLogoutBtn').click(() => {
        localStorage.removeItem('sy_rm_client_ud');
        localStorage.removeItem('sy_rm_client_ubase');
        localStorage.removeItem('sy_rm_client_access_token');
        localStorage.removeItem('sy_rm_client_choice_test');
        localStorage.removeItem('sy_rm_client_choice_test_no');
        localStorage.removeItem('sy_rm_client_choice_test_id');
        location.href = '/login';
    });

    const pathname = location.pathname;
/*
*
* ------------------------ 分割线
*       (个人、团队)基本信息
*
* */
//数据初始化，获取国籍、语言对
    function getBaseInfo (){
        //上传头像
        setTimeout(function () {
            $('.uploadFile').Huploadify({
                auto: true,
                multi: false,
                fileTypeExts: '*.jpg;*.png;*.jpeg;*.gif',
                fileObjName: 'multipartFile',
                formData: {
                    userId: localStorage.getItem('sy_rm_client_ud')
                },
                token: 'bearer '+localStorage.getItem('sy_rm_client_access_token'),
                fileSizeLimit: 1024,
                uploader: __api__.baseRMUrl + '/userExtension/uploadHeaderImg',
                onUploadStart: function () {
                    $.loading('正在上传');
                },
                onUploadComplete: function(file, res){
                    const data = JSON.parse(res);
                    if(data.message === 'success'){
                        const baseDt = JSON.parse(localStorage.getItem('sy_rm_client_ubase'));
                        baseDt.picture = data.data;
                        localStorage.setItem('sy_rm_client_ubase',JSON.stringify(baseDt));
                        setTimeout('location.reload(true)', 500);
                    }
                },
                onUploadError: function(file, res){
                    const data = JSON.parse(res);
                    $('.my-loading').remove();
                    $.error(data.message);
                }
            });
        }, 1000);
        //团队页面，不需要获取国籍、语言对
        if(pathname.includes('/teamInfo')) return null;
        //获取国籍
        getResponse({
            type: 'post',
            url: '/userExtension/listNationality'
        }).then(res => {
            let nationStr = "";
            res.data.forEach(function (item){
                nationStr += `<option value="${item.nationName}">${item.nationName}</option>`;
            });
            $('#nationality').html(nationStr);
        });
        //获取语言对
        getResponse({
            url: '/language/listAll'
        }).then(res => {
            let optionStr = '';
            res.data.forEach(item => {
                optionStr += `<option value="${item.chineseName}">${item.chineseName}</option>`
            });
            $('.languageOption').html(optionStr).val('中文 - 中国');
        });
    }
// 提交个人信息
    function commitBaseInfo(btn) {
        const _this = btn;
        const requiredEles = $('select[required],input[required]');
        for(let i = 0; i < requiredEles.length; i++){
            const el = requiredEles[i];
            if(el.value.trim() === ''){
                el.focus();
                $.warning('请填写'+$(el).attr('prop'));
                return false;
            }
        }
        const currencyEl = $('#currencyType'),
            birthday = $('#birthday').val(),
            address = $('#deliverprovince').val()+' '+$('#delivercity').val()+' '+$('#deliverarea').val();
        const userId = localStorage.getItem('sy_rm_client_ud'),
            data = {
                sex: $('#sex').val(),
                email: $('#email').val(),
                motherTogue: $('#motherTogue').val(),
                nationality: $('#nationality').val(),
                nickName: $('#nickName').val(),
                realName: $('#realName').val(),
                tranlateYear: $('#translateYear').val(),
                birthday: birthday?(birthday+' 00:00:00'):'',
                permanentAddress: address,
                currencyCode: currencyEl.val(),
                currencyName: currencyEl.find('option:selected').text(),
                userId: userId
            };
        if(data['nickName'].length < 4 || data['nickName'].length > 20){
            $.warning('请填写正确的昵称');
            return false;
        }else if(data['email'] !== '' && !/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(data['email'])){
            $.warning('请填写正确的邮箱');
            return false;
        }
        const contactArr = [];
        const itemEls = $('.addItem');
        for(let i = 0, len = itemEls.length; i<len; i++){
            const item = itemEls[i],
                itemData = JSON.parse(item.getAttribute('data'));
            contactArr.push(itemData);
        }
        Object.assign(data, {
            contactInfoJSON: JSON.stringify(contactArr)
        });
        $(_this).attr('disabled','disabled').html('<i class="am-icon-spinner am-icon-pulse"></i>');
        getResponse({
            type: 'post',
            url: '/userExtension/addBasicInfo',
            data: data
        }).then(res => {
            if(res.message === 'success'){
                $.success('信息提交成功');
                location.reload();
            }else{
                $.error(res.message);
            }
            $(_this).removeAttr('disabled').html('提交');
            return new Promise(resolve => {
                resolve(res);
            })
        }).then(() => {
            //判断简历是否完善，未完善则弹出提示框；
            getResponse({
                url: '/userExtension/judgeCompleteResume',
                data: { userId: userId }
            }).then(res => {
                if(res.message === 'success' && !res.data){
                    setTimeout(() => {
                        $.toolinfo({
                            href: '<a class="sy-modal-href sy-btn sy-btn-green sy-btn-sm" href="/personal/resume">去完善</a>',
                            close: '下次再说',
                            txt: '完善简历后，才能进行译员资格测试！'
                        });
                    }, 1000);
                }else{
                    location.reload(true);
                }
            });
        });
    }
// 提交团队信息
    function commitBaseTeamInfo(btn) {
        const _this = btn;
        const requiredEles = $('select[required],input[required]');
        for(let i = 0; i < requiredEles.length; i++){
            const el = requiredEles[i];
            if(el.value.trim() === ''){
                el.focus();
                $.warning('请填写'+$(el).attr('prop'));
                return false;
            }
        }
        const currencyEl = $('#currencyType');
        const address = $('select.province').val()+' '+$('select.city').val()+' '+$('select.area').val(),
            data = {
                id: _this.id,
                teamName: $('#teamName').val(),
                fullTimeNumber: $('#fullTimeNumber').val(),
                unifiedSocialCreditCode: $('#unifiedSocialCreditCode').val(),
                typesOfTaxPayment: $('#typesOfTaxPayment').val(),
                invoiceType: $('#invoiceType').val(),
                location: address,
                currencyCode: currencyEl.val(),
                currencyName: currencyEl.find('option:selected').text(),
                primaryContactName: $('#primaryContactName').val(),
                primaryContactEmail: $('#primaryContactEmail').val(),
                otherContactName: $('#otherContactName').val(),
                otherContactMobile: $('#otherContactMobile').val(),
                otherContactEmail: $('#otherContactEmail').val(),
            };
        const regEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        if(data['primaryContactName'].trim() === ''){
            $.warning('请填写主要联系人');
            return false;
        }else if((data['primaryContactEmail'] !== '' && !regEmail.test(data['primaryContactEmail']))
            ||(data['otherContactEmail'] !== '' && !regEmail.test(data['otherContactEmail']))){
            $.warning('请填写正确的邮箱');
            return false;
        }
        const primaryContactArr = [],
            otherContactArr = [];
        const priItems = $('.primaryForm').find('.addItem'),
            othItems = $('.otherForm').find('.addItem');
        for(let i = 0, len = priItems.length; i<len; i++){
            const item = priItems[i],
                itemData = JSON.parse(item.getAttribute('data'));
            primaryContactArr.push(itemData);
        }
        Object.assign(data, {
            primaryContactInfo: JSON.stringify(primaryContactArr)
        });
        for(let i = 0, len = othItems.length; i<len; i++){
            const item = othItems[i],
                itemData = JSON.parse(item.getAttribute('data'));
            otherContactArr.push(itemData);
        }
        Object.assign(data, {
            otherContactInfo: JSON.stringify(otherContactArr)
        });
        $(_this).prop('disabled', true).html('<i class="am-icon-spinner am-icon-pulse"></i>');
        getResponse({
            type: 'put',
            url: '/team/addTeamBasicInfo',
            headers: {
              'Content-Type': 'application/json'
            },
            data: JSON.stringify(data)
        }).then(res => {
            if(res.message === 'success'){
                $.success('信息提交成功');
               location.reload();
            }else{
                $.error(res.message);
            }
            $(_this).removeAttr('disabled').html('提交');
        })
    }
/*
*
* ------------------------ 分割线
*       我的简历
*
* */
//初始化页面数据
    function getResumeBaseInfo() {
        const userId = localStorage.getItem('sy_rm_client_ud'),
            token = localStorage.getItem('sy_rm_client_access_token');
        //获取语言对
        getResponse({
            url: '/userExtension/listAllCertificateType'
        }).then(res => {
            if(res.message === 'success'){
                let str_b = '', str_k = '', str_p = '';
                res.data.forEach(item => {
                    if(item.type.includes('C')){//笔译
                        str_b += `<option 
                                    value="${item.languageAbb}"
                                    data="${item.certifcateName}">${item.languageAbb}</option>`;
                    }
                    if(item.type.includes('HZ')){//口译
                        str_k += `<option 
                                    value="${item.languageAbb}"
                                    data="${item.certifcateName}">${item.languageAbb}</option>`;
                    }
                    if(item.type.includes('T')){//培训
                        str_p += `<option 
                                    value="${item.languageAbb}"
                                    data="${item.certifcateName}">${item.languageAbb}</option>`;
                    }
                });
                str_b += `<option value="其他">其他</option>`;
                str_k += `<option value="其他">其他</option>`;
                str_p += `<option value="其他">其他</option>`;
                $('.languageList_b').append(str_b);
                $('.languageList_k').append(str_k);
                $('.languageList_p').append(str_p);
            }
        });
        //获取所有领域
        getResponse({
            url: '/domain/listAll'
        }).then(res => {
            if(res.message === 'success'){
                let str = '';
                res.data.forEach(item => {
                    str += `<dd class="area">${item.fullSpecialtyName}</dd>`;
                });
                $('dl.expert').html(str);
            }
        });
        //根据userId获取工作过的公司
        getResponse({
            url: '/userExtension/listWorkExperienceByUserId',
            data: { userId: userId }
        }).then(res => {
            if(res.message === 'success'){
                let str = '';
                res.data.forEach(item => {
                    str += `<option value="${item}">${item}</option>`
                });
                str += `<option value="其他">其他</option>`;
                $('.companyName').html(str);
            }
        });
        //初始化上传插件，上传技能证书
        setTimeout(function (){
            $('#uploadCertificate').Huploadify({
                auto: true,
                multi: false,
                fileTypeExts: '*.jpg;*.png;*.jpeg;*.gif',
                fileObjName: 'multipartFile',
                formData: {
                    id: '',
                    certificateName: '',
                    certificateType: '',
                    languageName: '',
                    userId: userId
                },
                token: 'Bearer ' + token,
                fileSizeLimit: 1024,
                uploader: __api__.baseRMUrl + '/userExtension/addSkillInfo',
                onUploadStart: function () {
                    const targetEl = $('.resume-item.skill'),
                        type = targetEl.attr('type'),
                        formEl = $('.add-form-' + type);
                    const lanVal = formEl.find('.languageList').val(),
                        isOther = lanVal === '其他';
                    if(isOther){
                        this.formData.languageName = formEl.find('.languagePut').val();
                        this.formData.certificateName = formEl.find('.certificatePut').val();
                    }else{
                        this.formData.languageName = lanVal;
                        this.formData.certificateName = formEl.find('.certificateList').val();
                    }
                    this.formData.certificateType = type;
                    $.loading('正在上传');
                },
                onUploadComplete: function(file, res){
                    const resJson = JSON.parse(res);
                    if(resJson.message === 'success'){
                        getResumeInfo();
                        $('.my-loading').remove();
                    }
                },
                onUploadError: function(file, res){
                    const resJson = JSON.parse(res);
                    $('.my-loading').remove();
                    $.error(resJson.message);
                }
            });
        }, 1000);
    }
//根据userId获取简历信息
    function getResumeInfo() {
        const userId = localStorage.getItem('sy_rm_client_ud');
        getResponse({
            url: '/userExtension/findResumeByUserId',
            data: { userId: userId }
        }).then(res => {
            if(res.message === 'success'){
                //学历信息
                let degreeStr = '';
                const degreeDiv = $('div.degree');
                if(res.data.educationList.length > 0){
                    res.data.educationList.forEach(item => {
                        degreeStr += `
                            <div class="info-item">
                                <div class="item">
                                    <div>毕业院校：</div>
                                    <div><span>${item.schoolType}</span>${item.graduatedSchoolName}</div>
                                </div>
                                <div class="item">
                                    <div>专业：</div>
                                    <div>${item.major}</div>
                                </div>
                                <div class="item">
                                    <div>学历：</div>
                                    <div>${item.degree}</div>
                                </div>
                                <div class="item">
                                    <div>毕业时间：</div>
                                    <div>${deFormatTime(item.graduatedDate)}</div>
                                </div>
                                <div class="operation sy-font-md">
                                    <div class="sy-hidden">${JSON.stringify(item)}</div>
                                    <a class="sy-edit" href="javascript:;">编辑</a>
                                    <a class="sy-delete" href="javascript:;" data-del="deleteEducationInfo" data-u-id="${item.id}">删除</a>
                                </div>
                            </div>`
                    });
                    degreeDiv.find('.add-form').addClass('sy-hidden');
                }else{
                    degreeDiv.find('.add-form').removeClass('sy-hidden');
                }
                degreeDiv.find('.show-info').html(degreeStr);
                //技能证书
                if(res.data.userSkillList.length >= 0){
                    $('.resume-item.skill').find('div.items').empty();
                    res.data.userSkillList.forEach(item => {
                        const tarFormNext = $('.add-form-'+item.userCertificateType).next('div'),
                            tarEl = tarFormNext.find('div.items');
                        tarEl.append(`
                             <div class="img-item">
                                <img src="${item.userCertificatePath}" alt="${item.userCertificateType}">
                                <p>${item.languageName+' - '+item.userCertificateName}</p>
                                <a class="sy-delete delete-bg" href="javascript:;" data-del="deleteSkillInfo" data-u-id="${item.id}">删除</a>
                            </div>`);
                    });
                    $('div.resume-item.skill').find('div.show-info').each((index,item) => {
                        const tarEl = $(item),
                            prevEl = tarEl.prev('div'),
                            childLen = tarEl.find('div.img-item').length;
                        if(childLen > 0){
                            tarEl.removeClass('sy-hidden');
                            prevEl.addClass('sy-hidden');
                        }else{
                            tarEl.addClass('sy-hidden');
                            prevEl.removeClass('sy-hidden');
                        }
                    });
                }
                //工作经历
                let workStr = '';
                const workDiv = $('div.work');
                if(res.data.workExperienceList.length > 0){
                    res.data.workExperienceList.forEach(item => {
                        workStr += `
                           <div class="info-item">
                                <div class="item">
                                    <div>企业名称：</div>
                                    <div>${item.companyName}</div>
                                </div>
                                <div class="item">
                                    <div>起止时间：</div>
                                    <div><span>${deFormatTime(item.startDatetime)}</span><span class="sep-date-bg">—</span><span>${deFormatTime(item.endDatetime)}</span></div>
                                </div>
                                <div class="item">
                                    <div>职位描述：</div>
                                    <div>${item.workDescribe}</div>
                                </div>
                                <div class="operation sy-font-md">
                                    <div class="sy-hidden">${JSON.stringify(item)}</div>
                                    <a class="sy-edit" href="javascript:;">编辑</a>
                                    <a class="sy-delete" href="javascript:;" data-del="deleteWorkExperienceInfo" data-u-id="${item.id}">删除</a>
                                </div>
                            </div>`
                    });
                    workDiv.find('.add-form').addClass('sy-hidden');
                }else{
                    workDiv.find('.add-form').removeClass('sy-hidden');
                }
                workDiv.find('.show-info').html(workStr);
                //项目经历
                let projectStr = '';
                const projectDiv = $('div.project');
                if(res.data.projectExperienceList.length > 0){
                    res.data.projectExperienceList.forEach(item => {
                        projectStr += `
                           <div class="info-item">
                                <div class="item">
                                    <div>项目名称：</div>
                                    <div>${item.projectName}</div>
                                </div>
                                <div class="item">
                                    <div>企业名称：</div>
                                    <div>${item.companyName}</div>
                                </div>
                                <div class="item">
                                    <div>起止时间：</div>
                                    <div><span>${deFormatTime(item.startDatetime)}</span><span class="sep-date-bg">—</span><span>${deFormatTime(item.endDatetime)}</span></div>
                                </div>
                                <div class="item">
                                    <div>项目描述：</div>
                                    <div>${item.projectDescribe}</div>
                                </div>
                                <div class="operation sy-font-md">
                                    <div class="sy-hidden">${JSON.stringify(item)}</div>
                                    <a class="sy-edit" href="javascript:;">编辑</a>
                                    <a class="sy-delete" href="javascript:;" data-del="deleteProjectExperienceInfo" data-u-id="${item.id}">删除</a>
                                </div>
                            </div>`
                    });
                    projectDiv.find('.add-form').addClass('sy-hidden');
                }else{
                    projectDiv.find('.add-form').removeClass('sy-hidden');
                }
                projectDiv.find('.show-info').html(projectStr);
                //个性标签和擅长领域
                let labelStr = '', areaStr = '', dataDiv = '';
                const labelDiv = $('div.label');
                if(res.data.userExtension.individualization || res.data.userExtension.area){
                    const individualArr = res.data.userExtension.individualization && res.data.userExtension.individualization.split(',') || [],
                        areaArr = res.data.userExtension.area && res.data.userExtension.area.split(',') || [];
                    individualArr.forEach(item => {
                        labelStr += `<span>${item}</span>`;
                    });
                    labelStr = `<div class="label-item labelWrapper">${labelStr}</div>`;
                    areaArr.forEach(item => {
                        areaStr += `<span>${item}</span>`;
                    });
                    areaStr = `<div class="label-item">${areaStr}</div>`;
                    dataDiv = `<div class="sy-hidden individual">${res.data.userExtension.individualization}</div>
                               <div class="sy-hidden expert">${res.data.userExtension.area}</div>`;
                    labelDiv.find('.edit').removeClass('sy-hidden');
                    labelDiv.find('.add-form').addClass('sy-hidden');
                    labelDiv.find('.show-info').removeClass('sy-hidden');
                }else{
                    labelDiv.find('.edit').addClass('sy-hidden');
                    labelDiv.find('.add-form').removeClass('sy-hidden');
                    labelDiv.find('.show-info').addClass('sy-hidden');
                }
                labelDiv.find('.show-info').html(dataDiv + labelStr + areaStr);
            }
        })
    }
/*
* 添加（修改）学历信息
* 添加（修改）工作经历
* 添加（修改）项目经验
* */
    $('#degreeBtn_Resume,#workBtn_Resume,#projectBtn_Resume').on('click', function () {
        const _this = this,
            prevFrom = $(_this).parent().prev('form'),
            requiredEles = prevFrom.find('input[required],select[required],textarea[required]');
        for(let i = 0; i < requiredEles.length; i++){
            const el = requiredEles[i];
            if(el.value.trim() === ''){
                el.focus();
                $.warning($(el).attr('placeholder'));
                return false;
            }else if($(el).attr('data-len-pass')){
                el.focus();
                $.warning('内容长度超过限制');
                return false;
            }
        }
        const dataPut = prevFrom.find('input,select,textarea');
        const data = {};
        dataPut.toArray().forEach(item => {
            let existId = item.id?item.id:item.dataset.id;
            data[existId] = item.value;
            if($(item).attr('lay-key')){
                data[existId] = enFormatTime(item.value);
            }
        });
        data.id = $(_this).attr('data-u-id')?$(_this).attr('data-u-id'):'';
        data.userId = localStorage.getItem('sy_rm_client_ud');
        $(_this).attr('disabled','disabled');
        $(_this).html('<i class="am-icon-spinner am-icon-pulse"></i>');
        let url = '';
        switch (_this.id){
            case 'degreeBtn_Resume':
                url = '/userExtension/addEducationInfo';break;
            case 'workBtn_Resume':
                url = '/userExtension/addWorkExperience';break;
            case 'projectBtn_Resume':
                url = '/userExtension/addProgramExperience';break;
        }
        getResponse({
            type: 'post',
            url: url,
            data: data
        }).then(res => {
            if(res.message === 'success'){
                $.success('保存成功');
                $(_this).prev().click();
                getResumeInfo();
                getResumeBaseInfo();
            }else{
                $.error(res.message);
            }
            $(_this).removeAttr('disabled');
            $(_this).html('保存');
        });
    });
//添加（修改）个性标签和擅长领域
    $('#addLabelBtn_Resume').on('click', function () {
        const _this = this;
        const selectedLabel = $('dl.label').find('dd.selected');
        const areaArr = [],
            individualArr = [];
        if(selectedLabel.length < 1){
            $.warning('请选择‘个性标签’或‘擅长领域’');
            return false;
        }
        selectedLabel.toArray().forEach(item => {
            const label = $(item);
            label.hasClass('area')
                ? areaArr.push(label.text())
                : individualArr.push(label.text());
        });
        $(_this).attr('disabled','disabled');
        $(_this).html('<i class="am-icon-spinner am-icon-pulse"></i>');
        getResponse({
            type: 'post',
            url: '/userExtension/addIndividualInfo',
            data: {
                area: areaArr.join(','),
                individualization: individualArr.join(','),
                userId: localStorage.getItem('sy_rm_client_ud')
            }
        }).then(res => {
            if(res.message === 'success'){
                $.success('保存成功');
                getResumeInfo();
            }else{
                $.error(res.message);
            }
            $(_this).removeAttr('disabled');
            $(_this).html('保存');
        })
    });
//删除、修改信息（事件委托，给删除del、编辑edit绑定事件）
    $('div.personal.resume').on('click', function (e) {
        const el = e.target;
        //根据id删除信息
        if($(el).hasClass('sy-delete')){
            $.confirm();
            $('.confirmModal').modal({
                closeViaDimmer: false,
                onConfirm: function (e) {
                    const id = $(el).attr('data-u-id');
                    const path = $(el).attr('data-del');
                    getResponse({
                        type: 'delete',
                        url: '/userExtension/'+ path + '?id='+id
                    }).then(res => {
                        if(res.message === 'success' && res.data){
                            $.success('删除成功');
                            getResumeInfo();
                        }else{
                            $.error(res.message);
                        }
                    })
                },
                onCancel: function (e) { }
            });
        //根据id修改信息
        }else if($(el).hasClass('sy-edit')){
            const infoDiv = $(el).parents('.show-info'),
                addForm = infoDiv.prev('.add-form');
            const data = JSON.parse($(el).prev('div').html());
            if(Object.prototype.toString.call(data) === '[object Object]'){
                addForm.removeClass('sy-hidden');
                addForm.find('button[data-sy-confirm]').attr('data-u-id', data.id);
                if($(el).parents('.resume-item').hasClass('project')){
                    for(let prop in data){
                        addForm.find('[data-id='+prop+']').val(data[prop]);
                        if(addForm.find('[data-id='+prop+']').attr('lay-key')){
                            addForm.find('[data-id='+prop+']').val(deFormatTime(data[prop]));
                        }else if(prop === 'projectDescribe'){
                            addForm.find('[data-id=describe]').val(data[prop]);
                            addForm.find('[data-id=describe]').next().html(`<span>${data[prop].length}</span>/300`);
                        }
                    }
                    return false;
                }
                for(let prop in data){
                    addForm.find('#'+prop).val(data[prop]);
                    if(addForm.find('#'+prop).attr('lay-key')){
                        addForm.find('#'+prop).val(deFormatTime(data[prop]));
                    }else if(prop === 'workDescribe'){
                        addForm.find('#describe').val(data[prop]);
                        addForm.find('#describe').next().html(`<span>${data[prop].length}</span>/300`);
                    }
                }
            }
        }
    });

/*
*
* ------------------------ 分割线
*       技能测试
*
* */
//获取擅长语言，返回数据{ data: [] }列表
    function getAdeptLanguageList() {
        $.loading('获取数据...');
        getResponse({
            url: '/exam/customer/listAdeptLanguages'
        }).then(res => {
            // console.log(res);
            if(res.message === 'success'){
                let resStr = "",
                    { data } = res;
                data.forEach(item => {
                    let tabStr = '', operateStr = '';
                    //格式化：语言对
                    let originName = item.originLanguageName.split('-')[0].trim(),
                        targetName = item.targetLanguageName.split('-')[0].trim();
                    //格式化：一级领域、二级领域( 判断数据格式为[] )
                    let firstAreaName = item.domain.startsWith('[') ? JSON.parse(item.domain).toString() : item.domain,
                        secondAreaName = item.subDomain.startsWith('[') ?
                            JSON.parse(item.subDomain).map(sub => `<span>${sub}</span>`).join('') : `<span>${item.subDomain}</span>`;
                    /*
                    * 判断是否为绿色通道 (greenChannel：绿色通道，exam：测试)
                    * */
                    if(item.overviewType === 'greenChannel'){
                        //判断是否已申请
                        if(item.applyGreenChannel){
                            let fileStr = item.applyGreenChannel.files.reduce((prev, curr) => {
                                return prev + `<a href="${curr.visitUrl}" target="_blank" title="点击下载文件">${curr.fileName}</a>`;
                            }, '');
                            if(item.applyGreenChannel.applyState === '待联系'){
                                tabStr = `
                                    <tr><td class="sy-font-md">你已成功申请了绿色通道，工作人员核实后会与你取得联系</td></tr>
                                    <tr><td class="file">${fileStr}</td></tr>
                                `;
                            }else if(item.applyGreenChannel.applyState === '不通过'){
                                tabStr = `
                                    <tr><td class="sy-font-md sy-orange">很抱歉，请重新提交相关文档，以便于工作人员核实</td></tr>
                                    <tr><td class="file">
                                            ${fileStr}
                                            <button type="button" 
                                                id="${item.id}"
                                                class="sy-btn sy-btn-green sy-btn-sh fileBtn"
                                                data-am-popover="{content: '仅支持doc、docx和pdf格式的文件，大小3M以内', trigger: 'hover'}"
                                                >重新上传</button>
                                        </td></tr>
                                `;
                            }else{
                                tabStr = `
                                    <tr><td class="sy-font-md">恭喜你，你已成功申请了绿色通道</td></tr>
                                    <tr><td class="file">${fileStr}</td></tr>
                                `;
                            }
                        }else{
                            tabStr = `
                                <tr><td class="sy-font-md">上传你曾经做的相关文档并申请绿色通道，工作人员会第一时间与你取得联系</td></tr>
                                <tr><td><button type="button" 
                                                id="${item.id}"
                                                class="sy-btn sy-btn-green sy-btn-sh fileBtn"
                                                data-am-popover="{content: '仅支持doc、docx和pdf格式的文件，大小3M以内', trigger: 'hover'}"
                                                >上传文档</button></td></tr>
                            `;
                        }
                    }else{//exam：非绿色通道
                        let [selectStatus, selectBtn, tranStatus, tranBtn] = ["", "", "", ""];
                        item.cuLevelList.forEach(em => {
                        // ******* 选择题 *******
                            if(em.levelType === 'select'){
                                //测试状态
                                if(em.passedStatue === '未测试'){
                                    selectStatus = `<span class="notest">未测试</span>`;
                                }else if(em.passedStatue === '未通过'){
                                    selectStatus = `
                                        <span>你已经测试过${em.examTimes}次，很遗憾，未通过</span>
                                        <span class="tip">预计下次测试时间为${em.nextExamTime}</span>
                                    `;
                                }else{
                                    selectStatus = `<span>${em.passedStatue}</span>`;
                                }
                                //按钮是否显示
                                if(em.isEnableExam && !item.examState){
                                    selectBtn = `<button type="button" 
                                                         class="sy-btn sy-btn-green sy-btn-sh"
                                                         onclick="$.skillTest({
                                                            title: '选择题说明',
                                                            txt: __bundle__.promptTxt.skillChoice,
                                                            href: 'test/choice?id=${em.id}'
                                                         });">开始测试</button>`;
                                }else if(!em.isEnableExam && em.examState === '测试中'){
                                    selectBtn = `<button type="button" 
                                                         class="sy-btn sy-btn-green sy-btn-sh"
                                                         onclick="location.href='skill/test/choice?id=${em.id}'">继续测试</button>`;
                                }
                        // ******* 翻译题 *******
                            }else{
                                //测试状态
                                if(em.passedStatue === '未测试'){
                                    tranStatus = `<span class="notest">未测试</span>`;
                                }else if(em.passedStatue === '未通过'){
                                    tranStatus = `
                                        <span>你已经测试过${em.examTimes}次，很遗憾，未通过</span>
                                        <span class="tip">预计下次测试时间为${em.nextExamTime}</span>
                                    `;
                                }else{
                                    tranStatus = `
                                        <span>${em.passedStatue}</span>
                                        <span class="level">等级：<i>${em.level}</i></span>
                                    `;
                                }
                                //按钮显示测试等级
                                let tranBtnTxt = '开始测试';
                                em.nextExamLevel !== '初级' && (tranBtnTxt = em.nextExamLevel+'测试');
                                //按钮是否显示
                                if(!em.isEnableExam && !item.examState){
                                    tranBtn = `<button type="button" class="sy-btn sy-btn-green sy-btn-sh" disabled>不可测试</button>`;
                                }else if(em.isEnableExam && !item.examState){
                                    tranBtn = `<button type="button" class="sy-btn sy-btn-green sy-btn-sh"
                                                       onclick="$.skillTest({
                                                            title: '翻译题说明',
                                                            txt: __bundle__.promptTxt.skillTranslation,
                                                            href: 'test/translation?id=${em.id}'
                                                       });">${tranBtnTxt}</button>`;
                                }else if(!em.isEnableExam && em.examState === '测试中'){
                                    tranBtn = `<button type="button" 
                                                       class="sy-btn sy-btn-green sy-btn-sh"
                                                       onclick="location.href='skill/test/translation?id=${em.id}'">继续测试</button>`;
                                }
                            }
                        });
                        tabStr = `
                            <tr><td>选择题 ${selectStatus} ${selectBtn}</td></tr>
                            <tr><td>翻译题 ${tranStatus} ${tranBtn}</td></tr>
                        `;
                    }
                    //为true，可删除
                    if(item.isEnableCancle){
                        operateStr = `<a class="pos sy-delete" href="javascript:;"
                                         onclick="__api__.deleteSkillPageRow('${item.id}')"><i class="am-icon-trash-o"></i> 删除</a>`;
                    }else{
                        if(item.applyGreenChannel){
                            operateStr = `<span class="pos">${item.applyGreenChannel.applyState}</span>`;
                        }
                    }
                    resStr +=  `<div class="item">
                                        <div class="item-lan">
                                            <h1>${originName} → ${targetName}</h1>
                                            <h1>${item.originLanguageCode} → ${item.targetLanguageCode}</h1>
                                            <span>${firstAreaName}</span>
                                        </div>
                                        <div class="item-cnt">
                                            <table>
                                                ${tabStr}
                                                <tr>
                                                    <td class="area">${secondAreaName}</td>
                                                </tr>
                                            </table>
                                        </div>
                                        ${operateStr}
                                    </div>`;
                });
                $('.languageCnt').html(res.data.length > 0 ? resStr : `<div class="bg"></div>`);
                $('.fileBtn').popover();
            }else{
                $.error(res.message);
            }
            $('.my-loading').remove();
        });
    }
//删除擅长语言，参数：id
    function deleteSkillPageRow (id){
        $.confirm();
        $('.confirmModal').modal({
            closeViaDimmer: false,
            onConfirm: function (e) {
                getResponse({
                    type:'delete',
                    url: '/exam/customer/deleteAdepetLanguage?id='+id
                }).then(res => {
                    if(res.message === 'success'){
                        $.success('删除成功');
                        getAdeptLanguageList();
                    }else{
                        $.error(res.message);
                    }
                });
            },
            onCancel: function (e) { }
        });
    }
//获取考试剩余时间，参数：recordId
    async function getLeastTime(recordId) {
        return await getResponse({
            url: '/exam/customer/getLeastTime',
            data: {
                recordId: recordId
            }
        }).then(res => {
            return res;
        })
    }
//确认交卷，参数：recordId
    async function confirmPageSkill (_this, recordId){
        return await getResponse({
            type: 'post',
            url: '/exam/customer/commitConfirm',
            data: {
                recordId: recordId
            }
        }).then(res => {
            $(_this).removeAttr('disabled');
            $(_this).html('提交');
            return res;
        })
    }
/*
*
*       技能测试 --- 选择题
*
* */
    function createChoiceTest(id) {
            getResponse({
                type: 'post',
                url: '/exam/customer/createChoiceExam',
                data: { id: id }
            }).then(res => {
                let filedStr = '',
                    questionStr = '';
                if(res.message === 'success'){
                    const data = res.data.questions,
                        isLocal = localStorage.getItem('sy_rm_client_choice_test_id');
                    if(!isLocal || isLocal !== id){
                        localStorage.setItem('sy_rm_client_choice_test', JSON.stringify(data));
                        localStorage.setItem('sy_rm_client_choice_test_no', 0);
                        localStorage.setItem('sy_rm_client_choice_test_id', id);
                    }
                    let no = +localStorage.getItem('sy_rm_client_choice_test_no'),
                        questions = JSON.parse(localStorage.getItem('sy_rm_client_choice_test'));
                    questions[no].domain.forEach(item => {
                        filedStr += `<span class="sy-font-sm label">${item}</span>`;
                    });
                    questions[no].subDomain.slice(0,3).forEach(item => {
                        filedStr += `<span class="sy-font-sm label second">${item}</span>`;
                    });
                    questionStr += `
                        <h3>${no+1}. ${questions[no].questionRequirement}：</h3>
                        <p class="sy-font-md"><span>【题目】</span>${questions[no].questionHead}</p>
                        <ol class="sy-font-md">
                            <li data-answer="a" data-answer-id="${questions[no].answerId}">${questions[no]['A:']}</li>
                            <li data-answer="b" data-answer-id="${questions[no].answerId}">${questions[no]['B:']}</li>
                            <li data-answer="c" data-answer-id="${questions[no].answerId}">${questions[no]['C:']}</li>
                            <li data-answer="d" data-answer-id="${questions[no].answerId}">${questions[no]['D:']}</li>
                        </ol>`;
                    $('.currPage').html(`${no+1}/10`);
                    $('.field').html(filedStr);
                    $('.choiceTest').prepend(questionStr);
                    $('.choiceConfirmBtn')
                        .removeClass('sy-hidden')
                        .attr('data-recordId',res.data.recordId)
                        .html(+no >= 9 ? '提交':'下一题');
                    return new Promise(resolve => {
                        resolve(res.data.recordId);
                    })
                }else{
                    $.error(res.message);
                    setTimeout(()=>{
                       location.href = '/personal/skill';
                    }, 1500);
                }
            }).then(recordId => {
                getLeastTime(recordId).then(result => {
                    if(result.data.remainTime && result.data.remainTime > 0){
                        //倒计时
                        let countDownEl = $('span.time');
                        let time = Math.ceil(result.data.remainTime/1000);  //15分钟换算成900秒
                        let countDown = setInterval(function(){
                            time --;
                            let minute = parseInt(time / 60) > 9 ? parseInt(time / 60) : '0'+parseInt(time / 60),
                                second = parseInt(time % 60) > 9 ? parseInt(time % 60) : '0'+parseInt(time % 60);
                            countDownEl.html('00:'+ minute +':'+ second);
                            if(minute === '00' && second === '00'){
                                $.warning('测试时间已到');
                                clearInterval(countDown);
                                setTimeout(function () {
                                    localStorage.removeItem('sy_rm_client_choice_test');
                                    localStorage.removeItem('sy_rm_client_choice_test_no');
                                    localStorage.removeItem('sy_rm_client_choice_test_id');
                                    location.href = '/personal/skill';
                                },1500);
                                return false;
                            }
                        },1000);
                    }else{
                        localStorage.removeItem('sy_rm_client_choice_test');
                        localStorage.removeItem('sy_rm_client_choice_test_no');
                        localStorage.removeItem('sy_rm_client_choice_test_id');
                        location.href = '/personal/skill';
                    }
                })
            })
        }
//下一题或交卷
    function confirmChoiceResult(btn) {
        const _this = btn,
            tarEl = $('.choiceTest'),
            answerEl = tarEl.find('li.active');
        if(answerEl.length < 1){
            $.warning('请选择答案');
            return false;
        }
        const recordId = $(_this).attr('data-recordId');
        $(_this).attr('disabled','disabled');
        $(_this).html('<i class="am-icon-spinner am-icon-pulse"></i>');
        getResponse({
            type: 'post',
            url: '/exam/customer/selectCommitOne',
            data: {
                answer: answerEl.attr('data-answer'),
                answerId: answerEl.attr('data-answer-id'),
                recordId: recordId
            }
        }).then(res => {
            let filedStr = '',
                questionStr = '';
            let oldNo = +localStorage.getItem('sy_rm_client_choice_test_no'),
                questions = JSON.parse(localStorage.getItem('sy_rm_client_choice_test'));
            if(res.message === 'success'){
                localStorage.setItem('sy_rm_client_choice_test_no', oldNo+1);
                //确认交卷
                let curNo = +localStorage.getItem('sy_rm_client_choice_test_no');
                if(curNo === 10){
                    confirmPageSkill(_this, recordId).then(res => {
                        if(res.message === 'success'){
                            $.success('提交成功');
                            localStorage.removeItem('sy_rm_client_choice_test');
                            localStorage.removeItem('sy_rm_client_choice_test_no');
                            localStorage.removeItem('sy_rm_client_choice_test_id');
                            getChoiceResult(recordId);
                        }else{
                            $.error(res.message);
                        }
                    });
                    return null;
                }
                questions[curNo].domain.forEach(item => {
                    filedStr += `<span class="sy-font-sm label">${item}</span>`;
                });
                questions[curNo].subDomain.slice(0,3).forEach(item => {
                    filedStr += `<span class="sy-font-sm label second">${item}</span>`;
                });
                questionStr += `
                    <h3>${curNo+1}. ${questions[curNo].questionRequirement}：</h3>
                    <p class="sy-font-md"><span>【题目】</span>${questions[curNo].questionHead}</p>
                    <ol class="sy-font-md">
                        <li data-answer="a" data-answer-id="${questions[curNo].answerId}">${questions[curNo]['A:']}</li>
                        <li data-answer="b" data-answer-id="${questions[curNo].answerId}">${questions[curNo]['B:']}</li>
                        <li data-answer="c" data-answer-id="${questions[curNo].answerId}">${questions[curNo]['C:']}</li>
                        <li data-answer="d" data-answer-id="${questions[curNo].answerId}">${questions[curNo]['D:']}</li>
                    </ol>`;
                $(_this).prevAll().remove();
                $('.field').html(filedStr);
                $('.currPage').html(`${curNo+1}/10`);
                $('.choiceTest').prepend(questionStr);
            }else{
                $.error(res.message);
            }
            $(_this).removeAttr('disabled');
            $(_this).html(oldNo > 7 ? '提交':'下一题');
        })
    }
//获取选择题测试结果，参数：recordId
    function getChoiceResult(recordId){
        getResponse({
            type: 'post',
            url: '/exam/customer/getSelectExamResult',
            data: { recordId: recordId }
        }).then(res => {
            if(res.message === 'success'){
                let resultStr = '';
                if(res.data.examResult === '不合格'){
                    resultStr = `<div class="am-g sy-center result no-pass">
                                    <div class="bg"></div>
                                    <div class="tip">
                                        <p>很遗憾，你的测试未通过</p>
                                        <p>正确率：${res.data.examOverview}</p>
                                        <p class="sy-orange">请过段时间再来试试吧！</p>
                                        <a class="sy-btn sy-btn-green sy-btn-sh" href="/personal/skill">返回</a>
                                    </div>
                                </div>`;
                }else{
                    resultStr = `<div class="am-g sy-center sy-font-md result pass">
                                    <div class="bg"></div>
                                    <div class="tip">
                                        Congratulations! 你已经通过选择题测试，</br>
                                        现在可以进行翻译能力测试！
                                    </div>
                                    <a class="sy-btn sy-btn-green sy-btn-sh" href="/personal/skill">前往翻译题测试</a>
                                </div>`;
                }
                $('.choiceTest').remove();
                $('.choiceWrap').after(resultStr);
            }else{
                $.error(res.message);
            }
        })
    }
/*
*
*       技能测试 --- 翻译题
*
* */

//获取翻译题试题
    function createTransTest(id) {
        getResponse({
            type: 'post',
            url: '/exam/customer/createTranSExam',
            data: { id: id }
        }).then(res => {
            if(res.message === 'success'){
                $('.originTxt').html(res.data.questions[0].question);
                $('.targetTxt').val(res.data.questions[0].answer && res.data.questions[0].answer);
                $('.tempBtn,.confirmBtn').attr({
                    'data-rid': res.data.recordId,
                    'data-aid': res.data.questions[0].answerId
                });
                return new Promise(resolve => {
                    resolve(res.data.recordId);
                })
            }else{
                $.error(res.message);
                setTimeout(()=>{
                  location.href = '/personal/skill';
                }, 1500);
            }
        }).then(recordId => {
            //获取翻译剩余时间
            getLeastTime(recordId).then(result => {
                if(result.data.remainTime && result.data.remainTime > 0){
                    //倒计时
                    const countDownEl = $('span.time');
                    let time = result.data.remainTime/1000;
                    let countDown = setInterval(function(){
                        time --;
                        let hour = parseInt(time / 3600) > 9 ? parseInt(time / 3600) : '0'+parseInt(time / 3600),
                            minute = parseInt(time / (60*24)) > 9 ? parseInt(time / (60*24)) : '0'+parseInt(time / (60*24)),
                            second = parseInt(time % 60) > 9 ? parseInt(time % 60) : '0'+parseInt(time % 60);
                        countDownEl.html(hour +':'+ minute +':'+ second);
                        if(hour === '00' && minute === '00' && second === '00'){
                            $.warning('测试时间已到');
                            clearInterval(countDown);
                            setTimeout(function () {
                                location.href = '/personal/skill';
                            },1500);
                            return false;
                        }
                    },1000);
                }else{
                    location.href = '/personal/skill';
                }
            });
        })
    }
//翻译题临时保存
    function tempCommitTrans(btn) {
        $(btn).attr('disabled','disabled')
            .html('<i class="am-icon-spinner am-icon-pulse"></i>');
        getResponse({
            type: 'post',
            url: '/exam/customer/transCommitOne',
            data: {
                answer: $('.targetTxt').val(),
                answerId: $(btn).attr('data-aid'),
                recordId: $(btn).attr('data-rid')
            }
        }).then(res => {
            res.message === 'success' ? $.success('保存成功') : $.error(res.message);
            $(btn).removeAttr('disabled').html('保存');
        });
    }
//翻译题交卷，modal弹框，确认交卷
    function confirmCommitTrans(btn) {
        $.confirm();
        $('.confirmModal').modal({
            closeViaDimmer: false,
            onConfirm: function (e) {
                const rid = $(btn).attr('data-rid');
                $(btn).attr('disabled','disabled')
                    .html('<i class="am-icon-spinner am-icon-pulse"></i>');
                confirmPageSkill(btn, rid).then(res => {
                    if(res.message === 'success'){
                        $('.transing').remove();
                        let resultStr = `<div class="am-g sy-center result result-tip">
                                        <img src="/static/image/gongzhonghao.jpg" alt="公众号">
                                        <div class="sy-font-sm">译多多公众号</div>
                                        <div class="tip">
                                            <p>你的译文已经提交，工作人员将在3-5个工作日内完成审核。</p>
                                            <p>请关注<span class="sy-orange">数译网</span>RM微信公众号及时获知测试结果。</p>
                                            <label class="am-checkbox am-success">
                                                <input type="checkbox" value="" data-am-ucheck> 请通过短信告知我翻译结果
                                            </label>
                                            <p><a class="sy-btn sy-btn-green sy-btn-sh" href="/personal/skill">返回</a></p>
                                        </div>
                                    </div>`;
                        $('.positionEl').after(resultStr);
                    }else{
                        $.error(res.message);
                    }
                })
            },
            onCancel: function (e) { }
        });
    }
/*
*
* ------------------------ 分割线
*       认证中心
*
* */
//获取认证信息
    function getIdentyResult (){
        getResponse({
            url: '/userExtension/findResumeByUserId',
            data: {
                userId: localStorage.getItem('sy_rm_client_ud')
            }
        }).then(res => {
            if(res.message === 'success'){
                //身份信息
                let identifyStr = '';
                const identifyDiv = $('div.identify');
                if(res.data.userExtension.certificateNum){
                    const identy = res.data.userExtension;
                    identifyStr += `
                            <div class="info-item">
                                <div class="item">
                                    <div>真实姓名：</div>
                                    <div>${identy.realName}</div>
                                </div>
                                <div class="item">
                                    <div>证件类型：</div>
                                    <div>${identy.certificateType}</div>
                                </div>
                                <div class="item">
                                    <div>证件号码：</div>
                                    <div class="certificateNum">${identy.certificateNumFuzzy}</div>
                                    <div class="certificateNum sy-hidden" style="padding: 0 1rem;">${identy.certificateNum}</div>
                                </div>
                                <div class="item" style="padding-left: 152px;padding-top: 1rem;">
                                    <button type="button" 
                                            class="btn btn-default sy-btn sy-btn-green sy-btn-sh sy-font-md showIDCard" 
                                            style="background: #00BDC5;">查看完整信息</button>
                                </div>
                            </div>`;
                    $('.realName').val(identy.realName);
                    $('.identifyId').val(identy.certificateNum);
                    identifyDiv.find('.identy-no').remove();
                    identifyDiv.find('.add-form').remove();
                }else{
                    identifyDiv.find('.identy-yes').remove();
                }
                identifyDiv.find('.show-info').html(identifyStr);
                //结算方式
                let bankPayStr = '', aliPayStr = '', paypalStr = "";
                const payDiv = $('div.pay');
                if(res.data.settleList.length > 0){
                    let isShowBankForm = true,
                        isSHowAlipayForm = true,
                        isSHowPaypalForm = true;
                    res.data.settleList.forEach(item => {
                        if(item.settleDefault === 1){
                            $('input[name=payWay]').each(function() {
                                if(this.value === item.selttleName){
                                    this.setAttribute('checked', true);
                                }
                            })
                        }
                        if(item.selttleName === '支付宝'){
                            isSHowAlipayForm = false;
                            aliPayStr += `
                                <div class="info-item">
                                    <div class="item">
                                        <div>支付宝账号：</div>
                                        <div><span>${item.settleAccountFuzzy}</span>
                                        <i class="iconShow am-icon-eye-slash"></i></div>
                                    </div>
                                    <div class="item">
                                        <div>真实姓名：</div>
                                        <div><span>${item.realName}</span></div>
                                    </div>
                                     <div class="item">
                                        <div>证件类型：</div>
                                        <div><span>${res.data.userExtension.certificateType}</span></div>
                                    </div>
                                    <div class="operation sy-font-md">
                                        <div class="sy-hidden syHiddenData">${JSON.stringify(item)}</div>
                                        <a class="sy-edit" href="javascript:;">编辑</a>
                                    </div>
                                </div>`;
                        }else if(item.selttleName === '银行卡'){
                            isShowBankForm = false;
                            bankPayStr += `
                                <div class="info-item">
                                    <div class="item">
                                        <div>银行卡号：</div>
                                        <div><span>${item.settleAccountFuzzy}</span>
                                        <i class="iconShow am-icon-eye-slash"></i></div>
                                    </div>
                                    <div class="item">
                                        <div>开户银行：</div>
                                        <div>${item.bankDeposit}</div>
                                    </div>
                                    <div class="item">
                                        <div>开户支行：</div>
                                        <div>${item.bankBranch}</div>
                                    </div>
                                    <div class="operation sy-font-md">
                                        <div class="sy-hidden syHiddenData">${JSON.stringify(item)}</div>
                                        <a class="sy-edit" href="javascript:;">编辑</a>
                                    </div>
                                </div>`;
                        }else {
                            isSHowPaypalForm = false;
                            paypalStr += `
                                <div class="info-item">
                                    <div class="item">
                                        <div>Paypal账号：</div>
                                        <div><span>${item.settleAccountFuzzy}</span>
                                        <i class="iconShow am-icon-eye-slash"></i></div>
                                    </div>
                                    <div class="item">
                                        <div>真实姓名：</div>
                                        <div><span>${item.realName}</span></div>
                                    </div>
                                     <div class="item">
                                        <div>证件类型：</div>
                                        <div><span>${res.data.userExtension.certificateType}</span></div>
                                    </div>
                                    <div class="operation sy-font-md">
                                        <div class="sy-hidden syHiddenData">${JSON.stringify(item)}</div>
                                        <a class="sy-edit" href="javascript:;">编辑</a>
                                    </div>
                                </div>`;
                        }
                    });
                    payDiv.find('.identy-no').remove();
                    !isShowBankForm && $('.bankForm').addClass('sy-hidden');
                    !isSHowAlipayForm && $('.alipayForm').addClass('sy-hidden');
                    !isSHowPaypalForm && $('.PaypalForm').addClass('sy-hidden');
                }else{
                    payDiv.find('.identy-yes').remove();
                }
                payDiv.find('.bankPay').html(bankPayStr);
                payDiv.find('.aliPay').html(aliPayStr);
                payDiv.find('.Paypal').html(paypalStr);
            }
        })
    }
//提交身份认证
    $('.certificateBtn').on('click', function () {
        const _this = this,
            parentFrom = $(_this).parents('.add-form'),
            requiredEles = parentFrom.find('input[required],select[required],textarea[required]');
        const data = {};
        for(let i = 0; i < requiredEles.length; i++){
            const el = requiredEles[i];
            if(el.value.trim() === ''){
                el.focus();
                $.warning($(el).attr('placeholder'));
                return false;
            }else{
                data[el.className] = el.value;
            }
        }
        if(!/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(data.identifyId)){
            $.warning('请输入正确的身份证号码');
            return false;
        }
        data.userId = localStorage.getItem('sy_rm_client_ud');
        $(_this).attr('disabled','disabled');
        $(_this).html('<i class="am-icon-spinner am-icon-pulse"></i>');
        getResponse({
            type: 'post',
            url: '/userExtension/identityUser',
            data: data
        }).then(res => {
            if(res.message === 'success' && res.data){
                $.success('身份验证通过');
                getIdentyResult();
            }else{
                $.error(res.message);
            }
            $(_this).removeAttr('disabled');
            $(_this).html('保存');
        })
    });
//银行卡结算
    $('.setBankPayBtn').on('click', function () {
        const _this = this,
            parentFrom = $(_this).parents('.add-form'),
            requiredEles = parentFrom.find('input[required],select[required]');
        const data = {};
        for(let i = 0; i < requiredEles.length; i++){
            const el = requiredEles[i];
            if(el.value.trim() === ''){
                el.focus();
                $.warning($(el).attr('placeholder'));
                return false;
            }else{
                data[el.className] = el.value;
                if(el.className === 'identifyId'){
                    delete data[el.className];
                    data.identityId = el.value;
                }
            }
        }
        if(!/(^\d{16}$)|(^\d{17}$)|(^\d{19}$)/.test(data.bankNo)){
            $.warning('请输入正确的银行卡号');
            return false;
        }
        data.userId = localStorage.getItem('sy_rm_client_ud');
        data.id = $(_this).attr('data-u-id')?$(_this).attr('data-u-id'):'';
        $(_this).attr('disabled','disabled');
        $(_this).html('<i class="am-icon-spinner am-icon-pulse"></i>');
        getResponse({
            type: 'post',
            url: '/userExtension/setSettleByBank',
            data: data
        }).then(res => {
            if(res.message === 'success'){
                $.success('银行卡信息验证通过');
                getIdentyResult();
            }else{
                $.error(res.message);
            }
            $(_this).removeAttr('disabled');
            $(_this).html('保存');
        })
    });
//支付宝结算
    $('.setAliPayBtn').on('click', function () {
        const _this = this,
            parentFrom = $(_this).parents('.add-form'),
            requiredEles = parentFrom.find('input[required],select[required]');
        const data = {};
        for(let i = 0; i < requiredEles.length; i++){
            const el = requiredEles[i];
            if(el.value.trim() === ''){
                el.focus();
                $.warning($(el).attr('placeholder'));
                return false;
            }else {
                if(!$(el).hasClass('identifyId')){
                    data[el.className] = el.value;
                }
            }
        }
        data.userId = localStorage.getItem('sy_rm_client_ud');
        data.id = $(_this).attr('data-u-id')?$(_this).attr('data-u-id'):'';
        $(_this).attr('disabled','disabled');
        $(_this).html('<i class="am-icon-spinner am-icon-pulse"></i>');
        getResponse({
            type: 'post',
            url: '/userExtension/setSettleByAlipay',
            data: data
        }).then(res => {
            if(res.message === 'success'){
                $.success('保存成功');
                getIdentyResult();
            }else{
                $.error(res.message);
            }
            $(_this).removeAttr('disabled');
            $(_this).html('保存');
        })
    });
//paypal结算
    $('.setPayPalBtn').on('click', function () {
        const _this = this,
            parentFrom = $(_this).parents('.add-form'),
            requiredEles = parentFrom.find('input[required],select[required]');
        const data = {};
        for(let i = 0; i < requiredEles.length; i++){
            const el = requiredEles[i];
            if(el.value.trim() === ''){
                el.focus();
                $.warning($(el).attr('placeholder'));
                return false;
            }else {
                if(!$(el).hasClass('identifyId')){
                    data[el.className] = el.value;
                }
            }
        }
        data.defaultOrNot = '';
        data.paypalAccount = $('.PaypalCode').val();
        data.id = $(_this).attr('data-u-id')?$(_this).attr('data-u-id'):'';
        $(_this).attr('disabled','disabled');
        $(_this).html('<i class="am-icon-spinner am-icon-pulse"></i>');
        getResponse({
            type: 'post',
            url: '/finance/setSettleWayByPaypal',
            data: data
        }).then(res => {
            if(res.message === 'success'){
                $.success('保存成功');
                getIdentyResult();
            }else{
                $.error(res.message);
            }
            $(_this).removeAttr('disabled');
            $(_this).html('保存');
        })
    });
//设置默认结算方式
    $('div.identification input[name=payWay]').on('click', function () {
        const h3El = $(this).parents('h3'),
            formEl = h3El.next('.add-form'),
            infoEl = formEl.next('.show-info'),
            elHtml = infoEl.find('.operation').find('.sy-hidden').html();
        if(!elHtml){
            $.warning('请先绑定该结算方式');
            return null;
        }
        const data = elHtml && JSON.parse(elHtml);
        if(data){
            getResponse({
                type: 'put',
                url: '/userExtension/setDefaultSettle',
                data: {
                    settleId: data.id
                }
            }).then(res => {
                res.message === 'success'
                    ? $.success('设置成功')
                    : $.error(res.message);
            })
        }
    });
/*
*
* ------------------------ 分割线
*       安全设置
*
* */
//获取初始化设置信息
    function getSafetyResult (){
        getResponse({
            url: '/userExtension/findResumeByUserId',
            data: {
                userId: localStorage.getItem('sy_rm_client_ud')
            }
        }).then(res => {
            if(res.message === 'success'){
                $('#telPhone').val(res.data.telephone);
                if(+res.data.userExtension.bindEmail === 1){
                    const elDiv = $('.updateCode');
                    $('#updateEmail').val(res.data.email);
                    elDiv.removeClass('sy-hidden');
                    elDiv.nextAll('.item').addClass('sy-hidden');
                }
                if(res.data.userExtension.settlePassword){
                    const telBtn = $('#updateTelBtn');
                    telBtn.removeClass('sy-hidden');
                    telBtn.prev().addClass('sy-hidden');
                    telBtn.parents('.item').nextAll('.item').addClass('sy-hidden');
                }
            }
        });
    }
//修改密码
    function modifyPwd(btn) {
        const _this = btn;
        const addForm = $(_this).parents('form'),
            requiredEles = addForm.find('input[required]');
        for(let i = 0; i < requiredEles.length; i++){
            const el = requiredEles[i];
            if(el.value.trim() === ''){
                el.focus();
                $.warning($(el).attr('placeholder'));
                return false;
            }
        }
        const prePwd = $('#prePwd').val(),
            newPwd = $('#newPwd').val(),
            reNewPwd = $('#conNewPwd').val();
        if(newPwd.length < 6 || newPwd.length > 20 || reNewPwd.length < 6 || reNewPwd.length > 20){
            $.warning('请输入长度为6-20的密码');
            return false;
        }
        if(newPwd !== reNewPwd){
            $.warning('两次输入新密码不一致');
            return false;
        }
        $(_this).attr('disabled','disabled');
        $(_this).html('<i class="am-icon-spinner am-icon-pulse"></i>');
        getResponse({
            type: 'put',
            baseUrl: loginUrl,
            url: '/customer/renewPassword',
            data: {
                oldPassword: prePwd,
                newPassword: newPwd,
                renewPassword: reNewPwd
            }
        }).then(res => {
            if(res.message === 'success'){
                $.success('密码修改成功，请重新登录');
                localStorage.removeItem('sy_rm_client_access_token');
                setTimeout(() => {
                    location.href = '/login';
                },1500);
            }else{
                $.error(res.message);
            }
            $(_this).removeAttr('disabled');
            $(_this).html('保存');
        })
    }
//获取手机验证码
    function getValidateCode (btn){
        const _this = btn;
        const sMobile = $('#telPhone').val();
        if(!(/^1[1-9][0-9]{9}$/.test(sMobile))){
            $.warning('请输入正确的手机号');
            return false;
        }
        countDown(_this);
        getResponse({
            url: '/userExtension/sendCode',
            data: {
                telephone: sMobile
            }
        }).then(res => {
            res.message === 'success'
                ? $.success('验证码发送成功')
                : $.error(res.message);
        })
    }
//结算密码
    function settlePwd(btn){
        const _this = btn;
        const addForm = $(_this).parents('form'),
            requiredEles = addForm.find('input[required]');
        for(let i = 0; i < requiredEles.length; i++){
            const el = requiredEles[i];
            if(el.value.trim() === ''){
                el.focus();
                $.warning($(el).attr('placeholder'));
                return false;
            }
        }
        const telPhone = $('#telPhone').val(),
            telCode = $('#telCode').val(),
            settlePwd = $('#settlePwd').val(),
            settleRePwd = $('#settleRePwd').val();
        if(settlePwd.length < 6 || settlePwd.length > 20 || settleRePwd.length < 6 || settleRePwd.length > 20){
            $.warning('请输入长度为6-20的密码');
            return false;
        }
        if(settlePwd !== settleRePwd){
            $.warning('两次输入新密码不一致');
            return false;
        }
        $(_this).attr('disabled','disabled');
        $(_this).html('<i class="am-icon-spinner am-icon-pulse"></i>');
        getResponse({
            type: 'put',
            url: '/userExtension/setSettlePassword',
            data: {
                telphone: telPhone,
                verifyCode: telCode,
                selttlePassword: settlePwd,
                reSettlePassword: settleRePwd
            }
        }).then(res => {
            if(res.message === 'success'){
                $.success('结算密码设置成功');
                requiredEles.val('');
            }else{
                $.error(res.message);
            }
            $(_this).removeAttr('disabled');
            $(_this).html('保存');
        })
    }
//获取邮箱验证码
    function getEmailCode(btn){
        const _this = btn,
            email = $('#email').val();
        if(!(/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(email))){
            $.warning('请输入正确的邮箱地址');
            return false;
        }
        countDown(_this);
        getResponse({
            type: 'post',
            url: '/userExtension/verifyEmail',
            data: {
                email: email
            }
        }).then(res => {
            res.message === 'success'
                ? $.success('验证码发送成功')
                : $.error(res.message);
        })
    }
//提交邮箱绑定
    function bindingEmail(btn){
        const _this = btn;
        const addForm = $(_this).parents('form'),
            requiredEles = addForm.find('input[required]');
        for(let i = 0; i < requiredEles.length; i++){
            const el = requiredEles[i];
            if(el.value.trim() === ''){
                el.focus();
                $.warning($(el).attr('placeholder'));
                return false;
            }
        }
        const email = $('#email').val();
        if(!(/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(email))){
            $.warning('请输入正确的邮箱地址');
            return false;
        }
        $(_this).attr('disabled','disabled');
        $(_this).html('<i class="am-icon-spinner am-icon-pulse"></i>');
        getResponse({
            type: 'put',
            url: '/userExtension/bindEmail',
            data: {
                email: email,
                verifyCode: $('#emailCode').val(),
                userId: localStorage.getItem('sy_rm_client_ud')
            }
        }).then(res => {
            if(res.message === 'success'){
                $.success('邮箱绑定成功');
                requiredEles.val('');
            }else{
                $.error(res.message);
            }
            $(_this).removeAttr('disabled');
            $(_this).html('保存');
        })
    }

/*
*
* ------------------------ 分割线
*       注册邀请
*
* */
//获取邀请码
    function getApplicationCode(){
        getResponse({
            type: 'post',
            url: '/userExtension/generatedInvitationCode',
            data: {
                userId: localStorage.getItem('sy_rm_client_ud')
            }
        }).then(res => {
            if(res.message === 'success'){
                let myLink = location.origin + '/register?YQM='+ res.data;
                $('.myCode').html(res.data);
                $('.myLink').val(myLink);
            }
        });
    }

//获取用户已发送的邀请信息，返回list列表
    function getApplication(){
        const App = new ChPaging("#pagination",{
            limit: 10,
            viewOpt : [10,20,50],
            xhr : {//与jq的ajax方法属性值相似。不同点:不能设置success回调
                url : baseRMUrl + '/userExtension/listInvitationInfo',
                data : {
                    desc: 'desc',
                    sort: 'sort',
                    page: 0,
                    limit: 10
                }
            },
            xhrSuccess : function(res){//ajax中的success回调
                return {data : res, count : res.data.totalRow}
            },
            operationReady(param){//操作翻页执行前准备钩子
                App.set({//重置请求参数
                    xhr : {
                        data : {
                            page: param.current-1,
                            limit: param.limit
                        }
                    }
                }, false);
            },
            operationCallback (msg, res){
                if(res.message === 'success'){
                    let mesStr = '';
                    let dataList = res.data.list;
                    dataList.forEach(item => {
                        mesStr += `
                            <tr>
                                <td>${item.registerDateTime}</td>
                                <td>${item.nickName}</td>
                                <td>${item.realName}</td>
                                <td>${item.account}</td>
                                <td>${item.resumeStatus}</td>
                                <td>${item.examPassStatus}</td>
                                <td>${item.orderCount}</td>
                            </tr>`;
                    });
                    $('tbody.application').html(dataList.length > 0 ? mesStr:`<tr class="empty"><td colspan="7">暂无邀请</td></tr>`);
                }else{
                    $.error(res.message);
                }
            }
        });
        return App;
    }

/*
*
* ------------------------ 分割线
*       消息通知
*
* */
//获取消息通知，type默认为1（订单消息）
    function getPageMessage (type = 1){
        const GetMessage = new ChPaging("#pagination",{
            limit: 10,
            viewOpt : [10,20,50],
            xhr : {//与jq的ajax方法属性值相似。不同点:不能设置success回调
                url : baseRMUrl + '/notice/noticeList',
                data : {
                    noticeType: '',
                    status: type,
                    pageNo: 0,
                    pageSize: 10
                }
            },
            //0-其他消息 1-订单消息
            xhrSuccess : function(res){//ajax中的success回调
                return {data : res, count : res.data.totalElements}
            },
            operationReady(param){//操作翻页执行前准备钩子
                const setType = $('.mgFilter>label.active').attr('data-type');
                GetMessage.set({//重置请求参数
                    xhr : {
                        data : {
                            status: setType,
                            pageNo: param.current-1,
                            pageSize: param.limit
                        }
                    }
                }, false);
            },
            operationCallback (msg, res){//处理数据
                if(res.message === 'success'){
                    let mesStr = "", strArr = [];
                    res.data.content.forEach(item => {
                        let repStr = item.content.replace('{', `<a href="/">`).replace('}','</a>');
                        mesStr = `
                            <tr class="${item.status === 0 ? 'will' : ''}">
                                <td><div>${repStr}</div></td>
                                <td class="time">${item.publishTime}</td>
                            </tr>`;
                        strArr.push(mesStr);
                    });
                    let resultStr = strArr.join('');
                    resultStr = res.data.content.length > 0 ? resultStr : `<tr class="empty"><td colspan="2">暂无消息</td></tr>`;
                    $('table.mgList>tbody').html(resultStr);
                }else{
                    $.error(res.message);
                }
            }
        });
        return GetMessage;
    }
/*
*
* ------------------------ 分割线
*       意见反馈
*
* */
//反馈列表 page 页数， size 每页条目
    function getAdviceList(pageNo = 0,pageSize = 10) {
        const container = $('.contentList'),
            moreBtn = $(".loadMoreBtn");
        getResponse({
            url:　'/feedback/listFeedBack',
            data: {
                desc: '',
                sort: '',
                limit: pageSize,
                page: pageNo
            }
        }).then(res => {
            pageNo === 0 && moreBtn.attr('data-page', 0) && container.html('');
            let page = +moreBtn.attr('data-page');
            if(res.message === 'success'){
                page ++;
                const { data: { content } } = res;
                let listStr = "";
                content.forEach(function (item) {
                    var imgStr = "",
                        imgArr = JSON.parse(item.feedbackAttatch);
                    imgArr.forEach(function (src) {
                        imgStr += `<img src="${src}" title="点击查看大图" alt="">`;
                    });
                    listStr += `<div class="item">
                                        <h5>${item.feedbackType}</h5>
                                        <span>${item.gmtCreate}</span>
                                        <p>${item.feedbackContent.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>
                                        <div>${imgStr}</div>
                                    </div>`;
                });
                if(content.length > 0){
                    moreBtn.removeClass('sy-hidden');
                }else{
                    $.warning('暂无更多反馈');
                    moreBtn.addClass('sy-hidden');
                    return null;
                }
                if(res.data.totalElements === 0){
                    listStr = `<p style="padding-left: 20px;color: #999;font-size: 14px">暂无反馈</p>`;
                }
                container.append(listStr);
                moreBtn.attr('data-page', page);
            }
            moreBtn.removeAttr('disabled').html('加载更多');
        })
    }
/*
*
* ------------------------ 分割线
*       我的评价
*
* */
//我的评价（好评/中评/差评）
    function getAppraiseList (level = 0, pagesize = 10){
        let moreBtn = $(".appraiseLoadMoreBtn"),
            pageEl = $('.appraisePageNo'),
            pageNo = +pageEl.val();
        getResponse({
            url: '/orderAndComment/getMyOrderComments',
            data: {
                pageNo: pageNo,
                pageSize: pagesize,
                level: level
            }
        }).then(res => {
            if(res.message === 'success'){
                let bodyStr = "", listArr = [];
                pageNo += 1;
                res.data.results.forEach(item => {
                    //评价标签
                    const attitudeArr = item.attitudeDesc && item.attitudeDesc.split(',') || [],
                        qualityArr = item.qualityDesc && item.qualityDesc.split(',') || [],
                        speedArr = item.speedDesc && item.speedDesc.split(',') || [];
                    const aStr = attitudeArr.map(item => `<span>${item}</span>`),
                        qStr = qualityArr.map(item => `<span>${item}</span>`),
                        sStr = speedArr.map(item => `<span>${item}</span>`);
                    //评价星星
                    const score = item.score;
                    let starStr = "", starNo = '';
                    switch (true){
                        case score > 90:
                            starNo = '5星';
                            starStr = `<i class="star yellow"></i>
                                        <i class="star yellow"></i>
                                        <i class="star yellow"></i>
                                        <i class="star yellow"></i>
                                        <i class="star yellow"></i>`;
                            break;
                        case score >= 75 && score < 90:
                            starNo = '4星';
                            starStr = `<i class="star yellow"></i>
                                        <i class="star yellow"></i>
                                        <i class="star yellow"></i>
                                        <i class="star yellow"></i>
                                        <i class="star grey"></i>`;
                            break;
                        case score >= 60 && score < 75:
                            starNo = '3星';
                            starStr = `<i class="star yellow"></i>
                                        <i class="star yellow"></i>
                                        <i class="star yellow"></i>
                                        <i class="star grey"></i>
                                        <i class="star grey"></i>`;
                            break;
                        case score >= 50 && score < 60:
                            starNo = '2星';
                            starStr = `<i class="star yellow"></i>
                                        <i class="star yellow"></i>
                                        <i class="star grey"></i>
                                        <i class="star grey"></i>
                                        <i class="star grey"></i>`;
                            break;
                        case score < 50:
                            starNo = '1星';
                            starStr = `<i class="star yellow"></i>
                                        <i class="star grey"></i>
                                        <i class="star grey"></i>
                                        <i class="star grey"></i>
                                        <i class="star grey"></i>`;
                            break;
                    }
                    let listStr = `<div class="item">
                                        <div class="title">
                                            <strong class="no">订单编号：${item.orderId}</strong>
                                            <strong class="name">订单名称：${item.orderName}</strong>
                                            <div class="stars">${starStr + starNo}</div>
                                        </div>
                                        <div class="label">${aStr.join('')+qStr.join('')+sStr.join('')}</div>
                                        <div class="font">${item.commentDesc}</div>
                                    </div>`;
                    listArr.push(listStr);
                });
                if(res.data.results.length > 0){
                    bodyStr = listArr.join('');
                    moreBtn.removeClass('sy-hidden');
                }else if(res.data.totalCount !== 0 && res.data.results.length === 0){
                    $.warning('暂无更多评价');
                    moreBtn.addClass('sy-hidden');
                    return null;
                }else if(res.data.totalCount === 0){
                    bodyStr = `<p class="empty">暂无评价</p>`;
                    moreBtn.addClass('sy-hidden');
                }
                pageEl.val(pageNo);
                $('.appraiseList').append(bodyStr);
            }else{
                $.warning(res.message);
            }
            moreBtn.removeAttr('disabled').html('加载更多');
        });
    }

/*
*
* ------------------------ 分割线
*       结算中心
*
* */
//获取账户金额
    function getAccountAmount() {
        getResponse({
            url: '/finance/getFinanceInfo'
        }).then(res => {
            if(res.message === 'success' && res.data){
                $('#remainMoney_Balance').html(res.data.accountBalance);
                $('#outMoney_Balance')
                    .attr('data-num',res.data.withdrawBalance)
                    .html(res.data.withdrawBalance);
                $('#totalMoney_Balance')
                    .attr('data-num',res.data.totalBalance)
                    .html(res.data.totalBalance);
            }
        });
    }
//获取税率
    function getTaxRate(_this) {
        let val = _this.value;
        const tipEl = $('.drawAll_Balance').next('p');
        if(val.trim() === ''){
            $.warning('请输入提现金额');
            return null;
        }
        getResponse({
            url: '/finance/calCashWithdrawalAmount',
            data: {
                cashWithDrawalBalance: val,
                payType: $('.withdrawalType').val()
            }
        }).then(res => {
            tipEl.html('');
            if(res.message === 'success'){
                let { data } = res, tipStr = '';
                if(data.payType === '社保51' || data.payType === '云账户'){
                    tipStr = `平台代缴¥${data.taxation.toFixed(2)}税费（费率：${data.rate*100}%）`;
                } else {
                    tipStr = res.data.message;
                }
                tipEl.html(tipStr);
            }else{
                $.warning(res.message);
            }
        })
    }
//申请提现
    //1.判断提现条件
    function judgeWithdrawLimit() {
        getResponse({
            url: '/finance/judge'
        }).then(res => {
            if(res.message === 'success'){
                const {data} = res;
                if(!(data.certificatePassed && data.settleCertificatePassed)){
                    $.toolinfo({
                        href: '<a class="sy-modal-href sy-btn sy-btn-green sy-btn-sm" href="/personal/identification">去认证</a>',
                        close: '下次再说',
                        txt: '提现前，请先完成身份和结算认证'
                    });
                }
                !data.bank && $('.am-radio.bankCheck').remove();
                !data.alipay && $('.am-radio.alipayCheck').remove();
                !data.paypal && $('.am-radio.paypalCheck').remove();
                if(data.ageReuire){
                    $('.ageTrue').removeClass('sy-hidden');
                    $('.ageFalse').remove();
                    $('.paypalCheck').remove();
                    $('.withdrawalType').val('社保51');
                }else{
                    $('.ageFalse').removeClass('sy-hidden');
                    $('.ageTrue').remove();
                    $('.withdrawalType').val('云账户');
                }
                if(!data.mainlandOrNot){
                    $('.drawAll_Balance').next('p').html('会依法缴纳税费，请以实际到账为准');
                    $('.withdrawalType').val('其他');
                }
            }
        });
        getWithdrawProgress();
    }
    //2.确认提现
    function commitWithdraw(btn) {
        const _this = btn;
        const payWay = $('input[name=payWay]:checked').val(),
            amount = $('.withdrawalAmount').val(),
            password = $('.withdrawalPwd').val(),
            payType = $('.withdrawalType').val();
        const data = {
            amount: amount,
            payType: payType,
            settleType: payWay,
            settlePassword: password
        };
        for(let prop in data){
            if(!data[prop] || data[prop].trim() === ''){
                $.warning('请填写相关信息');
                return null;
            }
        }
        data.defaultOrNot = 0;
        _this.setAttribute('disabled', true);
        _this.innerHTML = '<i class="am-icon-spinner am-icon-pulse"></i>';
        getResponse({
            type: 'post',
            url: '/finance/applyCashout',
            data: data
        }).then(res => {
            res.message === 'success'
                ? $.success('申请提现成功')
                : $.error(res.message);
            _this.removeAttribute('disabled');
            _this.innerHTML = '申请提现';
            return new Promise(resolve => {
                resolve(res);
            })
        }).then(comp => {
            if(comp){
                getWithdrawProgress();
                getAccountAmount();
                getIncomeDetail();
            }
        })
    }
//获取提现进度
    function getWithdrawProgress() {
        const date = new Date().getDate();
        if(date < 16 || date > 20){
            $('.drawCash').append(`<div class="mask">非结算申请时间段</div>`);
            return null;
        }
        getResponse({
            url: '/finance/getCashwithdrawalProgress'
        }).then(res => {
            if(res.message ==='success'){
                if(res.data.alreadyWithdrawal){
                    $('.drawCash').append(`<div class="mask">当月结算申请已提交</div>`);
                }
            }
        })
    }
//获取收入明细
    function getIncomeDetail(filter = ''){
        const finance = new ChPaging("#pagination",{
            limit: 10,
            viewOpt : [10,20,50],
            xhr : {//与jq的ajax方法属性值相似。不同点:不能设置success回调
                url : baseRMUrl + '/finance/listFinanceDetail',
                data : {
                    dateFilterStr: filter,
                    desc: 'desc',
                    sort: 'sort',
                    page: 0,
                    limit: 10
                }
            },
            xhrSuccess : function(res){//ajax中的success回调
                return {data : res, count : res.data.totalElements}
            },
            operationReady(param){//操作翻页执行前准备钩子
                const type = $('label.incomeFilter.active').attr('data-type');
                finance.set({//重置请求参数
                    xhr : {
                        data : {
                            dateFilterStr: type,
                            page: param.current-1,
                            limit: param.limit
                        }
                    }
                });
            },
            operationCallback (msg, res){
                if(res.message === 'success'){
                    let mesStr = '',
                        dataList = res.data.content;
                    dataList.forEach(item => {
                        let explain = '';
                        if(item.changeType === '申请提现'){
                            explain = `${item.changeType} - ${item.settleNo}`;
                        }else{
                            explain = `${item.changeType} - ${item.taskNo}`;
                        }
                        mesStr += `<tr>
                                      <td>${item.gmtCreate}</td>
                                      <td>${item.amount}</td>
                                      <td>${item.settleType} - ${item.account}</td>
                                      <td>${explain}</td>
                                   </tr>`;
                    });
                    $('tbody.financeList').html(dataList.length > 0 ? mesStr:`<tr class="empty"><td colspan="4">暂无明细</td></tr>`);
                }else{
                    $.error(res.message);
                }
            }
        });
        return finance;
    }

    /*
    *
    * ------------------------ 分割线
    *       信息概览
    *
    * */    
    function getUserAllInfo() {
        //获取信息完整度
        getResponse({
            url: '/userExtension/calInfoIntegrity'
        }).then(res => {
            if(res.message === 'success'){
                $('.sy-progress>div').css('width', res.data+'%');
                $('.sy-progress-txt').html(res.data.toFixed(0)+'%');
                if(res.data === 0){
                    const token = localStorage.removeItem('sy_rm_client_access_token'),
                        uid = localStorage.removeItem('sy_rm_client_ud');
                    $.toolinfo({
                        href: `<a class="sy-modal-href sy-btn sy-btn-green sy-btn-sm" href="/baseInfo?t=${token}&u=${uid}">去完善</a>`,
                        close: '下次再说',
                        txt: '请及时完善你的基本信息！'
                    });
                }
            }
        });
        //获取认证信息
        getResponse({
            url: '/userExtension/findResumeByUserId',
            data: {
                userId: localStorage.getItem('sy_rm_client_ud')
            }
        }).then(res => {
            if(res.message === 'success'){
                const { data } = res;
                let isPassCertificate = false,
                    isPassSkill = false,
                    isPassFinance = false;
                if(data.userExtension){
                    isPassCertificate = data.userExtension.certificatePassed>0?true:false;
                    isPassFinance = data.userExtension.settleCertificatePassed>0?true:false;
                }
                if(data.userExtendList){
                    for(let i = 0,len=data.userExtendList.length; i<len; i++){
                        let item = data.userExtendList[i];
                        if(item.levelId && item.levelId !== '0'){
                            isPassSkill = true;
                            break;
                        }
                    }
                }
                isPassSkill && $('.skill_identify')
                    .addClass('complete')
                    .html(`<span class="sy-info-icon"></span>已通过技能认证`);
                isPassCertificate && $('.card_identify')
                    .addClass('complete')
                    .html(`<span class="sy-info-icon"></span>已通过身份认证`);
                isPassFinance && $('.finance_identify')
                    .addClass('complete')
                    .html(`<span class="sy-info-icon"></span>已认证财务信息`);
            }
            return new Promise(resolve => {
              resolve(res.data.userCode);
            })
        }).then(code => {
            //获取订单预览，通过userCode
            if(code){
                getResponse({
                    url: '/task/listCurrentUserTask',
                    data: {
                        userCode: code
                    }
                }).then(res => {
                    if(res.success){
                        const {data} = res;
                        $('#orderStatus_doing').html(data.taskNumIng);
                        $('#orderStatus_waiting').html(data.taskNumNoConfirmed);
                        $('#orderStatus_done').html(data.taskNumEnd);
                        $('#orderStatus_font').html(data.transWorkNum);
                    }
                })
            }
        });
        //获取账户余额
        getResponse({
            url: '/finance/getFinanceInfo'
        }).then(res => {
            if(res.message === 'success' && res.data){
                $('.amountMoney')
                    .attr('data-num',res.data.accountBalance)
                    .html(res.data.accountBalance);
                $('.drawMoney')
                    .attr('data-num',res.data.withdrawBalance)
                    .html(res.data.withdrawBalance);
            }
        });
        //获取消息通知
        getResponse({
            url: '/notice/noticeList',
            data : {
                noticeType: '',
                status: '',
                pageNo: 0,
                pageSize: 10
            }
        }).then(res => {
            if(res.message === 'success'){
                let mesStrArr = [];
                res.data.content.forEach(item => {
                    let repStr = item.content.replace('{', `<a href="/">`).replace('}','</a>');
                    mesStrArr.push(`<div class="message-item">
                                       <div>${repStr}</div>
                                       <span class="sy-float-r">${item.publishTime}</span>
                                    </div>`);
                });
                mesStrArr.length > 3 && (mesStrArr.length = 3);
                $('.messageCnt').html(res.data.content.length > 0 ? mesStrArr.join('') : `<p class="empty sy-left">暂无消息</p>`);
            }
        });
        //获取语言对
        getResponse({
            url: '/exam/customer/listAdeptLanguages'
        }).then(res => {
            if(res.message === 'success'){
                const { data } = res;
                let lanHtml = '';
                const formatArr = [];
                data.forEach(item => {
                    let level = '/';
                    if(item.cuLevelList){
                        item.cuLevelList.forEach(em => {
                            (em.levelType === 'trans' && em.level) && (level = 'P'+em.level);
                        });
                    }
                    const obj = {
                        originName: item.originLanguageName.split('-')[0].trim(),
                        originCode: item.originLanguageCode,
                        targetName: item.targetLanguageName.split('-')[0].trim(),
                        targetCode: item.targetLanguageCode,
                        row: [{
                            domain: JSON.parse(item.domain).toString(),
                            subDomain: JSON.parse(item.subDomain),
                            level: level
                        }]
                    };
                    //语言对相同，则添加到row里面，否则添加到arr第一条
                    if(formatArr.length === 0){
                        formatArr.unshift(obj);
                    }else {
                        if(formatArr[0].originCode === item.originLanguageCode
                            && formatArr[0].targetCode === item.targetLanguageCode){
                            formatArr[0].row.push({
                                domain: JSON.parse(item.domain),
                                subDomain: JSON.parse(item.subDomain),
                                level: level
                            });
                        }else{
                            formatArr.unshift(obj);
                        }
                    }
                });
                formatArr.reverse();
                formatArr.forEach(item => {
                    let rowStr = '';
                    item.row.forEach(row => {
                        let subDomain = row.subDomain.reduce((prev, curr) => {
                            return prev + `<span>${curr}</span>`
                        },'');
                        rowStr += `<div>
                                        <div class="level"><span>${row.level}</span></div>
                                        <div>
                                            <div class="first">${row.domain}</div>
                                            <div class="second">${subDomain}</div>
                                        </div>
                                    </div>`;
                    });
                    lanHtml += `<div class="language-item">
                                    <div class="left">
                                        <strong>${item.originName} → ${item.targetName}</strong>
                                        <span>${item.originCode} → ${item.targetCode}</span>
                                    </div>
                                    <div class="right">${rowStr}</div>
                                </div>`;
                });
                $('.languageCnt').html(data.length > 0 ? lanHtml : `<p class="empty">暂未选择语言对</p>`);
            }
        });
    }

/*
*   ------------------------ 分割线
*
* */
    return {
        getResponse,
        getBaseInfo,
        commitBaseInfo,
        commitBaseTeamInfo,
        getResumeInfo,
        getResumeBaseInfo,
        getAdeptLanguageList,
        deleteSkillPageRow,
        confirmChoiceResult,
        createChoiceTest,
        createTransTest,
        tempCommitTrans,
        confirmCommitTrans,
        getIdentyResult,
        getPageMessage,
        getApplication,
        getApplicationCode,
        getAdviceList,
        getAppraiseList,
        getAccountAmount,
        getIncomeDetail,
        judgeWithdrawLimit,
        commitWithdraw,
        getTaxRate,
        getUserAllInfo,
        getSafetyResult,
        modifyPwd,
        getValidateCode,
        settlePwd,
        getEmailCode,
        bindingEmail
    }

})(window, document, jQuery);

export default personalServer;
