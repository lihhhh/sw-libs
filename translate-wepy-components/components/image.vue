<!--
@author: iMyth
@description: 小程序基础组件image
@link: https://developers.weixin.qq.com/miniprogram/dev/component/image.html
@properties:
src        String      图片资源地址
mode       String      图片裁剪、缩放的模式
lazy-load  Boolean     图片懒加载。只针对page与scroll-view下的image有效
binderror  HandleEvent 当错误发生时，发布到 AppService 的事件名，事件对象event.detail = {errMsg: 'something wrong'}
bindload   HandleEvent 当图片载入完毕时，发布到 AppService 的事件名，事件对象event.detail = {height:'图片高度px', width:'图片宽度px'}
-->
<template>
    <div class="wepy-image" ref='image' :style="getImageStyle"></div>
</template>

<script>
import event from '../event';
import util from '../util';
const LAYOUT_STYLES = {
    scaleToFill: {
        backgroundSize: '100% 100%'
    },
    aspectFit: {
        backgroundSize: 'contain'
    },
    aspectFill: {
        backgroundSize: 'cover'
    },
    widthFix: {
        backgroundSize: '100% auto'
    },
    top: {
        backgroundPosition: 'center top'
    },
    bottom: {
        backgroundPosition: 'center bottom'
    },
    center: {
        backgroundSize: 'auto'
    },
    left: {
        backgroundPosition: 'left center'
    },
    right: {
        backgroundPosition: 'right center'
    },
    'top left': {
        backgroundPosition: 'left top'
    },
    'top right': {
        backgroundPosition: 'right top'
    },
    'bottom left': {
        backgroundPosition: 'left bottom'
    },
    'bottom right': {
        backgroundPosition: 'right bottom'
    }
};
export default {
    name:'wepy-image',
    props: {
        defaultStyle:{
            // type:'Object',
            default: () => {}
        },
        src: {
            type: String,
            default: () => ''
        },
        mode: {
            type: String,
            default: () => 'scaleToFill',
            validator: type => ~Object.keys(LAYOUT_STYLES).indexOf(type)
        },
        lazyLoad: {
            // type: Boolean,
            default: () => false
        }
    },
    data () {
        return {
            img: null,
            containerHeight: null
        }
    },
    computed: {
        getImageStyle () {
            var defaultStyle = this.defaultStyle||{};
            console.log('defaultStyle',this.defaultStyle)
            console.log('src',this.src)
            var style = Object.assign(
                {
                    backgroundImage: `url(${this.src})`
                },
                defaultStyle,
                
                (this.mode === 'widthFix' && this.containerHeight) ? { height: this.containerHeight } : {},
                LAYOUT_STYLES[this.mode]
            )
            
            return style;
        }
    },
    methods: {
        onload (e) {
            if(!this.img) return ;
            let height = this.img.naturalHeight;
            let width = this.img.naturalWidth;
            let evt = new event('system', this.$parent.$wepy, 'bindload');
            evt.$transfor(e);
            evt.detail = {
                height: `${height}px`,
                width: `${width}px`
            }
            this.handleWidthFix({ height, width });
            var dom = this.$refs['image'];
            // debugger
            evt.currentTarget =dom;
            // evt.currentTarget = {
            //   dataset:util.setDataset(dom)
            // };
            this.$emit('load', evt);
            this.img = null;
        },
        onerror (e) {
            let evt = new event('system', this.$parent.$wepy, 'binderror');
            evt.$transfor(e);
            evt.detail = {
                errMsg: e.message
            };
            this.$emit('binderror', evt);
            this.img = null;
        },
        checkStatus () {
            this.img = new Image();
            this.img.onload = this.onload;
            this.img.onerror = this.onerror;
            this.img.src = this.src;
        },
        handleWidthFix ({ height, width }) {
            if (this.mode !== 'widthFix') {
                return;
            }
            let containerWidth = this.$el.clientWidth;
            this.containerHeight = `${(containerWidth / width) * height}px`;
        }
    },
    watch: {
        src (v) {
            if (!v) {
                return;
            }
            
            this.checkStatus();
        },
        mode (v) {
            if (v !== 'widthFix') {
                return;
            }
            this.handleWidthFix();
        }
    },
    mounted () {
        this.checkStatus();
        if (!this.lazyLoad) {
            return
        }
        console.log('lazyLoad is not supported!')
        // throw new Error('lazyLoad is not supported!');
    }
};
</script>

<style lang='less'>
.wepy-image {
    width: 100%;
    height: 100%;
    // width: 300px;
    // height: 225px;
    overflow: hidden;
    background-repeat: no-repeat;
    background-position: center center;
    background-size: 100% 100%;
    display: inline-block;
}
</style>