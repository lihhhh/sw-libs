<!--

@properties:
hover	Boolean	false	是否启用点击态
hover-class	String	none	指定按下去的样式类。当 hover-class="none" 时，没有点击态效果
hover-start-time	Number	50	按住后多久出现点击态，单位毫秒
hover-stay-time	Number	400	手指松开后点击态保留时间，单位毫秒
-->
<template>
    <form @submit.prevent="formSubmit">
        <slot></slot>
    </form>
</template>
<script>
export default {
    name:'wepy-form',
    data () {
        return {
        };
    },

    methods: {
        formSubmit(e){
            var fields = {};
            Array.from(this.$el.querySelectorAll('*')).map(el=>{
                var name = el.dataset.name;
                if(el.dataset.name){
                    fields[name] = el.dataset.value;
                }
            })
            this.$emit('submit',{
                type:'submit',
                detail:{
                    target:e.target,
                    value:fields
                }
            })
        }
    }
}
</script>
