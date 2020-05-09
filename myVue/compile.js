
// 指令处理集合
var compileUtil = {
    text: function(node, vm, exp) {
        this.bind(node, vm, exp, 'text');
    },
    // ...省略
    bind: function(node, vm, exp, dir) {
        var updaterFn = updater[dir + 'Updater'];
        // 第一次初始化视图
        updaterFn && updaterFn(node, vm[exp]);
        // 实例化订阅者，此操作会在对应的属性消息订阅器中添加了该订阅者watcher
        new Watcher(vm, exp, function(value, oldValue) {
            // 一旦属性值有变化，会收到通知执行此更新函数，更新视图
            updaterFn && updaterFn(node, value, oldValue);
        });
    }
};

function Compile(el, vm) {
    this.$vm = vm;
    this.$el = this.isElementNode(el) ? el : document.querySelector(el);
    if(this.$el){
        this.$fragment = this.nodeToFragment(this.$el);
        this.init();
        this.$el.appendChild(this.$fragment)
    }
}

Compile.prototype = {
    constructor: Compile,
    init: function (){
        this.compileElement(this.$fragment)
    },
    isElementNode: function (el){
        if(el && el.nodeType === 1){
            return true
        }
        return false
    },
    isTextNode: function (el){
        if(el && el.nodeType === 3){
            return true
        }
        return false
    },
    nodeToFragment: function (el){
        var fragment = document.createDocumentFragment();
        var firstChild;
        while(firstChild = el.firstChild){
            fragment.appendChild(firstChild);
        }
        return fragment
    },
    compileElement: function (el){
        var childNodes = el.childNodes;
        var self = this;
        [].slice.call(childNodes).forEach(node => {
            var reg = /\{\{(.*)\}\}/;
            var text = node.textContent;
            // if (me.isElementNode(node)) { // 编译指令
            //     me.compile(node);
            // }
            if(self.isTextNode(node) && reg.test(text)){ // 判断是否是符合这种形式{{}}的指令
                self.compileText(node, RegExp.$1)
            }
            if(node.childNodes && node.childNodes.length){
                self.compileElement(node)  // 继续递归遍历子节点
            }
        })
    },
    compileText: function (node, exp){        
        var self = this;
        var initTxt = this.$vm[exp];
        self.updateText(node, initTxt);  // 将初始化的数据初始化到视图中
        new Watcher(this.$vm, exp, function (value) {  // 生成订阅器并绑定更新函数
            self.updateText(node, value);
        });
    },
    updateText: function (node, value){
        node.textContent = typeof value === 'undefined' ? '' : value
    },
    compile: function(node) {
        var nodeAttrs = node.attributes, me = this;
        [].slice.call(nodeAttrs).forEach(function(attr) {
            // 规定：指令以 v-xxx 命名
            // 如 <span v-text="content"></span> 中指令为 v-text
            var attrName = attr.name;    // v-text
            if (me.isDirective(attrName)) {
                var exp = attr.value; // content
                var dir = attrName.substring(2);    // text
                if (me.isEventDirective(dir)) {
                    // 事件指令, 如 v-on:click
                    compileUtil.eventHandler(node, me.$vm, exp, dir);
                } else {
                    // 普通指令
                    compileUtil[dir] && compileUtil[dir](node, me.$vm, exp);
                }
            }
        });
    }
}