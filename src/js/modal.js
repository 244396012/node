/*
 * 弹窗、props扩展对象。
 * 加载时、成功时、失败时等提示框扩展。
 * author: zhaoyong
*/
jQuery.extend({
    success: function(txt){
        var tar = $("head");
        var i = tar.attr("data-success") || 0;
        i++;
        tar.attr("data-tips",i);
        var ele = '<div class="my-alert my-tips-'+i+'" style="height: 40px;line-height: 40px;border-radius: 4px;' +
            'background-color: #41cca6;position:absolute;z-index:9999;left:50%;top:45%;transform:translate(-50%,-50%);' +
            'padding:0 20px;color:#fff;font-size:14px;box-shadow:3px 4px 10px 1px #aaa;font-family:Microsoft YaHei"><i class="am-icon-check-circle"></i> '+ txt +'</div>';
        $(document.body).append(ele);
        window.setTimeout(function(){
            $(".my-tips-" + i).animate({ top: 30 + "%", opacity: 0 }, 500, function () {
                $(this).remove();
            })
        },1500);
    },
    error: function(txt){
        var tar = $("head");
        var i = tar.attr("data-error") || 0;
        i++;
        tar.attr("data-alert",i);
        var ele = '<div class="my-alert my-alert-'+i+'" style="height: 40px;line-height: 40px;border-radius: 4px;' +
            'background: #f1572a;position:absolute;z-index:9999;left:50%;top:45%;transform:translate(-50%,-50%);' +
            'padding:0 20px;color:#fff;font-size:14px;box-shadow:3px 4px 10px 1px #aaa;font-family:Microsoft YaHei"><i class="am-icon-exclamation-circle"></i> '+ txt +'</div>';
        $(document.body).append(ele);
        window.setTimeout(function(){
            $(".my-alert-"+i).animate({top:30+"%",opacity:0},500,function(){
                $(this).remove();
            })
        },1800);
    },
    tooltip: function (params) {
        $('#sy-tooltip').remove();
        var $tooltip = $(`<div id="sy-tooltip"><i class="am-icon-exclamation-circle" style="color: #F37B1D"></i> ${params.msg || '提示信息！'}</div>`);
        $tooltip.appendTo(document.body);
        $tooltip.css({
            left: params.left + 80,
            top: params.top + 50
        });
        window.setTimeout(function(){
            $('#sy-tooltip').remove();
        },5000);
    },
    loading: function (txt) {
        $('#sy-loading').remove();
        var ele = '<div id="sy-loading" style="height: 40px;line-height: 40px;border-radius: 4px;' +
            'background: #1592ac;position:absolute;z-index:9999;left:50%;top:45%;transform:translate(-50%,-50%);' +
            'padding:0 20px;color:#fff;font-size:14px;box-shadow:3px 4px 10px 1px #aaa;font-family:Microsoft YaHei"><i class="am-icon-spinner am-icon-spin"></i> ' + txt + '</div>';
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
                </div>
            `;
        $('body').append(ele);
    },
    toolinfo: function (params) {
        $('#sy-toolinfo').remove();
        const ele = `
             <div class="am-modal am-modal-confirm" id="sy-toolinfo">
                    <div class="am-modal-dialog" style="min-width: 360px;max-width: 500px;color: #000;box-shadow: 5px 5px 10px 2px #555">
                        <div class="am-modal-hd" style="padding: 15px 0;margin: 0 15px;text-align: left;border-bottom: 1px dashed #dedede">${params.title || '提示信息'}
                            <a href="javascript: void(0)" class="am-close am-close-spin" data-am-modal-close style="right: 12px;top: 12px;font-size: 30px;">&times;</a>
                        </div>
                        <div class="am-modal-bd" style="padding:25px;border-bottom: none;font-size: 14px;text-align: left;line-height: 28px;">${params.txt}</div>
                        <div class="am-modal-footer" style="margin: 1rem 0 2rem;">
                            <span class="am-modal-btn sy-btn sy-btn-green sy-btn-sm" data-am-modal-close>我知道了</span>
                        </div>
                    </div>
                </div>
            `;
        $('body').append(ele);
        $('#sy-toolinfo').modal();
    }
});
