!function(e){var a={};function t(s){if(a[s])return a[s].exports;var n=a[s]={i:s,l:!1,exports:{}};return e[s].call(n.exports,n,n.exports,t),n.l=!0,n.exports}t.m=e,t.c=a,t.d=function(e,a,s){t.o(e,a)||Object.defineProperty(e,a,{configurable:!1,enumerable:!0,get:s})},t.r=function(e){Object.defineProperty(e,"__esModule",{value:!0})},t.n=function(e){var a=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(a,"a",a),a},t.o=function(e,a){return Object.prototype.hasOwnProperty.call(e,a)},t.p="",t(t.s=3)}([function(e,a,t){"use strict";Object.defineProperty(a,"__esModule",{value:!0});localStorage.getItem("yyq_zss_client_access_token");$.ajaxSetup({headers:{},error:function(e){401===e.status&&$.fail("登录信息已过期，重新登录")}});var s="http://",n="192.168.0.199",c="5790";a.dict=s+n+":"+c+"/dictionary"},function(e,a,t){"use strict";Object.defineProperty(a,"__esModule",{value:!0});var s,n=t(0),c=(s=n.dict,{getDictBg:function(){$.ajax({type:"GET",url:s+"/dic/detail",dataType:"json",data:{id:__tool__.queryParam("id")},success:function(e){if("success"===e.message){var a=e.data;$(".dict-bg").css("background-image","url(data:image/png;base64,"+a.base64Img+")")}}})},getHotWord:function(){$.ajax({type:"GET",url:s+"/hotWord/listWords",dataType:"json",data:{dictName:__tool__.queryParam("wd")},success:function(e){"success"===e.message&&e.data.forEach(function(e){var a=$('<a class="item" href="#">\n                                            '+e.keyWord+"\n                                        </a>").click(function(a){a.preventDefault();var t=$("select[data-am-selected]").val(),s=encodeURIComponent(e.keyWord),n=encodeURIComponent(dictTitle.zh),c=encodeURIComponent(dictTitle.en),o=__tool__.queryParam("id");location.href="/dict/search?wd="+s+"&lan="+t+"&dictZh="+n+"&dictEn="+c+"&id="+o});$(".hot-list").append(a)})}})},searchTb:function(e){return(e=e||{}).searchDictName=e.searchDictName||"",new Promise(function(a,t){$.ajax({type:"POST",url:s+"/search/searchTerm",dataType:"json",data:{word:e.word,searchDictName:e.searchDictName,sourceCode:e.sourceCode,targetCode:e.targetCode,domain:"",subDomain:"",pageSize:20},success:function(e){var t="",s="",n=[],c=[];if("success"===e.message){var o=e.data,r="sourceDesc"===o.showDesc?"target":"source";o.resultList.forEach(function(e){t+=e[r]+" -【"+e.subDomain+"】 ",s+="<li>\n                                        <span>"+e[r]+" - 【"+e.subDomain+"】</span>\n                                        <p>"+e[o.showDesc]+"</p>\n                                    </li>",n.includes(e[r])||(n.push(e[r]),c.push(e))}),c.unshift({searchKey:o.searchKey,showDesc:o.showDesc}),$(".termCnt>span").html(t||"--"),$(".item-trans").html(s),0===o.resultList.length?a([]):a(c)}else $("div#noResult").removeClass("hide"),$("div[data-hidden]").addClass("hide")}})})},searchBaidu:function(e,a){$.ajax({type:"GET",url:s+"/search/baike_spider",dataType:"json",data:{word:e},success:function(e){var t="";if("success"===e.message){var s=e.data;if(a[0].showDesc){for(var n="sourceDesc"===a[0].showDesc?"target":"source",c=1;c<a.length;c++){var o=a[c];t+="<li>\n                                        <span>"+o[n]+"</span>\n                                        <p>"+s+'</p>\n                                        <div>\n                                            以上内容来自：【百度百科】\n                                            <a href="https://baike.baidu.com/item/'+encodeURIComponent(o[n])+'" target="_blank" rel="nofollow">更多 >></a>\n                                        </div>\n                                    </li>'}$(".item-baike").html(t)}}}})},searchWeiji:function(e,a){$.ajax({type:"GET",url:s+"/search/weijibaike_spider",dataType:"json",data:{word:e},success:function(e){var t="";if("success"===e.message){var s=e.data;if(a[0].showDesc){for(var n="sourceDesc"===a[0].showDesc?"target":"source",c=1;c<a.length;c++){var o=a[c];t+="<li>\n                                        <span>"+o[n]+"</span>\n                                        <p>"+s+'</p>\n                                        <div>\n                                            以上内容来自：【维基百科】\n                                            <a href="https://en.wikipedia.org/wiki/'+encodeURIComponent(o[n])+'" target="_blank" rel="nofollow">更多 >></a>\n                                        </div>\n                                    </li>'}$(".item-baike").html(t)}}}})},searchAbout:function(e){(e=e||{}).searchDictName=e.searchDictName||"",$.ajax({type:"POST",url:s+"/search/relativeSearch",dataType:"json",data:{word:e.word,searchDictName:e.searchDictName,sourceCode:e.sourceCode,targetCode:e.targetCode,domain:"",subDomain:"",page:1,pageSize:99},success:function(e){var a="";if("success"===e.message){var t=e.data,s="sourceDesc"===t.showDesc?"source":"target",n="sourceDesc"===t.showDesc?"target":"source";t.resultList.forEach(function(e){a+='<tr data-tips="'+e[t.showDesc]+'">\n                                    <td>'+e[s]+"</td>    \n                                    <td>"+e[n]+"</td>    \n                                    <td>"+(e.subDomain?e.subDomain:e.domain)+"</td>    \n                                </tr>"}),$("#termBox>tbody").html(a),$("#termTotal").html("共"+(t.totalNum?t.totalNum:0)+"条相关"),$(".scroller").css("height",t.totalNum<=0?"50px":41*t.totalNum+2+"px")}}})}});a.default=c},function(e,a,t){"use strict";Object.defineProperty(a,"__esModule",{value:!0});var s,n=t(0),c=(s=n.dict,void $.ajax({type:"GET",url:s+"/language/listLanguagePair",dataType:"json",success:function(e){var a="";"success"===e.message&&(e.data.forEach(function(e){e.languagePairs.forEach(function(t){a+='    \n                                <option value="'+e.englishName+","+t.englishName+'">'+e.chineseSimpleName+" "+t.chineseSimpleName+"</option>\n                                    "})}),$("select[data-am-selected]").html(a))}}));a.default=c},function(e,a,t){"use strict";var s=t(0),n=(c(t(2)),c(t(1)));function c(e){return e&&e.__esModule?e:{default:e}}window.__searchDict__=n.default,window.__api__={dict:s.dict}}]);