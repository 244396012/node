function MVVM(options) { 
    this.$options = options;
    var self = this;
    var data = this._data = this.$options.data;
    Object.keys(data).forEach(key => {
        self._proxy(key)
    })
    observe(data);
    this.$compile = new Compile(options.el || document.body, this._data)
}

MVVM.prototype._proxy = function (key){
    var self = this;
    Object.defineProperty(self, key, {
        configurable: false,
        enumerable: true,
        get: function (){
            return self._data[key]
        },
        set: function (newVal){
            self._data[key] = newVal
        }
    })
}