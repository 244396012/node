/*
*
* 作用：术语搜索
* 日期：2019-03-08
* author：zy
*
* */
import { dict } from './api'
const search = (function () {

    const domain = dict;

    //获取词典背景图
    const getDictBg = function () {

        $.ajax({
            type: 'GET',
            url: domain + '/dic/detail',
            dataType: 'json',
            data: {
                id: __tool__.queryParam('id')
            },
            success: function (res) {
                if(res.message === 'success'){
                    const { data } = res;
                    $('.dict-bg').css('background-image','url(data:image/png;base64,'+ data.base64Img +')');
                }
            }
        })
    };

    //获取热搜词
    const getHotWord = function () {
        $.ajax({
            type: 'GET',
            url: domain + '/hotWord/listWords',
            dataType: 'json',
            data: {
                dictName: __tool__.queryParam('wd')
            },
            success: function (res) {
                if(res.message === 'success'){
                    let { data } = res;
                    data.forEach(item => {
                        let itemStr = $(`<a class="item" href="#">
                                            ${item.keyWord}
                                        </a>`)
                            .click(function (e) {
                                e.preventDefault();
                                const config = {
                                    lan: $('select[data-am-selected]').val(),
                                    wd: encodeURIComponent(item.keyWord),
                                    zh: encodeURIComponent(dictTitle.zh),
                                    en: encodeURIComponent(dictTitle.en),
                                    id: __tool__.queryParam('id')
                                };
                                location.href = `/dict/search?wd=${config.wd}&lan=${config.lan}&dictZh=${config.zh}&dictEn=${config.en}&id=${config.id}`
                            });
                        $('.hot-list').append(itemStr);
                    });
                }
            }
        })
    };
    //搜索术语
    const searchTb = function (config) {
        config = config || {};
        config.searchDictName = config.searchDictName || '';
        return new Promise((resolve, reject) => {
            $.ajax({
                type: 'POST',
                url: domain + '/search/searchTerm',
                dataType: 'json',
                data: {
                    word: config.word,
                    searchDictName: config.searchDictName,
                    sourceCode: config.sourceCode,
                    targetCode: config.targetCode,
                    domain: '',
                    subDomain: '',
                    pageSize: 20
                },
                success: function (res) {
                    let ywStr = '',
                        syStr = '';
                    const filterArr = [],
                        filterArrBaike = [];
                    if(res.message === 'success'){
                        let { data } = res;
                        let source = data.showDesc === 'sourceDesc' ? 'target':'source';
                        data.resultList.forEach((item) => {
                            ywStr += `${item[source]} -【${item.subDomain}】 `;
                            syStr += `<li>
                                        <span>${item[source]} - 【${item.subDomain}】</span>
                                        <p>${item[data.showDesc]}</p>
                                    </li>`;
                            if(!filterArr.includes(item[source])){
                                filterArr.push(item[source]);
                                filterArrBaike.push(item);
                            }
                        });
                        filterArrBaike.unshift({
                            searchKey: data.searchKey,
                            showDesc: data.showDesc
                        });
                        $('.termCnt>span').html(ywStr?ywStr:'--');
                        $('.item-trans').html(syStr);
                        data.resultList.length === 0
                            ? resolve([])
                            : resolve(filterArrBaike);
                    }else{
                        $('div#noResult').removeClass('hide');
                        $('div[data-hidden]').addClass('hide');
                    }
                }
            })
        });
    };
    //百度百科
    const searchBaidu = function (word, result) {
        $.ajax({
            type: 'GET',
            url: domain + '/search/baike_spider',
            dataType: 'json',
            data: {
                word: word
            },
            success: function (res) {
                let itemStr = '';
                if(res.message === 'success'){
                    let { data } = res;
                    if(result[0].showDesc){
                        let mySource = result[0].showDesc === 'sourceDesc' ? 'target' : 'source';
                        for(let i = 1; i < result.length; i++){
                            const item = result[i];
                            itemStr += `<li>
                                        <span>${item[mySource]}</span>
                                        <p>${ data }</p>
                                        <div>
                                            以上内容来自：【百度百科】
                                            <a href="https://baike.baidu.com/item/${encodeURIComponent(item[mySource])}" target="_blank" rel="nofollow">更多 >></a>
                                        </div>
                                    </li>`
                        }
                        $('.item-baike').html(itemStr);
                    }
                }
            }
        })
    };
    //维基百科
    const searchWeiji = function (word, result) {
        $.ajax({
            type: 'GET',
            url: domain + '/search/weijibaike_spider',
            dataType: 'json',
            data: {
                word: word
            },
            success: function (res) {
                let itemStr = '';
                if(res.message === 'success'){
                    let { data } = res;
                    if(result[0].showDesc){
                        let mySource = result[0].showDesc === 'sourceDesc' ? 'target':'source';
                        for(let i = 1; i < result.length; i++){
                            const item = result[i];
                            itemStr += `<li>
                                        <span>${item[mySource]}</span>
                                        <p>${ data }</p>
                                        <div>
                                            以上内容来自：【维基百科】
                                            <a href="https://en.wikipedia.org/wiki/${encodeURIComponent(item[mySource])}" target="_blank" rel="nofollow">更多 >></a>
                                        </div>
                                    </li>`
                        }
                        $('.item-baike').html(itemStr);
                    }
                }
            }
        })
    };
    //相关术语
    const searchAbout = function (config) {
        config = config || {};
        config.searchDictName = config.searchDictName || '';
        $.ajax({
            type: 'POST',
            url: domain+ '/search/relativeSearch',
            dataType: 'json',
            data: {
                word: config.word,
                searchDictName: config.searchDictName,
                sourceCode: config.sourceCode,
                targetCode: config.targetCode,
                domain: '',
                subDomain: '',
                page: 1,
                pageSize: 99
            },
            success: function (res) {
                let trStr = '';
                if(res.message === 'success'){
                    let { data } = res;
                    let source = data.showDesc === 'sourceDesc' ? 'source':'target',
                        target = data.showDesc === 'sourceDesc' ? 'target':'source';
                    data.resultList.forEach(item => {
                        trStr += `<tr data-tips="${item[data.showDesc]}">
                                    <td>${item[source]}</td>    
                                    <td>${item[target]}</td>    
                                    <td>${item.subDomain ? item.subDomain : item.domain}</td>    
                                </tr>`
                    });
                    $('#termBox>tbody').html(trStr);
                    $('#termTotal').html(`共${ data.totalNum ? data.totalNum : 0 }条相关`);
                    $('.scroller').css('height',data.totalNum <= 0 ? '50px': data.totalNum*41+2+'px');
                }
            }
        })
    };


    return {
        getDictBg,
        getHotWord,
        searchTb,
        searchBaidu,
        searchWeiji,
        searchAbout
    }

})();

export default search;
