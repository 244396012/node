/*
 * @param: type - 类型
 * @param: baseUrl - 根路径
 * @param: url - 方法路径
 * @param: data - 参数
 * @param: headers - 请求头
 * 全局ajax方法，用async函数封装异步调用
 * 返回结果：res
 * */
import { baseRMUrl } from "./interceptor";

export async function getResponse(config){
    config = config || {};
    config.type = config.type || 'get';
    config.baseUrl = config.baseUrl || baseRMUrl;
    config.url = config.url || '';
    config.data = config.data || {};
    config.headers = config.headers || {};
    config.dataType = config.dataType || 'json';
    return await $.ajax({
        type: config.type,
        url: config.baseUrl + config.url,
        data: config.data,
        headers: config.headers,
        dataType: config.dataType,
        complete: function (res) {
            return res;
        }
    });
}