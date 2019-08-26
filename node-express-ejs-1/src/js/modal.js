/*
 * 弹窗、props扩展对象
 * author: zy
*/

jQuery.extend({
    success: function(txt){
        const tar = $("head");
        let i = tar.attr("data-success") || 0;
        i++;
        tar.attr("data-success",i);
        const ele = '<div class="my-tip my-success my-tips-'+i+'"><i class="am-icon-check-circle"></i> '+ txt +'</div>';
        $('body').append(ele);
        window.setTimeout(function(){
            $(".my-tips-" + i).animate({ top: 30 + "%", opacity: 0 }, 500, function () {
                $(this).remove();
            })
        },2000);
    },
    warning: function (txt) {
        const tar = $("head");
        let i = tar.attr("data-warn") || 0;
        i++;
        tar.attr("data-warn",i);
        const ele = '<div class="my-tip my-warn my-warn-'+i+'"><i class="am-icon-exclamation-circle"></i> '+ txt +'</div>';
        $('body').append(ele);
        window.setTimeout(function(){
            $(".my-warn-"+i).animate({ top: 30 + "%", opacity: 0 }, 500, function() {
                $(this).remove();
            })
        },2000);
    },
    error: function(txt){
        const tar = $("head");
        let i = tar.attr("data-error") || 0;
        i++;
        tar.attr("data-error",i);
        const ele = '<div class="my-tip my-error my-alert-'+i+'"><i class="am-icon-times-circle"></i> '+ txt +'</div>';
        $('body').append(ele);
        window.setTimeout(function(){
            $(".my-alert-"+i).animate({top:30+"%",opacity:0},500,function(){
                $(this).remove();
            })
        },2000);
    },
    loading: function (txt) {
        $('.my-loading').remove();
        const ele = '<div class="my-tip my-loading"><i class="am-icon-spinner am-icon-spin"></i> ' + txt + '</div>';
        $(document.body).append(ele);
    },
    /*
    * 调用方法如下：
    $.confirm();
    $('#sy-confirm').modal({
        closeViaDimmer: false,
        onConfirm: function (e) { },
        onCancel: function (e) { }
    });
    * */
    confirm: function (txt) {
        $('#sy-confirm').remove();
        const ele = `
             <div class="am-modal am-modal-confirm" id="sy-confirm">
                    <div class="am-modal-dialog" style="width: 360px;color: #000;box-shadow: 5px 5px 10px 2px #555">
                        <div class="am-modal-hd" style="padding: 15px 0;margin: 0 15px;text-align: left;border-bottom: 1px dashed #dedede">提 示
                            <a href="javascript: void(0)" class="am-close am-close-spin" data-am-modal-close style="right: 12px;top: 12px;font-size: 30px;">&times;</a>
                        </div>
                        <div class="am-modal-bd" style="padding:25px 0;font-size: 15px;border-bottom: none">${txt || '确认此操作吗？'}</div>
                        <div class="am-modal-footer" style="margin: 1rem 0 2rem">
                            <span class="am-modal-btn sy-btn sy-btn-green sy-btn-sm" data-am-modal-confirm>确 认</span>
                            <span class="am-modal-btn sy-btn sy-btn-white sy-btn-sm" data-am-modal-cancel>取 消</span>
                        </div>
                    </div>
                </div>`;
        $('body').append(ele);
    },
    toolinfo: function (params) {
        $('.sy-toolinfo-modal').remove();
        const ele = `
             <div class="am-modal am-modal-confirm sy-toolinfo-modal" id="sy-toolinfo">
                    <div class="am-modal-dialog" style="width: ${params.width || '360px'};color: #000;box-shadow: 5px 5px 10px 2px #555">
                        <div class="am-modal-hd" style="padding: 15px 0;margin: 0 15px;text-align: left;border-bottom: 1px dashed #dedede">${params.title || '提示信息'}
                            <a href="javascript: void(0)" class="am-close am-close-spin" data-am-modal-close style="right: 12px;top: 12px;font-size: 30px;">&times;</a>
                        </div>
                        <div class="am-modal-bd" style="padding:25px;border-bottom: none;font-size: 14px;text-align: left;line-height: 28px;">${params.txt}</div>
                        <div class="am-modal-footer" style="margin: 1rem 0 2rem;">
                            ${params.href ? params.href : ''}
                            <span class="am-modal-btn sy-btn sy-btn-white sy-btn-sm" data-am-modal-close>${params.close || '我知道了'}</span>
                        </div>
                    </div>
                </div>`;
        $('body').append(ele);
        $('#sy-toolinfo').modal();
    },
    skillTest: function (params) {
        $('.sy-testing-modal').remove();
        const ele = `
             <div class="am-modal am-modal-confirm sy-testing-modal" id="sy-testing">
                    <div class="am-modal-dialog" style="width: 580px;color: #000;box-shadow: 5px 5px 10px 2px #555">
                        <div class="am-modal-hd" style="padding: 15px 0;margin: 0 15px;text-align: left;border-bottom: 1px dashed #dedede">${params.title || '提示信息'}
                            <a href="javascript: void(0)" class="am-close am-close-spin" data-am-modal-close style="right: 12px;top: 12px;font-size: 30px;">&times;</a>
                        </div>
                        <div class="am-modal-bd" style="padding:25px 40px;border-bottom: none;font-size: 14px;text-align: left;line-height: 28px;">
                            ${params.txt}
                            <label class="am-checkbox am-success" style="margin-top: 30px;">
                              <input type="checkbox" data-am-ucheck style="width: 15px;height: 15px;"
                              onclick="this.checked?$('#startTest').removeAttr('disabled'):$('#startTest').attr('disabled','true')">
                              这是我本人的测试，同意不分享此测试内容，并接受测试结果。
                            </label>
                        </div>
                        <div class="am-modal-footer" style="margin: 1rem 0 2rem;">
                            <button id="startTest" type="button" class="sy-modal-href sy-btn sy-btn-green sy-btn-sm" disabled
                            onclick="location.href='/personal/skill/${params.href}'">开始测试</button>
                        </div>
                    </div>
                </div>`;
        $('body').append(ele);
        $('#sy-testing').modal();
    },
    signOn: function (config) {
        config = config || {};
        config.signList = config.signList || [];
        let lastTr = null, firstTdTxt = '';
        const str = calUtil.drawCal(new Date().getFullYear(),new Date().getMonth() + 1, config.signList);
        const ele = `
             <div id="sy-signOn" class="am-modal am-modal-confirm" data-am-modal="{closeViaDimmer: false}">
                    <div class="am-modal-dialog" style="width: 360px;color: #000;box-shadow: 5px 5px 10px 2px #555">
                        <div class="am-modal-hd" style="padding: 15px 0;margin: 0 15px;text-align: left;border-bottom: 1px dashed #dedede">签到
                            <a href="javascript: void(0)" class="am-close am-close-spin" data-am-modal-close style="right: 12px;top: 12px;font-size: 30px;">&times;</a>
                        </div>
                        <div class="am-modal-bd" style="padding: 0 25px;border-bottom: none;">
                            <div id="calendar" class="sign-calender"></div>
                        </div>
                        <div class="am-modal-footer" style="margin: 1rem 0;">
                            <button id="signOn" type="button" class="sy-btn sy-btn-green sy-btn-sh sy-font-md">签 到</button>
                        </div>
                    </div>
                </div>`;
        $('body').append(ele);
        $('#sy-signOn').modal({closeViaDimmer: false});
        $("#calendar").html(str);
        lastTr = $('#sign_cal tr').last();
        firstTdTxt = lastTr.find('td').first().text();
        firstTdTxt.trim() === '' && lastTr.remove();
        $("#signOn").on('click', config.signOn);
    }
});
