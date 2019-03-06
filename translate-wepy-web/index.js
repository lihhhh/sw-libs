
import wepyWeb from 'wepy-web'
import wepy from 'wepy'
import q from 'q'
import _ from 'lodash'

function deep(arr, componentName, cb) {
    var reg = new RegExp(`${componentName}$`);
    var _deep = function (_arr) {
        _arr.map(it => {
            if (reg.test(it.$vnode.tag)) {
                cb(it);
            }
            if (it.$children) {
                _deep(it.$children)
            }
        })
    }
    _deep(arr);

}

export default {
    $wx: {},
    $Vue: {},
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
            deep(this.$children, componentName, function (com) {
                com[methodName](params)
            })
        }
    },
    addPrototype: function (prototypeObj) {
        this.prototype = _.assign(this.prototype, prototypeObj);
        _.assign(this.$Vue.prototype, this.prototype)
    }
}