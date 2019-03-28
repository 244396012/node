/*
*
* 作用：公共模块
* 日期：2019-3-8
* author：zy
*
* */
import { dict } from "./api";
const common = (function () {
    const dictDomain = dict;
    /*
    * 获取领域
    * */
    (function () {
        $.ajax({
            type: 'GET',
            url: dictDomain + '/language/listLanguagePair',
            dataType: 'json',
            success: function (res) {
                let itemStr = '';
                if(res.message === 'success'){
                    const data = res.data;
                    data.forEach(item => {
                        item.languagePairs.forEach(item1 => {
                            itemStr += `    
                                <option value="${item.englishName+','+item1.englishName}">${item.chineseSimpleName+' '+item1.chineseSimpleName}</option>
                                    `;
                        });
                    })
                    $("select[data-am-selected]").html(itemStr);
                }
            }
        })
    })();

})();

export default common;