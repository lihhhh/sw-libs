
import wepyWeb from 'wepy-web'
import wepy from 'wepy'

export default {
    init: function () {
        wx.wxRequest = wx.request;
        wx.request = function (options) {
            var defer = $q.defer();
            var success = options.success;
            options.success = function (res) {
                success && success(res)
                defer.resolve(res);
            };
            wx.wxRequest(options)

            return defer.promise;
        }
        
        Object.assign(wepy, wx, {
            navigateTo: function (params) {
                // 前面没斜杠加斜杠
                if (/^[^\/]/.test(params.url)) {
                    // 去除开头非字母的
                    params.url = params.url.replace(/^[^a-z]*/, '');
                    params.url = '/' + params.url;
                }

                window.$router.push({
                    path: params.url
                })
            }
        })
        
        Object.assign(wepyWeb, wx, {
            navigateTo: function (params) {
                window.$router.push({
                    path: params.url
                })
            }
        })
    },
    install: function (Vue) {
        this.init()
        Object.assign(Vue.prototype,this.prototype)
    },
    prototype:{
        $apply: _.debounce(function () {
            this.$forceUpdate()
        }, 300),
        $invoke:function(componentName,methodName,params){
            // debugger
            this._data.$com[componentName].methods[methodName](params)
            
        }
    },
    addPrototype:function(prototypeObj){
        this.prototype = {...this.prototype,...prototypeObj};
        Object.assign(Vue.prototype,this.prototype)
    }
}