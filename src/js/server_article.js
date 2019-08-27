/*
* module：views -> article、personalArticle （文章管理模块）
* export：articleServer
* author: zy
* date: 2019/07/17
*
* */

import { getResponse } from "./asyncAjax";
import { getQueryString, throttleFn } from "./utils";
import { baseRMUrl } from "./interceptor";
import './modal';

const articleServer = (function (global, document, $, undefined){

    'use strict';
/*
*
* 文章详情添加click事件委托
*
* */
    $('div.article_pageDetail').on('click', function (e) {
        let event = e || global.event,
            targetEl = event.target || event.srcElement;
        if(targetEl.nodeType !== 1) return;
        //添加“点赞”功能
        if(targetEl.nodeName === 'I' && $(targetEl).hasClass('icon-thumbs')){
            const isOfficial = getQueryString('ofi') ? 1 : 0;
            $.ajax({
                type: 'put',
                url: baseRMUrl+'/interpreterArticle/articleLike',
                data: {
                    articleId: getQueryString('aid'),
                    type: isOfficial
                },
                success: function (res) {
                    if(res.message==='success'){
                        $.success('已点赞');
                        setTimeout('location.reload(true);', 1000);
                    }else{
                        $.error(res.message);
                    }
                },
                error: function (xhr) {
                    if(xhr.status === 401 || xhr.responseJSON.error === 'invalid_token'){
                        $.warning('请先登录');
                    }
                }
            })
        //发布评论
        }else if($(targetEl).hasClass('AddCommentBtn')){
            const textArea = $(targetEl).parent().prev();
            if(textArea[0].value.trim() === ''){
                $.warning('请输入评论内容');
                return null;
            }
            const globalData = $('#loginUserBase').html();
            const nickName = globalData ? JSON.parse(globalData).nickName : '';
            targetEl.innerHTML = '<i class="am-icon-spinner am-icon-pulse"></i>';
            targetEl.setAttribute('disabled', true);
            $.ajax({
                type: 'post',
                url: baseRMUrl + '/commentAndLog/addComment',
                data: {
                    bussinessId: getQueryString('aid'),
                    commentContent: textArea[0].value,
                    nickName: nickName
                },
                success: function (res) {
                    if(res.code === '200'){
                        $.success('发布成功');
                        $('.commentList').empty();
                        $('.commentPageNo').val(1);
                        textArea[0].value = '';
                        getCommentsList();
                    }else{
                        $.error(res.message);
                    }
                },
                error: function (xhr) {
                    if(xhr.status === 401 || xhr.responseJSON.error === 'invalid_token'){
                        $.warning('请先登录');
                    }
                },
                complete: function () {
                    targetEl.innerHTML = '发布';
                    targetEl.removeAttribute('disabled');
                }
            });
            //js动态添加"评论回复框"
        }else if(targetEl.classList.contains('replyIcon')){
            let parentNode = targetEl.parentNode,
                isExistNextEl = targetEl.nextElementSibling;
            let nextEl = document.createElement('div');
            nextEl.className = 'add-comment';
            nextEl.innerHTML = `<textarea placeholder="欢迎留言评论哦~"></textarea>
                                <div class="sy-right">
                                    <button type="button" class="sy-btn sy-btn-white sy-btn-md cancel">取消</button>
                                    <button type="button" class="sy-btn sy-btn-green sy-btn-md release">发布</button>
                                </div>`;
            if(!isExistNextEl){
                parentNode.appendChild(nextEl);
            }else if(isExistNextEl.className !== 'add-comment'){
                parentNode.insertBefore(nextEl, isExistNextEl);
            }
            //取消“评论回复框”
        }else if(targetEl.classList.contains('cancel')){
            targetEl.parentNode.parentNode.remove();
            //发表“评论回复”
        }else if(targetEl.classList.contains('release')){
            //...ajax here
            //添加回复
            const parentNode = $(targetEl).parent(),
                textArea = parentNode.prev();
            if(textArea[0].value.trim() === ''){
                $.warning('请输入评论内容');
                return null;
            }
            let localData = '';
            const localDataEl = $(targetEl).parents('.add-comment').prev().prev('.replyData');
            if(localDataEl.length > 0){
                localData = JSON.parse(localDataEl.html());
            }
            let globalData = $('#loginUserBase').html();
            const nickName = globalData ? JSON.parse(globalData).nickName : '';
            targetEl.innerHTML = '<i class="am-icon-spinner am-icon-pulse"></i>';
            targetEl.setAttribute('disabled', true);
            $.ajax({
                type: 'post',
                url: baseRMUrl + '/commentAndLog/addCommentReply',
                data: {
                    commentId: localData.commentId,
                    replyContent: textArea[0].value,
                    replyTarget: localData.replyTarget,
                    nickName: nickName
                },
                success: function (res) {
                    if(res.code === '200'){
                        $.success('回复成功');
                        $('.commentList').empty();
                        $('.commentPageNo').val(1);
                        textArea.value = '';
                        getCommentsList();
                    }else{
                        $.error(res.message);
                    }
                },
                error: function (xhr) {
                    if(xhr.status === 401 || xhr.responseJSON.error === 'invalid_token'){
                        $.warning('请先登录');
                    }
                },
                complete: function () {
                    targetEl.innerHTML = '发布';
                    targetEl.removeAttribute('disabled');
                }
            });
            //加载更多评论内容
        }else if(targetEl.classList.contains('loadMoreCommentBtn')){
            getCommentsList();
        }
    });

//获取评论列表
    function getCommentsList(size = 5) {
        let moreBtn = $(".loadMoreCommentBtn"),
            pageEl = $('.commentPageNo'),
            pageNo = +pageEl.val();
        getResponse({
            type: 'post',
            url: '/commentAndLog/getCommentAndReply',
            data: {
                bussinessId: getQueryString('aid'),
                pageNo: pageNo,
                pageSize: size
            }
        }).then(res => {
            if(res && res.results.length >= 0){
                let bodyStr = '', replyArr = [];
                res.results.forEach(item => {
                    let replyStr = '';
                    item.replies.forEach(item1 => {
                        const tempObj1 = {
                            commentId: item1.id,
                            replyTarget: item1.userNickName
                        };
                        replyStr += `<div class="item">
                                        <div class="head">
                                            <img src="${item1.userHeadId ? item1.userHeadId:'/static/image/index-default-head.png'}" width="60" height="60" alt="">
                                        </div>
                                        <div class="comment-cnt">
                                            <h5 class="title">${item1.userNickName}</h5>
                                            <span class="time">${item1.replyTime}</span>
                                            <div class="txt">${item1.content}</div>
                                            <div class="reply">
                                                <div class="replyData sy-hidden">${JSON.stringify(tempObj1)}</div>
                                                <div class="reply-icon replyIcon">回复</div>
                                            </div>
                                        </div>
                                    </div>`;
                    });
                    const tempObj = {
                        commentId: item.id,
                        replyTarget: item.userNickName
                    };
                    replyArr.push(`<div class="item">
                                    <div class="head">
                                        <img src="${item.userHeadId ? item.userHeadId:'/static/image/index-default-head.png'}" width="60" height="60" alt="">
                                    </div>
                                    <div class="comment-cnt">
                                        <!-- 作者本人，添加class：author -->
                                        <h5 class="title">${item.userNickName}</h5>
                                        <span class="time">${item.createTime}</span>
                                        <div class="txt">${item.content}</div>
                                        <div class="reply">
                                            <div class="replyData sy-hidden">${JSON.stringify(tempObj)}</div>
                                            <div class="reply-icon replyIcon">回复</div>
                                            ${replyStr}
                                        </div>
                                    </div>
                                </div>`);
                });
                pageNo += 1;
                pageEl.val(pageNo);
                if(res.results.length > 0){
                    bodyStr = replyArr.join('');
                    moreBtn.removeClass('sy-hidden');
                }else if(res.totalCount === 0){
                    bodyStr = `<p class="empty">暂无评论</p>`;
                    moreBtn.addClass('sy-hidden');
                }
                if(res.pageCount === pageNo - 1){
                    moreBtn.addClass('sy-hidden');
                }
                $('.commentList').append(bodyStr);
            }
            moreBtn.removeAttr('disabled').html('加载更多');
        })
    }
//首页 “文章精选、行业资讯”
    function getIndexGoodArticle(page = 0, size = 2){

        //文章精选
        getResponse({
            url: '/interpreterArticle/interpreterArticleListSelect',
            data: {
                pageNo: page,
                pageSize: size
            }
        }).then(res => {
            if(res.message ==='success'){
                let mesStr = '';
                res.data.content.forEach(item => {
                   mesStr += `<div class="item">
                                <div class="img"><img src="${item.coverId}" alt=""></div>
                                <div class="item-cnt">
                                    <a href="/information/detail?aid=${item.id}&uid=${item.publishUserId}">
                                        <h5>${item.articleTitle}</h5>
                                    </a>
                                    <p>${item.partContent}</p>
                                    <div class="am-g">
                                        <div class="am-u-sm-2">
                                            <a href="/article?uid=${item.publishUserId}"><img src="/static/image/index-default-head.png" alt="">${item.publishUser}</a>
                                        </div>
                                        <div class="am-u-sm-4">${item.publishTime?item.publishTime:''}</div>
                                        <div class="am-u-sm-2 sy-center">
                                            <i class="sy-icon icon-eye"></i>${item.viewCount}
                                        </div>
                                        <div class="am-u-sm-2 sy-center">
                                            <i class="sy-icon icon-thumbs"></i>${item.likeNumber}
                                        </div>
                                        <div class="am-u-sm-2 sy-center">
                                            <i class="sy-icon icon-commenting"></i>${item.commentsNumber}
                                        </div>
                                    </div>
                                </div>
                             </div>`;
                });
                res.data.content.length > 0 && $('.indexSaying').removeClass('sy-hidden');
                $('div.goodArticleCnt>.more').before(mesStr);
            }
        });
        //行业资讯
        getResponse({
            url: '/officialArticle/listOfficialArticle',
            data: {
                pageNo: page,
                pageSize: size
            }
        }).then(res => {
            if(res.message ==='success'){
                let mesStr = '';
                res.data.content.forEach(item => {
                    mesStr += `<div class="item">
                                <div class="img"><img src="${item.coverId}" alt=""></div>
                                <div class="item-cnt">
                                    <a href="/information/industryDetail?aid=${item.id}&ofi=true">
                                        <h5>${item.articleTitle}</h5>
                                    </a>
                                    <p>${item.partContent}</p>
                                    <div class="am-g">
                                        <div class="am-u-sm-6">${item.publishTime?item.publishTime:''}</div>
                                        <div class="am-u-sm-2 sy-center">
                                            <i class="sy-icon icon-eye"></i>${item.viewCount}
                                        </div>
                                        <div class="am-u-sm-2 sy-center">
                                            <i class="sy-icon icon-thumbs"></i>${item.likeCount}
                                        </div>
                                        <div class="am-u-sm-2 sy-center">
                                            <i class="sy-icon icon-commenting"></i>${item.commentsCount}
                                        </div>
                                    </div>
                                </div>
                             </div>`;
                });
                res.data.content.length > 0 && $('.indexInfo').removeClass('sy-hidden');
                $('div.industryArticleCnt>.more').before(mesStr);
            }
        })
    }
//文章精选列表 - '/information/'
    function getGoodArticle(size = 10) {
        let moreBtn = $(".loadMoreBtn_Speaker"),
            pageEl = $('.loadMorePageNo_Speaker'),
            pageNo = +pageEl.val();
        getResponse({
            url: '/interpreterArticle/interpreterArticleListSelect',
            data: {
                pageNo: pageNo,
                pageSize: size
            }
        }).then(res => {
            if(res.message ==='success'){
                let bodyStr = '', listArr = [];
                res.data.content.forEach(item => {
                    //为精选时，添加class：well
                    listArr.push(`<div class="item ${item.isFeatured?'well':''}">
                                   <div class="img"><img src="${item.coverId}" alt=""></div>
                                   <div class="absolute">${item.lable}</div>
                                   <div class="item-cnt">
                                       <a href="/information/detail?aid=${item.id}&uid=${item.publishUserId}">
                                           <h5>${item.articleTitle}</h5>
                                       </a>
                                       <p>${item.partContent}</p>
                                       <div class="am-g">
                                           <div class="am-u-sm-2">
                                               <a href="/article?uid=${item.publishUserId}"><img src="/static/image/index-default-head.png" alt="">${item.publishUser}</a>
                                           </div>
                                           <div class="am-u-sm-8">${item.publishTime?item.publishTime:''}</div>
                                           <div class="am-u-sm-1">
                                               <i class="sy-icon icon-eye"></i>${item.viewCount}
                                           </div>
                                           <div class="am-u-sm-1">
                                               <i class="sy-icon icon-thumbs"></i>${item.likeNumber}
                                           </div>
                                           <div class="am-u-sm-1">
                                               <i class="sy-icon icon-commenting"></i>${item.commentsNumber}
                                           </div>
                                       </div>
                                   </div>
                               </div>`);
                });
                pageNo += 1;
                pageEl.val(pageNo);
                if(res.data.content.length > 0){
                    bodyStr = listArr.join('');
                    moreBtn.removeClass('sy-hidden');
                } else if(res.data.totalElements === 0){
                    bodyStr = `<p class="empty">暂无文章</p>`;
                    moreBtn.addClass('sy-hidden');
                }
                if(res.data.totalPages === pageNo){
                    moreBtn.addClass('sy-hidden');
                }
                $('div.goodArticleCnt>.more').before(bodyStr);
            }
            moreBtn.removeAttr('disabled').html('加载更多');
        });
    }
//行业资讯列表 - '/information/industry'
    function getIndustryArticle(size = 10){
        let moreBtn = $(".loadMoreBtn_Industry"),
            pageEl = $('.loadMorePageNo_Industry'),
            pageNo = +pageEl.val();
        getResponse({
            url: '/officialArticle/listOfficialArticle',
            data: {
                pageNo: pageNo,
                pageSize: size
            }
        }).then(res => {
            if(res.message ==='success'){
                let bodyStr = '', listArr = [];
                res.data.content.forEach(item => {
                    listArr.push(`<div class="item">
                                <div class="img"><img src="${item.coverId}" alt=""></div>
                                <div class="item-cnt">
                                    <a href="/information/industryDetail?aid=${item.id}&ofi=true">
                                        <h5>${item.articleTitle}</h5>
                                    </a>
                                    <p>${item.partContent}</p>
                                    <div class="am-g">
                                        <div class="am-u-sm-6" style="width: 70%">${item.publishTime?item.publishTime:''}</div>
                                        <div class="am-u-sm-2 sy-center" style="width: 10%">
                                            <i class="sy-icon icon-eye"></i>${item.viewCount}
                                        </div>
                                        <div class="am-u-sm-2 sy-center" style="width: 10%">
                                            <i class="sy-icon icon-thumbs"></i>${item.likeCount}
                                        </div>
                                        <div class="am-u-sm-2 sy-center" style="width: 10%">
                                            <i class="sy-icon icon-commenting"></i>${item.commentsCount}
                                        </div>
                                    </div>
                                </div>
                             </div>`);
                });
                pageNo += 1;
                pageEl.val(pageNo);
                if(res.data.content.length > 0){
                    bodyStr = listArr.join('');
                    moreBtn.removeClass('sy-hidden');
                }else if(res.data.totalElements === 0){
                    bodyStr = `<p class="empty">暂无文章</p>`;
                    moreBtn.addClass('sy-hidden');
                }
                if(res.data.totalPages === pageNo){
                    moreBtn.addClass('sy-hidden');
                }
                $('div.goodArticleCnt>.more').before(bodyStr);
            }
            moreBtn.removeAttr('disabled').html('加载更多');
        })
    }

/*
*  ------------------------ 分割线
* 文章管理（本人可见）
*
* */
//“发表/编辑”文章标题限制长度50个字符
    let titlePut = document.getElementsByClassName('controlArticleTitleLength')[0];
    titlePut && titlePut.addEventListener('input', throttleFn(function () {
        let _this = this;
        let val = _this.value,
            len = val.length;
        let nextEl = _this.nextElementSibling;
        if(len >= 50){
            $.warning('标题长度超过限制');
            _this.value = val.slice(0,50);
            nextEl.innerHTML =  _this.value.length + '/50';
            return null;
        }
        nextEl.innerHTML =  len + '/50';
    }, 500), false);
//“发布/编辑”文章预览文章
    function previewArticle() {
        const title = document.getElementsByClassName('createArticle_Title')[0],
            label = document.getElementsByClassName('createArticle_Label')[0],
            coverUrl = document.getElementsByClassName('createArticle_CoverUrl')[0],
            editor = document.getElementsByClassName('w-e-text')[0];
        const elArr = [title, label, coverUrl, editor];
        for(let i = 0, len = elArr.length; i < len; i++){
            const el = elArr[i];
            let content = el.className === "w-e-text" ? (el.innerText || el.textContent) : el.value;
            if(content.trim() === ''){
                el.focus();
                $.warning('请填写相关信息');
                return null;
            }
        }
        const user = JSON.parse($("#loginUserBase").html());
        const previewData = {
            title: title.value,
            label: label.value,
            coverUrl: coverUrl.value,
            content: editor.innerHTML,
            createTime: __bundle__.formatTime(new Date()),
            author: user.nickName,
            picture: user.picture
        };
        sessionStorage.setItem('previewArticle', JSON.stringify(previewData));
        window.open("/personalArticle/preview", "_blank");
    }
//“发布/编辑”发布文章（草稿、正式发布）
    function releaseArticle(e, status = 0){
        // status 0 草稿 1 提交
        const event = e || window.event;
        const title = document.getElementsByClassName('createArticle_Title')[0],
            label = document.getElementsByClassName('createArticle_Label')[0],
            coverUrl = document.getElementsByClassName('createArticle_CoverUrl')[0],
            editor = document.getElementsByClassName('w-e-text')[0];
        const elArr = [title, label, coverUrl, editor];
        for(let i = 0, len = elArr.length; i < len; i++){
            const el = elArr[i];
            let content = el.className === "w-e-text" ? (el.innerText || el.textContent) : el.value;
            if(content.trim() === ''){
                el.focus();
                $.warning('请填写相关信息');
                return null;
            }
        }
        event.target.setAttribute('disabled', true);
        event.target.innerHTML = '<i class="am-icon-spinner am-icon-pulse"></i>';
        let partTxt = editor.innerText || editor.textContent;
        if(event.target.classList.contains('confirm')){
            status = 1;
        }
        let type = 'post',
            url = '/interpreterArticle/addInterpreterArticle';
        const data = {
            articleTitle: title.value,
            label: label.value,
            coverId: coverUrl.value,
            content: editor.innerHTML.replace(/</g, '&lt;').replace(/>/g,'&gt;'),
            partContent: partTxt.slice(0, 100),
            status: status
        };
        const articleId = getQueryString('aid');
        //编辑文章，重置参数
        if(articleId){
            type = 'put';
            url = '/interpreterArticle/editInterpreterArticle';
            Object.assign(data, {
                articleId: articleId
            });
        }
        const token = localStorage.getItem('sy_rm_client_access_token'),
            userId = localStorage.getItem('sy_rm_client_ud');
        getResponse({
            type: type,
            url: url,
            data: data
        }).then(res => {
            if(res.message === 'success'){
                $.success('发布成功');
                setTimeout(function () {
                   location.href = '/personalArticle/list?t='+token+'&u='+userId;
                },1000);
            }
            event.target.removeAttribute('disabled');
            event.target.innerHTML = event.target.classList.contains('confirm')?'提交审核':'保存草稿';
        })
    }
//文章列表（已发布/草稿/待审核）
    function userListArticle (status = '', pagesize = 10){
        let moreBtn = $(".article_LoadMoreBtn"),
            pageEl = $('.article_PageNo'),
            pageNo = +pageEl.val();
        getResponse({
            url: '/interpreterArticle/interpreterArticleList',
            data: {
                pageNo: pageNo,
                pageSize: pagesize,
                status: status
            }
        }).then(res => {
            const token = localStorage.getItem('sy_rm_client_access_token');
            if(res.message === 'success'){
                let bodyStr = "", listArr = [];
                res.data.content.forEach(item => {
                    let statusStr = "", statusLabel = item.lable;
                    if(item.status === 0){
                        statusLabel = '草稿';
                        statusStr = `<div class="am-u-sm-8 tip"></div>`;
                    }else if(item.status === 1){
                        statusLabel = '待审核';
                        statusStr = `<div class="am-u-sm-8 tip">文章正在审核中，请耐心等待</div>`;
                    }else if(item.status === 2){
                        statusLabel = '审核未通过';
                        statusStr = `<div class="am-u-sm-8 tip">很抱歉，文章不能正常发布，请点击正文查看详情</div>`;
                    }else{
                        statusStr = `<div class="am-u-sm-1"><i class="sy-icon icon-eye"></i>${item.viewCount}</div>
                                     <div class="am-u-sm-1"><i class="sy-icon icon-thumbs"></i>${item.likeNumber}</div>
                                     <div class="am-u-sm-1"><i class="sy-icon icon-commenting"></i>${item.commentsNumber}</div>`;
                    }
                    let listStr = `<div class="item">
                                    <div class="img"><img src="${item.coverId}" alt=""></div>
                                    <div class="absolute">${statusLabel}</div>
                                    <div class="item-cnt">
                                        <a href="/personalArticle/detail?t=${token}&aid=${item.id}">
                                            <h5>${item.articleTitle}</h5>
                                        </a>
                                        <!-- 该出文字长度用js做限制 -->
                                        <p>${item.partContent}</p>
                                        <div class="am-g">
                                            ${statusStr}
                                            <div class="am-u-sm-4">${item.publishTime?item.publishTime:''}</div>
                                        </div>
                                    </div>
                                </div>`;
                    listArr.push(listStr);
                });
                pageNo += 1;
                pageEl.val(pageNo);
                if(res.data.content.length > 0){
                    bodyStr = listArr.join('');
                    moreBtn.removeClass('sy-hidden');
                }else if(res.data.totalElements === 0){
                    bodyStr = `<p class="empty">暂无文章</p>`;
                    moreBtn.addClass('sy-hidden');
                }
                if(res.data.totalPages === pageNo){
                    moreBtn.addClass('sy-hidden');
                }
                $('.personalArticleList').append(bodyStr);
            }
            moreBtn.removeAttr('disabled').html('加载更多');
        });
    }

/*
*  ------------------------ 分割线
* 文章管理（非本人可见）
*
* */
//文章列表
    function userNotListArticle (status = 3, pagesize = 10){
        let moreBtn = $(".loadMoreBtn_Not"),
            pageEl = $('.pageNo_Not'),
            pageNo = +pageEl.val();
        getResponse({
            url: '/interpreterArticle/interpreterArticleListSelect',
            data: {
                userId: getQueryString('uid'),
                pageNo: pageNo,
                pageSize: pagesize
            }
        }).then(res => {
            if(res.message === 'success'){
                let bodyStr = "", listArr = [];
                res.data.content.forEach(item => {
                    listArr.push(`<div class="item">
                                    <div class="img"><img src="${item.coverId}" alt=""></div>
                                    <div class="absolute">${item.lable}</div>
                                    <div class="item-cnt">
                                        <a href="/article/detail?uid=${item.publishUserId}&aid=${item.id}">
                                            <h5>${item.articleTitle}</h5>
                                        </a>
                                        <p>${item.partContent}</p>
                                        <div class="am-g">
                                            <div class="am-u-sm-1">
                                                <i class="sy-icon icon-eye"></i>${item.viewCount}
                                            </div>
                                            <div class="am-u-sm-1">
                                                <i class="sy-icon icon-thumbs"></i>${item.likeNumber}
                                            </div>
                                            <div class="am-u-sm-1">
                                                <i class="sy-icon icon-commenting"></i>${item.commentsNumber}
                                            </div>
                                            <div class="am-u-sm-4">${item.publishTime?item.publishTime:'--'}</div>
                                        </div>
                                    </div>
                                  </div>`);
                });
                pageNo += 1;
                pageEl.val(pageNo);
                if(res.data.content.length > 0) {
                    bodyStr = listArr.join('');
                    moreBtn.removeClass('sy-hidden');
                }else if(res.data.totalElements === 0){
                    bodyStr = `<p class="empty">暂无文章</p>`;
                    moreBtn.addClass('sy-hidden');
                }
                if(res.data.totalPages === pageNo){
                    moreBtn.addClass('sy-hidden');
                }
                $('.notUserArticleCnt').append(bodyStr);
            }
            moreBtn.removeAttr('disabled').html('加载更多');
        });
    }

/*
*   ------------------------ 分割线
*
* */
    return {
        previewArticle,
        releaseArticle,
        userListArticle,
        getIndexGoodArticle,
        getGoodArticle,
        getIndustryArticle,
        userNotListArticle,
        getCommentsList,
    }
}(window, document, jQuery));

export default articleServer;