//返回提示信息
function resInfo(opt){
    opt.success = opt.success || false;
    opt.msg = opt.msg || '';
    opt.error = opt.error || '';
    opt.data = opt.data || '';
    return opt;
}

module.exports = resInfo;
