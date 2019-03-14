<template>
    <!-- <x-input title="title" v-model="inputVal"></x-input> -->
    <input :value="inputVal" @input="change"/>
</template>
<script>
export default {
    name:'wepy-input',
    props: ['value'],
    data: function() {
        return {
            inputVal: this.value
        };
    },
    methods:{
        change(event){
            // this.inputVal = event.target.value;
            this.$emit('input',{
                detail:{
                    value:event.target.value
                }
            });
        }
    },
    watch:{
        value(val){
            if(val!==this.inputVal){
                this.inputVal = val;
            }
        },
        inputVal(val){
            this.$emit("update:value",val);
        }
    }
};
</script>
<style lang="less">
.red {
    color: red;
}
</style>

