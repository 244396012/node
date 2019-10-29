(function (global, document, $){

    var config = {
        menus: [
            'bold',  // 粗体
            'italic',  // 斜体
            'underline',  // 下划线
            'strikeThrough',  // 删除线
            'head',  // 标题
            'fontSize',  // 字号
            'fontName',  // 字体
            'foreColor',  // 文字颜色
            'backColor',  // 背景颜色
            'link',  // 插入链接
            'list',  // 列表
            'justify',  // 对齐方式
            'quote',  // 引用
            'emoticon',  // 表情
            'image',  // 插入图片
            'table',  // 表格
            'undo',  // 撤销
            'redo'  // 重复
        ],
        imgMaxSize: 3 * 1024 * 1024, //3M
        fileName: 'multipartFile' //参数名
    };

//文本编辑器初始化
    var Editor = window.wangEditor,
        editor = new Editor('#editor');
//自定义菜单配置
    editor.customConfig.menus = config.menus;
//图片上传到服务端
    editor.customConfig.uploadImgServer = __api__.baseRMUrl+'/interpreterArticle/uploadCover';
//将图片大小限制
    editor.customConfig.uploadImgMaxSize = config.imgMaxSize;
//自定义fileName
    editor.customConfig.uploadFileName = config.fileName;
//携带token
    editor.customConfig.uploadImgHeaders = {
        'Authorization': 'bearer '+sessionStorage.getItem('sy_rm_client_access_token')
    };
//使用监听函数在上传图片的不同阶段做相应处理
    editor.customConfig.uploadImgHooks = {
        success: function (xhr, editor, result) {
            // 图片上传并返回结果，图片插入成功之后触发
            // xhr 是 XMLHttpRequst 对象，editor 是编辑器对象，result 是服务器端返回的结果
        },
        fail: function (xhr, editor, result) {
            // 图片上传并返回结果，但图片插入错误时触发
            // xhr 是 XMLHttpRequst 对象，editor 是编辑器对象，result 是服务器端返回的结果
        },
        error: function (xhr, editor) {
            // 图片上传出错时触发
            // xhr 是 XMLHttpRequst 对象，editor 是编辑器对象
        },
        // 如果服务器端返回的不是 {errno:0, data: [...]} 这种格式，可使用该配置
        // （但是，服务器端返回的result必须是一个 JSON 格式字符串！！！否则会报错）
        customInsert: function (insertImg, result, editor) {
            // 图片上传并返回结果，自定义插入图片的事件（而不是编辑器自动插入图片！！！）
            // insertImg 是插入图片的函数，editor 是编辑器对象，result 是服务器端返回的结果
            var url = result.data;
            insertImg(url);
        }
    };

    editor.create();

}(window, document, jQuery));
