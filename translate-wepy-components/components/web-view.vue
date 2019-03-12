
<template>
    <iframe :src="src" frameborder="0" target="_self"></iframe>
</template>
<script>
export default {
    data () {
        return {
            isHover: false
        };
    },

    props: {
        'src': {
            default: ''
        }
    },

    methods: {
        
    }
}
</script>
<style lang="less">
.wepy-web-view {
    position: absolute !important;
    height:100% !important;
    width:100vw !important;
    z-index: 999  !important;
}
</style>
