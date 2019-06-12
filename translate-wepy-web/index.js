
import wepyWeb from 'wepy-web'
import wepy from 'wepy'
import q from 'q'
import _ from 'lodash'

function deep(key, cb) {
    var _deep = function (_arr) {
        if (!_arr) return;
        if (Array.isArray(_arr)) {
            _arr.map(it => {
                cb(it);
                if (it[key]) {
                    _deep(it[key])
                }
            })
        } else {
            var lock = cb(_arr);
            if (lock) return;
            if (_arr[key]) {
                _deep(_arr[key])
            }
        }
    }
    _deep(this[key]);
}

var web = {
    $wx: {},
    $Vue: {},
    $emit: '',
    wxExends: function () {
        var that = this;
        return {
            mixin:class {
                constructor(){
                    
                }
                parseWeb(){
                    var methods = {};
                    Object.getOwnPropertyNames(this.__proto__).map(it=>{
                        if(it==="constructor") return;
                        methods[it] = this.__proto__[it];
                    })
                    
                    return {
                        methods
                    };
                }
            },
            navigateTo: function (params) {
                // ./相对路径开头的  需要根据当前页面做处理
                if(/^\.\//.test(params.url)){
                    var currentPath = $router.history.current.path.replace(/(.*\/).*/,'$1');
                    params.url=params.url.replace('./',currentPath)
                }
                // 前面没斜杠加斜杠
                if (/^[^\/]/.test(params.url)) {
                    // 去除开头非字母的
                    params.url = params.url.replace(/^[^a-z]*/, '');
                    params.url = '/' + params.url;
                }

                window.$router.push({
                    path: params.url,
                    query:{
                        // routerType:'navigateTo' //有此类型 会缓存上一页面
                    }
                })
            },
            navigateBack: function (options){
                var { success, complete,delta } = options;
                
                window.$router.go(-delta)
                
                typeof success === 'function' && success();
                typeof complete === 'function' && complete();
            },
            request: function (params) {
                if (params.header) {
                    params.headers = params.header;
                }
                return that.$wx.request(params)
            },
            // 震动
            vibrateLong: function (options = {}) {
                var { success, complete } = options;
                typeof success === 'function' && success();
                typeof complete === 'function' && complete();
            },
            showLoading: function (options = {}) {
                // 显示
                that.$Vue.$vux.loading.show({
                    text: options.title || 'Loading'
                })
            },
            hideLoading: function () {
                that.$Vue.$vux.loading.hide()
            },
            showShareMenu: function () { },
            showModal: function (options = {}) {
                var { title, content, success, complete } = options;
                that.$Vue.$vux.confirm.show({
                    title,
                    content,
                    onCancel() {
                        success({
                            cancel: true
                        });
                        typeof complete === 'function' && complete();
                    },
                    onConfirm() {
                        success({
                            confirm: true
                        });
                        typeof complete === 'function' && complete();
                    }
                })

            },
            showToast: function (options = {}) {
                var {
                    title = '提示',
                    icon = 'success',
                    duration = 1500,
                    mask = false,
                    complete,
                    success
                } = options;

                // 显示
                that.$Vue.$vux.toast.show({
                    text: title,
                    time: duration,
                    type: icon,
                    width: '34%',
                    "isShowMask": mask
                })
                typeof success === 'function' && success();
                typeof complete === 'function' && complete();
            },
            hideToast: function () {
                // 隐藏
                that.$Vue.$vux.toast.hide()
            },
            hideShareMenu: function (options) {
            },
            getUpdateManager: function () {
                return {
                    onCheckForUpdate: function (cb) { },
                    onUpdateReady: function (cb) { },
                    applyUpdate: function (cb) { }
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
            getSystemInfoSync: function () {
                var res = that.$wx.getSystemInfoSync()
                return res;
            },
            chooseImage: function(options){
                var {success} = options;
                that.$Vue.app.store.commit('actionsheet',{
                    show:true,
                    menus: [{
                        name:'拍照',
                        file:false
                    },{
                        name:'打开相册',
                        file:true
                    }],
                    success(data){
                        that.$Vue.app.store.commit('actionsheet',{show:false})
                        typeof success === 'function' && success(data);
                    }
                })
                // typeof success === 'function' && success();
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
    setGlobal:function(){
        var Ws = WebSocket;
        
        window.getCurrentPages = ()=>{
            var historyPages = this.$Vue.app.store.state.historyPages;//
            historyPages.map(it=>{
                it.__route__ = it.route.replace(/^\//,'');
            })
            return historyPages;
        }

        window.WebSocket = function(url){
            let ws = new Ws(url)
            var {send} = ws;
            ws.send = function(options){
                var data ,success;
                if(typeof options === 'string'){
                    data = options
                }else {
                    data = options.data;
                    success = options.success;
                }

                // send  依赖 ws实例
                send.call(ws,data)
                typeof success === 'function' && success();
            }
            return ws;
        }
    },
    install: function (Vue) {
        Vue.prototype.$$emit = Vue.prototype.$emit;
        this.$Vue = Vue;
        this.setGlobal()
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
            var reg = new RegExp(`\\d-${componentName}$`);
            
            deep.call(this, '$children', function (com) {
                if (reg.test(com.$vnode.tag)) {
                    console.log(com.$vnode.tag)
                    if(typeof com[methodName] == 'function'){
                        com[methodName](params)
                    }else {
                        throw "$invoke error:请检查 "+methodName+'方法是否存在'
                    }
                }
            })
        },
        $emit: function (eventName) {
            var that = this;
            var args = Array.prototype.slice.call(arguments);

            deep.call(this, '$parent', function (com) {
                if (com && com.$vnode && com.$vnode.tag.indexOf('wepy-') === -1) {
                    if(com.customEvents&&com.customEvents[eventName]){
                        that.$name = that.$vnode.tag.replace(/.*\d+\-(.*)/,'$1');
                        var event = {
                            active:true,
                            name:eventName,
                            source:that,
                            type:'emit'
                        }
                        com.customEvents[eventName].apply(com,[args[1],event])
                    }
                }
            })
            
            
            this.$$emit.apply(this, args)
        },
        $getParent: function () {
            var out = {};

            // 
            deep.call(this, '$parent', function (com) {
                if (com && com.$vnode && com.$vnode.tag.indexOf('wepy-') === -1) {
                    out = com;
                    return true;
                }
            })
            return out;
        },
        $deep: deep,
        $getFormFields: function () {
            var fields = {};
            this.$deep('$children', (com) => {
                if (com.name) {
                    fields[com.name] = com.outputValue;
                }
            })
            return fields;
        },
        $getChildrenOutputValues: function () {
            var out = [];
            this.$deep('$children', (com) => {
                if (com.outputValue) {
                    out.push(com.outputValue)
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