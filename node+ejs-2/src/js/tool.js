const tool = (function () {

    //获取url参数
    function queryParam(name) {
        const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        const r = window.location.search.substr(1).match(reg);
        if (r != null) {
            return unescape(decodeURIComponent(r[2]));
        }
        return null;
    }

    return {
        queryParam
    }
})();

export default tool;