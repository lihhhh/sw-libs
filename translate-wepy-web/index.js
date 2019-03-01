
import wepyWeb from 'wepy-web'
import wepy from 'wepy'

function deep(arr,componentName,cb){
    var reg = new RegExp(`${componentName}$`);
    var _deep = function(_arr){
        _arr.map(it=>{
            if(reg.test(it.$vnode.tag)){
                cb(it);
            }
            if(it.$children){
                _deep(it.$children)
            }
        })
    }
    _deep(arr);
    
}

export default {
    $wx:{},
    init: function () {
        var that = this;
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
        that.$wx = {...Object.assign(wepy, wx)}
        Object.assign(wepyWeb, wx, {
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
            },
            request:function(params){
                if(params.header){
                    params.headers = params.header;
                }
                return that.$wx.request(params)
            },
            showLoading:function(){},
            hideLoading:function(){},
            showShareMenu:function(){},
        })
        // wx = wepy = wepyWeb;
        Object.assign(wx, wepyWeb)
        Object.assign(wepy, wx)
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
            deep(this.$children,componentName,function(com){
                com[methodName](params)
            })
        }
    },
    addPrototype:function(prototypeObj){
        this.prototype = {...this.prototype,...prototypeObj};
        Object.assign(Vue.prototype,this.prototype)
    }
}