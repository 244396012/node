/*
* module：views -> personal：skill-xxx (exclude skill/skillChoiceTest/skillTransTest files)
* 定义可扩展的模块
* author：zy
* date：2019-8-22
* */

import { baseUrl, baseRMUrl } from "./interceptor";
import { getResponse} from "./asyncAjax";
import './modal';

(function (api, global, document, $, undefined) {






    global.__api__ = api;

})(window.__api__ || {}, window, document, jQuery);
