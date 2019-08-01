var calUtil = {
    loadStyle: function () {
        var style = document.createElement('style');
        style.innerHTML = `.sign-calender{width: 286px;margin: 0 auto;}
        .sign_succ_calendar_title{padding: 10px 0;text-align: center;}
        .sign-calender table{width: 100%;border-collapse: separate;border-spacing: 4px;}
        .sign-calender th, .sign-calender td{width: 36px;height: 36px;font-size: 14px;text-align: center;}
        .sign-calender td.today{color: #fff;background: #41CCA6;}
        .sign-calender td.on{background: #ddd;}`;
        document.head.appendChild(style);
    },
    getDaysInmonth : function(iMonth, iYear){
        var dPrevDate = new Date(iYear, iMonth, 0);
        return dPrevDate.getDate();
    },
    bulidCal : function(iYear, iMonth) {
        var aMonth = new Array();
        aMonth[0] = new Array(7);
        aMonth[1] = new Array(7);
        aMonth[2] = new Array(7);
        aMonth[3] = new Array(7);
        aMonth[4] = new Array(7);
        aMonth[5] = new Array(7);
        aMonth[6] = new Array(7);
        var dCalDate = new Date(iYear, iMonth - 1, 1);
        var iDayOfFirst = dCalDate.getDay();
        var iDaysInMonth = calUtil.getDaysInmonth(iMonth, iYear);
        var iVarDate = 1;
        var d, w;
        aMonth[0][0] = "日";
        aMonth[0][1] = "一";
        aMonth[0][2] = "二";
        aMonth[0][3] = "三";
        aMonth[0][4] = "四";
        aMonth[0][5] = "五";
        aMonth[0][6] = "六";
        for (d = iDayOfFirst; d < 7; d++) {
            aMonth[1][d] = iVarDate;
            iVarDate++;
        }
        for (w = 2; w < 7; w++) {
            for (d = 0; d < 7; d++) {
                if (iVarDate <= iDaysInMonth) {
                    aMonth[w][d] = iVarDate;
                    iVarDate++;
                }
            }
        }
        return aMonth;
    },
    ifHasSigned : function(signList,day){
        var signed = false;
        $.each(signList,function(index,item){
            var date = new Date(item.signDate);
            if(date.getDate() == day) {
                signed = true;
                return false;
            }
        });
        return signed;
    },
    drawCal : function(iYear, iMonth ,signList) {
        var currentYearMonth = iYear+"年"+iMonth+"月";
        var myMonth = calUtil.bulidCal(iYear, iMonth);
        var htmls = [];
        htmls.push("<div class='sign_main' id='sign_layer'>");
        htmls.push("<div class='sign_succ_calendar_title'>");
        htmls.push("<div class='calendar_month_span'>"+currentYearMonth+"</div>");
        htmls.push("</div>");
        htmls.push("<div class='sign' id='sign_cal'>");
        htmls.push("<table class='table'>");
        htmls.push("<tr>");
        htmls.push("<th>" + myMonth[0][0] + "</th>");
        htmls.push("<th>" + myMonth[0][1] + "</th>");
        htmls.push("<th>" + myMonth[0][2] + "</th>");
        htmls.push("<th>" + myMonth[0][3] + "</th>");
        htmls.push("<th>" + myMonth[0][4] + "</th>");
        htmls.push("<th>" + myMonth[0][5] + "</th>");
        htmls.push("<th>" + myMonth[0][6] + "</th>");
        htmls.push("</tr>");
        var d, w, today = new Date().getDate();
        for (w = 1; w < 7; w++) {
            htmls.push("<tr>");
            for (d = 0; d < 7; d++) {
                var ifHasSigned = calUtil.ifHasSigned(signList,myMonth[w][d]);
                if(ifHasSigned){
                    htmls.push("<td class='on'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : " ") + "</td>");
                } else if(today === myMonth[w][d]){
                    htmls.push("<td class='today'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : " ") + "</td>");
                } else {
                    htmls.push("<td>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : " ") + "</td>");
                }
            }
            htmls.push("</tr>");
        }
        htmls.push("</table>");
        htmls.push("</div>");
        htmls.push("</div>");
        return htmls.join('');
    }
};

window.onload = function () {
    calUtil.loadStyle();
    //签到弹框
    $('#showSignOn').click(function () {
        __api__.getResponse({
            url: '/sign/listSignInfoThisMonth',
            data: {
                timeStamp: new Date().toLocaleDateString().replace(/\//g,'-')
            }
        }).then(res => {
            return new Promise(resolve => {
                resolve(res);
            })
        }).then(res => {
            const signed = [];
            if(res.message === 'success'){
                res.data.forEach(item => {
                    signed.push({signDate: item.signDate})
                });
            }
            $.signOn({
                signList: [...signed],
                signOn: function () {
                    //确认签到
                    __api__.getResponse({
                        type: 'post',
                        url: '/sign/sign',
                        data:{
                            signDate: new Date().toLocaleDateString().replace(/\//g,'-'),
                            userId: localStorage.getItem('sy_rm_client_ud')
                        }
                    }).then(res => {
                        if(res.message === 'success'){
                            $.success('签到成功');
                            $('a.am-close').click();
                        }else{
                            $.error(res.message);
                        }
                    });
                }
            })
        })
    });
};
