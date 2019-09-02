/*
 * 弹窗、props扩展对象
 * author: zy
*/

jQuery.extend({
    success: function(txt){
        $('body').append('<div class="my-tip my-success"><i class="am-icon-check-circle"></i> '+ txt +'</div>');
        $(".my-success").stop().delay(2000).animate({ top: 30 + "%", opacity: 0 }, 500, function() {
            $(this).remove();
        })
    },
    warning: function (txt) {
        $('body').append('<div class="my-tip my-warn"><i class="am-icon-exclamation-circle"></i> '+ txt +'</div>');
        $(".my-warn").stop().delay(2000).animate({ top: 30 + "%", opacity: 0 }, 500, function() {
            $(this).remove();
        })
    },
    error: function(txt){
        $('body').append('<div class="my-tip my-error"><i class="am-icon-times-circle"></i> '+ txt +'</div>');
        $(".my-error").stop().delay(2000).animate({ top: 30 + "%", opacity: 0 }, 500, function() {
            $(this).remove();
        })
    },
    loading: function (txt) {
        $('.my-loading').remove();
        $('body').append('<div class="my-tip my-loading"><i class="am-icon-spinner am-icon-spin"></i> ' + txt + '</div>');
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
                              onclick="this.checked?$('.startTestBtn').removeAttr('disabled'):$('.startTestBtn').attr('disabled','true')">
                              这是我本人的测试，同意不分享此测试内容，并接受测试结果。
                            </label>
                        </div>
                        <div class="am-modal-footer" style="margin: 1rem 0 2rem;">
                            <button type="button" class="sy-modal-href sy-btn sy-btn-green sy-btn-sm startTestBtn" disabled
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
    }
});
