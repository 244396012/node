/**
 *
 * Pagination plugin
 *
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            (global.ChPaging = factory());
}(this, (function () {
    'use strict';
    //默认参数
    var defaults = {
        first : false,//是否开启首页
        last : false,//是否开启末页
        viewNumber : true, //是否启用每页多少条的选择功能
        current : 1,//当前页
        viewOpt : [10,20,50,100],//可供每页显示条数选择
        limit : 10,//默认每页条数
        jump : true, //是否显示页面跳转功能
        viewCountPage : false,//是否显示共多少页
        viewCountNumber : true,//是否显示共多少条
        classPrefix : 'Ch',
        txtConfig : {
            first : '首页',
            last : '尾页',
            next : '»',
            prev : '«',
            jumpTxt : '跳到{n}页',
            countPage : "共{n}页",
            countNumber : '共{n}条',
            viewNumber : '{n}'
        }
    };
    var htmlReload = {
        //html初始化
        init : function(myThis){
            // this.o = $.extend(true,{},myThis.o);
            var _o = myThis.o;
            var html = '';
            if(_o.viewCountNumber){
                html += '<span id="ChPagingCountNumber" class="'+_o.classPrefix+'_paging_count_number"></span>'
            }
            if(_o.first){
                html += '<a href="javascript:;" id="ChPagingFirst" class="'+_o.classPrefix+'_paging_first">'+_o.txtConfig.first+'</a>';
            }
            html += '<a href="javascript:;" id="ChPagingPrev" class="'+_o.classPrefix+'_paging_prev">'+_o.txtConfig.prev+'</a><span  id="ChPagingBtns" class="'+_o.classPrefix+'_paging_btn"></span><a href="javascript:;" id="ChPagingNext" class="'+_o.classPrefix+'_paging_next">'+_o.txtConfig.next+'</a>';
            if(_o.last){
                html += '<a href="javascript:;" id="ChPagingLast" class="'+_o.classPrefix+'_paging_last">'+_o.txtConfig.last+'</a>';
            }
            if(_o.viewNumber){
                var opts = "";
                for(var i = 0, ed = _o.limit, edStr='', len = _o.viewOpt.length,me; i < len; i++){
                    me = _o.viewOpt[i];
                    if(me === ed){
                        edStr = 'selected'
                    }else{
                        edStr = '';
                    }
                    opts += '<option value="'+ me +'"'+ edStr +'>' + me + '条/页</option>';
                }
                html += '<span class="'+_o.classPrefix+'_paging_view_number"><select id="ChPagingViewNum">' + opts + '</select></span>';
            }
            if(_o.jump){
                html += '<span class="'+_o.classPrefix+'_paging_jump"><label>'+_o.txtConfig.jumpTxt.replace(/^(.+)\{n\}(.+)$/,"$1")+'</label> <input type="number" id="ChPagingJumpNum"/> <label>'+_o.txtConfig.jumpTxt.replace(/^(.+)\{n\}(.+)$/,"$2")+'</label></span>';
            }
            if(_o.viewCountPage){
                html += '<span id="ChPagingCount" class="'+_o.classPrefix+'_paging_count_page"></span>'
            }

            myThis.$target.html(html);
            myThis.$pages = myThis.$target.find("#ChPagingBtns");
            // myThis.reloadPages();
        },
        //重新计算并渲染页标
        reloadPages : function (options,$pages,$target) {
            var str = '',choose = '',i,len,indexLen,pageCount = options.pageCount,current = options.current;
            $target.find("#ChPagingCount").html(options.txtConfig.countPage.replace(/^(.+)\{n\}(.+)$/,"$1") + pageCount + options.txtConfig.countPage.replace(/^(.+)\{n\}(.+)$/,"$2"));
            $target.find("#ChPagingCountNumber").html(options.txtConfig.countNumber.replace(/^(.+)\{n\}(.+)$/,"$1") + options.count + options.txtConfig.countNumber.replace(/^(.+)\{n\}(.+)$/,"$2"));

            if(pageCount > 10){
                indexLen = 8;
            }else{
                indexLen = 10;
            }

            if(current >= 9){
                i = current - 7;
                if(current == pageCount ){
                    i = current - 9;
                    indexLen = 10
                }else if(current == (pageCount-1) ){
                    i = current - 8;
                    indexLen = 9;
                }
            }else{
                i = 1;
            }
            len = i + indexLen;
            if(pageCount < 10){
                len = pageCount + 1;
            }

            for(; i < len; i++){
                if(i == current){
                    choose = "class='"+options.classPrefix+"_Paging_choose'"
                }else{
                    choose = '';
                }
                str += '<a href="javascript:;" name="' + i + '" ' + choose + '>' + i + '</a>';
            }
            if(pageCount > 10 && current != pageCount-1 && current != pageCount){
                str += '<a href="javascript:;" class="'+options.classPrefix+'_Paging_more" name="more" index="'+ i +'">...</a>';
            }
            if(pageCount > 10 && current != pageCount){
                str += '<a href="javascript:;" name="' + pageCount + '">' + pageCount + '</a>';
            }
            $pages.html(str);
        }
    };
    //
    var operation = {
        //初始化
        init : function(myThis,restart){
            // this.o = $.extend(true,{},myThis.o);
            var _o = myThis.o;

            myThis.static.start = (_o.current * _o.limit) - _o.limit + 1;
            var msg = {
                event : "reload"
                ,type : "reload"
            };
            msg.start = myThis.static.start;
            msg.end = myThis.static.end;
            if(_o.count){
                msg.count = _o.count;
            }
            if(_o.current){
                msg.current = _o.current;
            }
            if(_o.limit){
                msg.limit = _o.limit;
            }
            if(_o.xhr){//动态分页
                this.xhrReload(myThis,msg);
            }else{//静态数据
                _o.count = _o.data.length;
                // myThis.static.start = 1;
                myThis.static.end = _o.limit;

                htmlReload.init(myThis);
                this.reloadListCbk(myThis,msg);
            }
            // this.ready(myThis);
            if(!restart){
                //事件绑定
                this.eventBind(myThis);
            }
        }
        //准备开始
        ,operationReady : function (myThis,m) {
            var _o = myThis.o
                ,msg = m || {
                event : "default"
                ,type : "default"
            };
            //计算并保存当前开始值和结束值
            myThis.static.end = _o.current * _o.limit;
            myThis.static.end = (_o.count) ? (myThis.static.end <= _o.count) ? myThis.static.end : _o.count : _o.limit;
            myThis.static.start = myThis.static.end - _o.limit + 1;

            msg.start = myThis.static.start;
            msg.end = myThis.static.end;
            if(_o.count){
                msg.count = _o.count;
            }
            if(_o.current){
                msg.current = _o.current;
            }
            if(_o.limit){
                msg.limit = _o.limit;
            }

            if(_o.operationReady){
                _o.operationReady(msg);
            }
            // if(m){//操作分页
            if(_o.xhr){
                this.xhrReload(myThis,msg);
            }else{
                this.reloadListCbk(myThis,msg);
            }
            // }
        }
        //发送ajax请求
        ,xhrReload : function (myThis,msg) {
            var _this = this,_o = myThis.o;
            $.ajax(_o.xhr).then(function (res) {
                var dataObj = _o.xhrSuccess(res);//格式化数据 data,count
                _o.data = dataObj.data;
                _o.count = dataObj.count;

                if(msg.event == "reload"){//判断如果是初始化则执行初始渲染
                    htmlReload.init(myThis);
                }
                _this.reloadListCbk(myThis,msg)
            });
        }
        //关联列表渲染
        ,reloadListCbk : function (myThis,m) {
            var _o = myThis.o
                ,data;
            this.reloadPages(myThis);
            //如果走的静态数据则取出前页需要展示的数据
            if(!_o.xhr){
                data = [];
                for(var i = myThis.static.start-1; i < myThis.static.end; i++){
                    data.push(_o.data[i]);
                }

            }else{
                data = _o.data;
            }
            if(_o.operationCallback){
                _o.operationCallback(m,data);
            }
            //调用具体渲染当前页的回调函数
            // if(_o.operFinsh){
            //     _o.operFinsh(data);
            // }
        },
        //重新计算多少页
        reloadPages : function(myThis){
            var _o = myThis.o;
            _o.pageCount = Math.ceil(_o.count / _o.limit);
            if(_o.current > _o.pageCount){
                _o.current = _o.pageCount;
            }
            htmlReload.reloadPages(_o,myThis.$pages,myThis.$target);
        }
        //事件绑定
        ,eventBind : function(myThis){
            var $myThis = $(myThis)
                ,_this = this
                ,_o = myThis.o
                ,eventFn = function(e,msg){
                _this.operationReady(myThis,msg)
            }
                ,msg = {};
            $myThis.on("jump",eventFn).on("viewNum",eventFn);

            if(_o.viewNumber){
                myThis.$target.on("change","#ChPagingViewNum",function(){//显示多少条
                    var $this = $(this),
                        val = $this.val();
                    _o.current = 1;
                    _o.limit = val;
                    msg ={
                        event : "viewNum"
                        ,type : "option"
                    };

                    $myThis.trigger("viewNum",[msg]);
                });
            }
            if(_o.jump){
                myThis.$target.on("keydown","#ChPagingJumpNum",function(e){//输入页值跳转
                    if(e.keyCode === 13){
                        var val = $("#ChPagingJumpNum").val();
                        _o.current = val || _o.current;
                        msg ={
                            event : "jump"
                            ,type : "target"
                        };
                        $myThis.trigger("jump",[msg]);
                    }

                });
            }
            myThis.$target.on("click","#ChPagingBtns a",function(){//点击页值跳转
                var $this = $(this),
                    val = $this.attr("name");
                if(val === "more"){
                    var index = $this.attr("index");
                    _o.current = index;
                    msg ={
                        event : "jump"
                        ,type : "more"
                    };
                    $myThis.trigger("jump",[msg]);
                }else{
                    _o.current = val;
                    msg ={
                        event : "jump"
                        ,type : "target"
                    };
                    $myThis.trigger("jump",[msg]);
                }
            }).on("click","#ChPagingFirst",function () {//首页
                if(_o.current == 1){
                    return false;
                }
                _o.current = 1;
                msg ={
                    event : "jump"
                    ,type : "first"
                };
                $myThis.trigger("jump",[msg]);
            }).on("click","#ChPagingLast",function () {//末页
                if(_o.current == _o.pageCount){
                    return false;
                }
                _o.current = _o.pageCount;
                msg ={
                    event : "jump"
                    ,type : "last"
                };
                $myThis.trigger("jump",[msg]);
            }).on("click","#ChPagingNext",function () {//下一页
                if(_o.current == _o.pageCount){
                    return false;
                }
                _o.current++;
                msg ={
                    event : "jump"
                    ,type : "next"
                };
                $myThis.trigger("jump",[msg]);

            }).on("click","#ChPagingPrev",function () {//上一页
                if(_o.current == 1){
                    return false;
                }
                _o.current--;
                msg ={
                    event : "jump"
                    ,type : "prev"
                };
                $myThis.trigger("jump",[msg]);
            });
        }
    };

    var ChPaging = function(target,options){
        this.$target = $(target);
        this.o = $.extend(true,{},defaults,options);
        this.static = {};
        operation.init(this);
    };
    ChPaging.prototype = {
        //参数设置接口
        set : function(options,restart){
            $.extend(true,this.o,options);
            if(restart){
                operation.init(this,restart);
            }
        },
        //获取参数
        get : function (str) {
            return this.o[str] || this.static[str];
        }
    };
    return ChPaging;
})));