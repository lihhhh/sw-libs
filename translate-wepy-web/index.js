
import wepyWeb from 'wepy-web'
import wepy from 'wepy'
import q from 'q'
import _ from 'lodash'

function deep(key, cb) {
    var _deep = function (_arr) {
        if(!_arr) return;
        if(Array.isArray(_arr)){
            _arr.map(it => {
                cb(it);
                if (it[key]) {
                    _deep(it[key])
                }
            })
        }else{
            var lock = cb(_arr);
            if(lock) return;
            if(_arr[key]){
                _deep(_arr[key])
            }
        }
    }
    _deep(this[key]);
}

var web = {
    $wx: {},
    $Vue: {},
    $emit:'',
    wxExends: function(){
        var that = this;
        return {
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
            request: function (params) {
                if (params.header) {
                    params.headers = params.header;
                }
                return that.$wx.request(params)
            },
            showLoading: function () {
            },
            hideLoading: function () {
            },
            showShareMenu: function () { },
            showModal: function (options) {
                options.success({
                    confirm: true
                });
            },
            hideShareMenu: function (options) {
            },
            getUpdateManager:function(){
                return {
                    onCheckForUpdate:function(cb){},
                    onUpdateReady:function(cb){},
                    applyUpdate:function(cb){}
                };
            },
            getSystemInfo: function (options) {
                that.$wx.getSystemInfo({
                    success: function (res) {
                        options.success(res)
                    },
                    fail: options.fail,
                    complete: options.complete
                })
            },
            getSystemInfoSync:function(){
                var res = that.$wx.getSystemInfoSync()
                return res;
            }
        };
    },
    init: function () {
        var that = this;
        wx.wxRequest = wx.request;
        wx.request = function (options) {
            var defer = q.defer();
            var success = options.success;
            options.success = function (res) {
                success && success(res)
                defer.resolve(res);
            };
            wx.wxRequest(options)

            return defer.promise;
        }
        that.$wx = _.clone(_.assign(wepy, wx))
        _.assign(wepyWeb, wx, this.wxExends())
        // wx = wepy = wepyWeb;
        _.assign(wx, wepyWeb)
        _.assign(wepy, wx)
    },
    install: function (Vue) {
        Vue.prototype.$$emit = Vue.prototype.$emit;
        this.$Vue = Vue;
        this.init()
        _.assign(Vue.prototype, this.prototype)
    },
    prototype: {
        $apply: _.debounce(function () {
            _.keys(this._data).map(it => {
                this[it] = _.clone(this[it]);
            })
        }, 300),
        $invoke: function (componentName, methodName, params) {
            var reg = new RegExp(`${componentName}$`);
            deep.call(this,'$children', function (com) {
                if (reg.test(com.$vnode.tag)) {
                    com[methodName](params)
                }
                
            })
        },
        $emit:function(eventName){
            if(eventName=='showShadow'){
                debugger
            }
            var args = Array.prototype.slice.call(arguments);
            this.$$emit.apply(this,args)
        },
        $getParent:function(){
            var out={};
            
            // 这里只是为了获取app里面定义的globalData
            deep.call(this,'$parent', function (com) {
                if(com&&com.$vnode&&com.$vnode.tag.indexOf('wepy-')===-1){
                    out =  com;
                    return true;
                }
            })
            return out;
        }
    },
    addPrototype: function (prototypeObj) {
        this.prototype = _.assign(this.prototype, prototypeObj);
        _.assign(this.$Vue.prototype, this.prototype)
    }
}

export default web;