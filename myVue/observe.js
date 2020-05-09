// observer 数据监听器
function observe(data) { 
    if(!data || typeof data !== 'object'){
        return
    }
    // 取出所有属性遍历
    Object.keys(data).forEach(key => {
        defineReactive(data, key, data[key])
    })
}

//劫持数据 getter setter
function defineReactive(data, key, val) { 
    observe(val);
    var dep = new Dep();
    Object.defineProperty(data, key, {
        configurable: true,
        enumerable: true,
        get: function () {
            dep.depend();
            return val
        },
        set: function (newVal) {
            if(val !== newVal){
                val = newVal;
                dep.notify()
            }
        }
    })
}

function Dep() { 
    this.subs = [];   
}
Dep.prototype = {
    constructor: Dep,
    depend: function () { 
        Dep.target && this.addSub(Dep.target)
    },
    addSub: function (sub) { 
        this.subs.push(sub)
    },
    notify: function () { 
        this.subs.forEach(sub => {
            sub.update()
        })
    }
}
Dep.target = null;