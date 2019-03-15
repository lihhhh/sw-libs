<!--


遍历子组件的name值 取其 outputValue

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
            var fields = this.$getFormFields()
            this.$emit('submit',{
                type:'submit',
                detail:{
                    target:e.target,
                    value:fields
                },
                currentTarget:e.currentTarget
            })
        }
    }
}
</script>
