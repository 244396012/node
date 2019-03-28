;(function ($) {
    $.fn.autocomplete = function (params) {

        'use strict';
        let timer = null;
        let currentSelection = -1;

        params = $.extend({
            arr: [],
            placeholder: '请输入搜索内容',
            width: 500,
            height: 52,
            onBlur: function () {}
        }, params);

        const input = $(this);
        input.attr('placeholder', params.placeholder)
            .css({
                height: params.height,
                width: params.width,
                lineHeight: params.lineHeight
            });

        $(window).on({
            scroll: function () {
                $('ul.text-down-list').remove();
                $('div.search-cancel').remove();
            },
            mousewheel: function () {
                $('ul.text-down-list').remove();
                $('div.search-cancel').remove();
            }
        });

        input.blur(function (e) {
            currentSelection = -1;
            params.onBlur(this);
        });

        input.on('keyup', function (e) {

            const _this = this;

            //输入内容0-9 a-z A-Z 才触发请求
            if(e.keyCode > 48 && e.keyCode < 57
                || e.keyCode > 65 && e.keyCode < 90
                || e.keyCode > 96 && e.keyCode < 105
                || e.keyCode === 32){
                params.arr = [];
                clearTimeout(timer);
                timer = setTimeout(function () {
                    const language = $('select[data-am-selected]').val();
                    $.ajax({
                        type: 'POST',
                        url: __api__.dict+ '/search/matchWord',
                        dataType: 'json',
                        data: {
                            word: _this.value,
                            sourceCode: language.split(',')[0],
                            targetCode: language.split(',')[1]
                        },
                        success: function (res) {
                            let { data } = res;
                            if(res.message === 'success'){
                                params.arr = data.slice(0,3);
                                params.arr.forEach(function (item) {
                                    const element = $('<li></li>')
                                        .html(item)
                                        .click(function () {
                                            input.val($(this).html());
                                            $('ul.text-down-list').remove();
                                        });
                                    $('ul.text-down-list').append(element);
                                });
                            }
                        }
                    });
                }, 500);
            }

            if(e.which !== 13 && e.which !== 27 && e.which !== 38 && e.which !== 40){

                $('ul.text-down-list').remove();
                currentSelection = -1;

                //获取位置
                const pos = {
                    top: input.offset().top - $(window).scrollTop(),
                    left: input.offset().left
                };

                const ul = $('<ul></ul>')
                    .addClass('text-down-list')
                    .css({
                        width: params.width - 2,
                        top: pos.top + params.height * 0.6,
                        left: pos.left + 1
                    });
                $(document.body).append(ul);

                if(input.val() !== ''){
                    if($('.search-cancel').length < 1){
                        const cancel = $('<div></div>')
                            .addClass('search-cancel')
                            .css({
                                top: pos.top + 14,
                                left: pos.left + params.width - 30
                            })
                            .click(function () {
                                input.val('');
                                $(this).remove();
                                $('ul.text-down-list').remove();
                            });
                        $('body').append(cancel);
                    }
                }else{
                    $('.search-cancel').remove();
                }
            }
        });

        input.keydown(function (e) {
            const lis = $('ul.text-down-list li');
            switch (e.which){
                case 38: // Up arrow
                    e.preventDefault();
                    lis.removeClass('selected');
                    if((currentSelection - 1) >= 0){
                        currentSelection--;
                        const sel = $( "ul.text-down-list li:eq(" + currentSelection + ")" );
                        sel.addClass('selected');
                        input.val(sel.text());
                    } else {
                        currentSelection = -1;
                    }
                    break;
                case 40: // Down arrow
                    e.preventDefault();
                    if(currentSelection+1 < params.arr.length){
                        currentSelection ++;
                        lis.removeClass('selected');
                        const sel = $( "ul.text-down-list li:eq(" + currentSelection + ")" );
                        sel.addClass('selected');
                        input.val(sel.text());
                    }
                    break;
                case 27: // Esc button
                    currentSelection = -1;
                    input.val('');
                    $('ul.text-down-list').remove();
                    $('.search-cancel').remove();
                    break;
            }
        });

        return this;
    }
})(jQuery);


