/*
*
* index page
* 2019/10/21
*
* */

;(function (window, document, $, api) {

    if(location.pathname === '/'){

        const token = sessionStorage.getItem('sy_rm_client_access_token');

        if(token){
            //设置index首页，slider中“成为译员”按钮跳转
            $('.sliderTranslator').html('立即前往 >>').on('click',function (e){
                e.preventDefault();
                location.href = '/personal'
            });
            $('.toTranslatorBtn').remove()
        }

        //我要接单\我要发表\图书招募
        $('#getOrderBtn_Index, #releaseBtn_Index, #OrderPageBtn').click(function (e) {
            const auth = __api__.isAuth || {},
                id = this.id;
            if(!auth){
                return null
            }
            e.preventDefault();
            //未技能认证
            if(!auth.isPassSkill){
                if(id === 'releaseBtn_Index'){
                    $.warning('你当前还不能发表文章，快去完善信息吧')
                }else {
                    $.warning('你当前还不能接单，快去完善信息吧')
                }
                setTimeout("location.href = '/personal/skill'", 1000);
                return null
            }
            //未身份或财务认证
            if(!auth.isPassIdentity){
                if(id === 'releaseBtn_Index'){
                    $.warning('你当前还不能发表文章，快去完善信息吧')
                }else {
                    $.warning('你当前还不能接单，快去完善信息吧')
                }
                setTimeout("location.href = '/personal/identification'", 1000);
                return null
            }
            //已认证
            if(id === 'releaseBtn_Index'){
                location.href = "/p-article/create"
            }else {
                location.href = '/order'
            }
        });

    /*
    * 临时用
    * */
        //从数组中随机抽取几个元素
        function getRandomItem(arr, count) {
            let shuffled = arr.slice(0),
                i = arr.length,
                min = i - count,
                temp, index;
            while (i-- > min) {
                index = Math.floor((i + 1) * Math.random());
                temp = shuffled[index];
                shuffled[index] = shuffled[i];
                shuffled[i] = temp;
            }
            return shuffled.slice(min);
        }

        //随机产生数
        function getRandomNum(length) {
            let num = Math.floor(Math.random()*length);
            if(num < 10){
                return '0'+ num;
            }
            return num;
        }

        //明星译员
        const orderStar = ['Gue', '星城', '我叫王全', 'Marggina杨'], //2-4随机显示订单
            transStar = ['梦里匪思', '漠北', 'yigeren047', 'ChrisYu1'], //8000-15000之间随机字数
            dayStar = ['薰茵', '卡里', '球球sama', 'D医药法律']; //1-5随机字数

        $('div.star .item-1>.name').text(orderStar[Math.floor(Math.random()*4)]);
        $('div.star .item-2>.name').text(transStar[Math.floor(Math.random()*4)]);
        $('div.star .item-3>.name').text(dayStar[Math.floor(Math.random()*4)]);

        $('div.star .item-1>.number').text(Math.floor(Math.random()*3)+2);
        $('div.star .item-2>.number').text(Math.floor(Math.random()*7000)+8000);
        $('div.star .item-3>.number').text(Math.floor(Math.random()*5)+1);

        //滚动显示订单
        let orderStr = '';
        const orderList = ['西语翻译linda','rio','低调罗兰','热瑟','rames',
            '小小云','我这就去买糖','橘子','春田花花','李二娇France','李潇竹','胖企鹅',
            '清水二十三','薰茵','Augustus35','小兰爱摇篮','xinmen001','南山南','soeikazyj',
            '沉梦昂志哟','菜鸟小翻译','寒山客','青鸟','嗨森iis','梦里匪思','nana做翻译',
            '小鱼儿呀','木棍儿也是木头','粉色拖鞋','维斯布鲁克','爱因斯绊'];
        const addList = getRandomItem(orderList, 20),
            hoursList = [];
        for(let i = 0; i < addList.length; i++){
            const hour = parseInt(getRandomNum(17))+7;
            hoursList.push(hour);
        }
        hoursList.sort(function (a, b) {
            return a - b;
        });
        addList.forEach(function (item, index){
            let hours = hoursList[index] < 10 ? '0'+hoursList[index] : hoursList[index],
                minutes = getRandomNum(60);
            orderStr += `<li>
                            <div class="info">译员<span title="${item}">${item}</span>领取了一个订单</div>
                            <div class="time">${ hours }：${ minutes }</div>
                         </li>`;
        });
        $('.textScroll>ul').html(orderStr);

    }


}(window, document, jQuery, window.__api__||{}));


