/*
 * 弹窗、props扩展对象
 * author: zy
*/

jQuery.extend({
    success: function(txt){
        $('body').append('<div class="my-tip my-success"><i class="am-icon-check-circle"></i> '+ txt +'</div>');
        $(".my-success").stop().delay(2000).animate({ top: 20 + "%", opacity: 0 }, 500, function() {
            $(this).remove();
        })
    },
    warning: function (txt) {
        $('body').append('<div class="my-tip my-warn"><i class="am-icon-exclamation-circle"></i> '+ txt +'</div>');
        $(".my-warn").stop().delay(2000).animate({ top: 20 + "%", opacity: 0 }, 500, function() {
            $(this).remove();
        })
    },
    error: function(txt){
        $('body').append('<div class="my-tip my-error"><i class="am-icon-times-circle"></i> '+ txt +'</div>');
        $(".my-error").stop().delay(2000).animate({ top: 20 + "%", opacity: 0 }, 500, function() {
            $(this).remove();
        })
    },
    loading: function (txt) {
        $('.my-loading').remove();
        $('body').append('<div class="my-tip my-loading"><i class="am-icon-spinner am-icon-spin"></i> ' + txt + '</div>');
    },
    enlargeImg: function (imgSrc) {
        $('.am-modal.enlargeImg').remove();
        $('body').append(`<div class="am-modal am-modal-no-btn enlargeImg" tabindex="-1">
                              <a href="javascript: void(0)" 
                                 class="am-close am-close-spin"
                                 data-am-modal-close
                                 style="position: absolute;color: #fff">&times;</a>
                              <img class="detailImg" src="${imgSrc}" alt="">
                          </div>`);
        $('.enlargeImg').modal();
    },
    /*
    * 调用方法如下：
    $.confirm();
    $('.confirmModal').modal({
        closeViaDimmer: false,
        onConfirm: function (e) { },
        onCancel: function (e) { }
    });
    * */
    confirm: function (txt) {
        const ele = `
             <div class="am-modal am-modal-confirm confirmModal">
                    <div class="am-modal-dialog" style="width: 360px;">
                        <div class="am-modal-hd">提 示
                            <a href="javascript: void(0)" class="am-close am-close-spin" data-am-modal-close>&times;</a>
                        </div>
                        <div class="am-modal-bd">${txt || '确认此操作吗？'}</div>
                        <div class="am-modal-footer" style="margin: 1rem 0 2rem">
                            <span class="am-modal-btn sy-btn sy-btn-green sy-btn-sm" data-am-modal-confirm>确 认</span>
                            <span class="am-modal-btn sy-btn sy-btn-white sy-btn-sm" data-am-modal-cancel>取 消</span>
                        </div>
                    </div>
                </div>`;
        $('.confirmModal').remove();
        $('body').append(ele);
    },
    toolinfo: function (params) {
        const ele = `
             <div class="am-modal am-modal-confirm toolinfoModal">
                    <div class="am-modal-dialog" style="width: ${params.width || '360px'};">
                        <div class="am-modal-hd">${params.title || '提示信息'}
                            <a href="javascript: void(0)" class="am-close am-close-spin" data-am-modal-close>&times;</a>
                        </div>
                        <div class="am-modal-bd" style="padding:25px;border-bottom: none;font-size: 14px;text-align: left;line-height: 28px;">${params.txt}</div>
                        <div class="am-modal-footer" style="margin: 1rem 0 2rem;">
                            ${params.href ? params.href : ''}
                            <span class="am-modal-btn sy-btn sy-btn-white sy-btn-sm" data-am-modal-close>${params.close || '我知道了'}</span>
                        </div>
                    </div>
                </div>`;
        $('.am-modal.toolinfoModal').remove();
        $('body').append(ele);
        $('.toolinfoModal').modal();
    },
    skillTest: function (params) {
        const ele = `
             <div class="am-modal am-modal-confirm testModal">
                    <div class="am-modal-dialog" style="width: 580px;">
                        <div class="am-modal-hd">${params.title || '提示信息'}
                            <a href="javascript: void(0)" class="am-close am-close-spin" data-am-modal-close>&times;</a>
                        </div>
                        <div class="am-modal-bd" style="padding:25px 40px;border-bottom: none;font-size: 14px;text-align: left;line-height: 28px;">
                            ${params.txt}
                            <label class="am-checkbox am-success" style="margin-top: 30px;">
                              <input type="checkbox" data-am-ucheck style="width: 15px;height: 15px;"
                                     onclick="this.checked 
                                            ? $('.startTestBtn').removeAttr('disabled')
                                            : $('.startTestBtn').prop('disabled','true')">
                              这是我本人的测试，同意不分享此测试内容，并接受测试结果。
                            </label>
                        </div>
                        <div class="am-modal-footer" style="margin: 1rem 0 2rem;">
                            <button type="button" 
                                    disabled
                                    class="sy-modal-href sy-btn sy-btn-green sy-btn-sm startTestBtn" 
                                    onclick="location.href='/personal/skill/${params.href}'">开始测试</button>
                        </div>
                    </div>
                </div>`;
        $('.am-modal.testModal').remove();
        $('body').append(ele);
        $('.testModal').modal();
    },
    signOn: function (config) {
        config = config || {};
        config.signList = config.signList || [];
        let lastTr = null, firstTdTxt = '';
        const str = calUtil.drawCal(new Date().getFullYear(),new Date().getMonth() + 1, config.signList);
        const ele = `
             <div class="am-modal am-modal-confirm signOnModal" data-am-modal="{closeViaDimmer: false}">
                    <div class="am-modal-dialog" style="width: 360px;">
                        <div class="am-modal-hd">签到
                            <a href="javascript: void(0)" class="am-close am-close-spin" data-am-modal-close>&times;</a>
                        </div>
                        <div class="am-modal-bd" style="padding: 0;">
                            <div class="sign-calender"></div>
                        </div>
                        <div class="am-modal-footer" style="margin: 1.5rem 0 1rem;">
                            <button type="button" class="sy-btn sy-btn-green sy-btn-sh sy-font-md signOnBtn">签 到</button>
                        </div>
                    </div>
                </div>`;
        $('.am-modal.signOnModal').remove();
        $('body').append(ele);
        $('.signOnModal').modal();
        $(".sign-calender").html(str);
        lastTr = $('.sign-calender tr').last();
        firstTdTxt = lastTr.find('td').first().text();
        firstTdTxt === ' ' && lastTr.remove();
        $(".signOnBtn").on('click', config.signOn);
    },
    /*
    * 提现页面，多种模态框
    * */
    //人民币提现 (18-60岁)
    cashOut_cny: function (config = {total: 0, type: '', typeName: ''}) {
        const el = `<div class="am-modal am-modal-confirm apply-detail cashOutModal cashOut_cny">
                        <div class="am-modal-dialog">
                            <div class="am-modal-hd">申请提现
                                <a href="javascript: void(0)" class="am-close am-close-spin" data-am-modal-close>&times;</a>
                            </div>
                            <div class="am-modal-bd" style="padding: 10px 25px">
                                <div class="sy-left draw-cash drawCash">
                                    <div class="draw-add">
                                        <div class="sy-font-md">
                                            <div>
                                                <span>选择提现方式：</span>
                                                <label class="am-radio am-success bankCheck">
                                                    <input type="radio" name="payWay" value="银行卡" data-am-ucheck> 银行卡
                                                </label>
                                                <label class="am-radio am-success alipayCheck">
                                                    <input type="radio" name="payWay" value="支付宝" data-am-ucheck> 支付宝
                                                </label>
                                            </div>
                                            <div>
                                                <span>可提现金额：</span>
                                                <input class="drawAmount" type="number" placeholder="请输入提取金额">
                                                <label class="drawAll">全部提现</label>
                                                <p class="tip"></p>
                                            </div>
                                            <div>
                                                <span>输入结算密码：</span>
                                                <input class="drawPwd" type="password" required placeholder="请输入结算密码">
                                            </div>
                                            <div class="sy-font-sm" style="padding: 0 0 10px 92px">
                                                <label class="am-checkbox am-success">
                                                  <input type="checkbox"
                                                         data-am-ucheck 
                                                         style="width: 15px;height: 15px;margin-right: 0px;vertical-align: -3px;"
                                                         onclick="this.checked 
                                                                    ? $('.cashOutBtn_cny').removeAttr('disabled')
                                                                    : $('.cashOutBtn_cny').prop('disabled','true')">
                                                  阅读并同意<a href="" class="sy-link" target="_blank">《协议》</a>，接收信息尽快签约提现。
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="am-modal-footer">
                                <span class="am-modal-btn sy-btn sy-btn-white sy-btn-sm" data-am-modal-cancel>取消申请</span>
                                <button type="button" 
                                        class="sy-modal-href sy-btn sy-btn-green sy-btn-sm confirmCashOut cashOutBtn_cny" 
                                        disabled>申请提现</button>
                            </div>
                        </div>
                    </div>`;
        $('.cashOutModal').remove();
        $('.personal.balance').append(el);
        $('.am-modal.cashOut_cny').modal({closeViaDimmer: false });
        $('.drawAmount').on('input', __bundle__.throttleFn(function() {
            __api__.getTaxRate(this, config)
        }, 1000));
        $('.drawAll').on('click', __bundle__.throttleFn(function() {
            const amountEl = document.querySelector('.drawAmount');
            amountEl.value = config.total;
            __api__.getTaxRate(amountEl, config)
        }, 500))
    },
    //人民币提现 （国籍为中国大陆的，年龄不是18~60周岁）/（国籍为非中国大陆的，提现币种为人民币首次提交结算）
    cashOutOther_cny: function (config = {total: 0, type: '', typeName: ''}) {
        const el = `<div class="am-modal am-modal-confirm apply-detail cashOutModal cashOut_cny">
                        <div class="am-modal-dialog">
                            <div class="am-modal-hd">申请提现
                                <a href="javascript: void(0)" class="am-close am-close-spin" data-am-modal-close>&times;</a>
                            </div>
                            <div class="am-modal-bd" style="padding: 10px 25px">
                                <div class="sy-left draw-cash drawCash">
                                    <div class="draw-add">
                                        <div class="sy-font-md">
                                            <div>
                                                <span>选择提现方式：</span>
                                                <label class="am-radio am-success bankCheck">
                                                    <input type="radio" name="payWay" value="银行卡" checked data-am-ucheck> 银行卡
                                                </label>
                                            </div>
                                            <div>
                                                <span>可提现金额：</span>
                                                <input class="drawAmount" type="number" placeholder="请输入提取金额">
                                                <label class="drawAll">全部提现</label>
                                                <p class="tip"></p>
                                            </div>
                                            <div>
                                                <span>输入结算密码：</span>
                                                <input class="drawPwd" type="password" required placeholder="请输入结算密码">
                                            </div>
                                            <div class="sy-font-sm" style="padding: 0 0 10px 92px">
                                                <label class="am-checkbox am-success">
                                                  <input type="checkbox"
                                                         data-am-ucheck 
                                                         style="width: 15px;height: 15px;margin-right: 0px;vertical-align: -3px;"
                                                         onclick="this.checked 
                                                                    ? $('.cashOutBtn_cny').removeAttr('disabled')
                                                                    : $('.cashOutBtn_cny').prop('disabled','true')">
                                                  阅读并同意<a href="" class="sy-link" target="_blank">《协议》</a>，接收信息尽快签约提现。
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="am-modal-footer">
                                <span class="am-modal-btn sy-btn sy-btn-white sy-btn-sm" data-am-modal-cancel>取消申请</span>
                                <button type="button" 
                                        class="sy-modal-href sy-btn sy-btn-green sy-btn-sm confirmCashOut cashOutBtn_cny" 
                                        disabled>申请提现</button>
                            </div>
                        </div>
                    </div>`;
        $('.cashOutModal').remove();
        $('.personal.balance').append(el);
        $('.am-modal.cashOut_cny').modal({closeViaDimmer: false });
        $('.drawAmount').on('input', __bundle__.throttleFn(function() {
            __api__.getTaxRate(this, config)
        }, 1000));
        $('.drawAll').on('click', __bundle__.throttleFn(function() {
            const amountEl = document.querySelector('.drawAmount');
            amountEl.value = config.total;
            __api__.getTaxRate(amountEl, config)
        }, 500))
    },
    //Paypal （提现币种为非人民币首次提交结算）
    cashOut_paypal: function (config = {total: 0, type: '', typeName: ''}) {
        const el = `<div class="am-modal am-modal-confirm apply-detail cashOutModal cashOut_cny">
                        <div class="am-modal-dialog">
                            <div class="am-modal-hd">申请提现
                                <a href="javascript: void(0)" class="am-close am-close-spin" data-am-modal-close>&times;</a>
                            </div>
                            <div class="am-modal-bd" style="padding: 10px 25px">
                                <div class="sy-left draw-cash drawCash">
                                    <div class="draw-add">
                                        <div class="sy-font-md">
                                            <div>
                                                <span>选择提现方式：</span>
                                                <label class="am-radio am-success bankCheck">
                                                    <input type="radio" name="payWay" value="Paypal" checked data-am-ucheck> Paypal
                                                </label>
                                            </div>
                                            <div>
                                                <span>可提现金额：</span>
                                                <input class="drawAmount" type="number" placeholder="请输入提取金额">
                                                <label class="drawAll">全部提现</label>
                                                <p class="tip"></p>
                                            </div>
                                            <div>
                                                <span>输入结算密码：</span>
                                                <input class="drawPwd" type="password" required placeholder="请输入结算密码">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="am-modal-footer">
                                <span class="am-modal-btn sy-btn sy-btn-white sy-btn-sm" data-am-modal-cancel>取消申请</span>
                                <button type="button" 
                                        class="sy-modal-href sy-btn sy-btn-green sy-btn-sm confirmCashOut cashOutBtn_cny">申请提现</button>
                            </div>
                        </div>
                    </div>`;
        $('.cashOutModal').remove();
        $('.personal.balance').append(el);
        $('.am-modal.cashOut_cny').modal({closeViaDimmer: false });
        $('.drawAmount').on('input', __bundle__.throttleFn(function() {
            __api__.getTaxRate(this, config)
        }, 1000));
        $('.drawAll').on('click', __bundle__.throttleFn(function() {
            const amountEl = document.querySelector('.drawAmount');
            amountEl.value = config.total;
            __api__.getTaxRate(amountEl, config)
        }, 500))
    },
    //结算方式为【非全日制】
    cashOut_fulltime: function (config = {total: 0, type: '', typeName: ''}) {
        const el = `<div class="am-modal am-modal-confirm apply-detail cashOutModal cashOut_cny">
                        <div class="am-modal-dialog">
                            <div class="am-modal-hd">申请提现
                                <a href="javascript: void(0)" class="am-close am-close-spin" data-am-modal-close>&times;</a>
                            </div>
                            <div class="am-modal-bd" style="padding: 10px 25px">
                                <div class="sy-left draw-cash drawCash">
                                    <div class="draw-add">
                                        <div class="sy-font-md">
                                            <div>
                                                <span>选择提现方式：</span>
                                                <label class="am-radio am-success bankCheck">
                                                    <input type="radio" name="payWay" value="银行卡" checked data-am-ucheck> 银行卡
                                                </label>
                                            </div>
                                            <div>
                                                <span>可提现金额：</span>
                                                <input class="drawAmount" type="number" placeholder="请输入提取金额"> 元
                                                <label class="drawAll">全部提现</label>
                                                <p class="tip" style="max-width: 225px">*因所在城市、银行不同需收取相关费用，请以实际到账为准。</p>
                                            </div>
                                            <div>
                                                <span>上传凭证：</span>
                                                <input type="text" readonly placeholder="请点击上传凭证" onclick="$('.selectFileBt').click()">
                                                <button class="sy-btn sy-btn-green sy-btn-sm" onclick="$('.selectFileBt').click()">点击上传</button>
                                                <div id="fileUploadContent" class="fileUploadContent"></div>
                                                <input class="drawImg" type="hidden" value="">
                                                <p class="tip" style="max-width: 225px">*上传近三个月社保证明、学生证或退休证，大小3M，格式jpg。</p>
                                            </div>
                                            <div>
                                                <span>输入结算密码：</span>
                                                <input class="drawPwd" type="password" required placeholder="请输入结算密码">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="am-modal-footer">
                                <span class="am-modal-btn sy-btn sy-btn-white sy-btn-sm" data-am-modal-cancel>取消申请</span>
                                <button type="button" 
                                        class="sy-modal-href sy-btn sy-btn-green sy-btn-sm confirmCashOut cashOutBtn_cny">申请提现</button>
                            </div>
                        </div>
                    </div>`;
        $('.cashOutModal').remove();
        $('.personal.balance').append(el);
        $('.am-modal.cashOut_cny').modal({closeViaDimmer: false });
        $("#fileUploadContent").initUpload({
            'method': 'post',
            'fileName': 'multipartFile',
            "uploadUrl":__api__.baseRMUrl+ "/financeNew/uploadCredential",//上传文件信息地址
            "fileType":['jpg'],//文件类型限制，默认不限制
            "isHiddenUploadBt":true,//是否隐藏上传按钮
            "isHiddenCleanBt":true,//是否隐藏清除按钮
            "isAutoClean":true,//是否上传完成后自动清除
            // "maxFileNumber":3,//文件个数限制，为整数
            // "ismultiple":true,//是否允许多选
            "size":3*1024, //文件大小 3M
            "autoCommit":true,//是否自动上传
            "beforeUpload":function (opt) {//在上传前执行的函数
                $.loading('上传中...');
            },
            "onUpload":function (opt, data) {//在上传后执行的函数
                if(data.message === 'success'){
                    $('.fileUploadContent>img').remove();
                    $('.fileUploadContent').append(`<img class="previewImg" src="${data.data}" alt=""/>`);
                    $('.drawImg').val(data.data);
                }else{
                    $.error(data.message)
                }
                $('.my-loading').remove();
            }
        });
        $('.drawAll').on('click', function() {
            const amountEl = document.querySelector('.drawAmount');
            amountEl.value = config.total;
        })
    },
    //结算方式为【校企合作】
    cashOut_cooperation: function (config = {total: 0, type: '', typeName: ''}) {
        const el = `<div class="am-modal am-modal-confirm apply-detail cashOutModal cashOut_cny">
                        <div class="am-modal-dialog">
                            <div class="am-modal-hd">申请提现
                                <a href="javascript: void(0)" class="am-close am-close-spin" data-am-modal-close>&times;</a>
                            </div>
                            <div class="am-modal-bd" style="padding: 10px 25px">
                                <div class="sy-left draw-cash drawCash">
                                    <div class="draw-add">
                                        <div class="sy-font-md">
                                            <div>
                                                <span>选择提现方式：</span>
                                                <label class="am-radio am-success bankCheck">
                                                    <input type="radio" name="payWay" value="银行卡" checked data-am-ucheck> 银行卡
                                                </label>
                                            </div>
                                            <div>
                                                <span>可提现金额：</span>
                                                <input class="drawAmount" type="number" placeholder="请输入提取金额"> 元
                                                <label class="drawAll">全部提现</label>
                                                <p class="tip" style="max-width: 225px">*因所在城市、银行不同需收取相关费用，请以实际到账为准。</p>
                                            </div>
                                            <div>
                                                <span>输入结算密码：</span>
                                                <input class="drawPwd" type="password" required placeholder="请输入结算密码">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="am-modal-footer">
                                <span class="am-modal-btn sy-btn sy-btn-white sy-btn-sm" data-am-modal-cancel>取消申请</span>
                                <button type="button" 
                                        class="sy-modal-href sy-btn sy-btn-green sy-btn-sm confirmCashOut cashOutBtn_cny">申请提现</button>
                            </div>
                        </div>
                    </div>`;
        $('.cashOutModal').remove();
        $('.personal.balance').append(el);
        $('.am-modal.cashOut_cny').modal({closeViaDimmer: false });
        $('.drawAll').on('click', function() {
            const amountEl = document.querySelector('.drawAmount');
            amountEl.value = config.total;
        })
    }
});