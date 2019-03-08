<template>
    <x-input title="title" v-model="inputVal"></x-input>
</template>
<script>
import { XInput } from "vux";
export default {
    props: ['value'],
    components: {
        XInput
    },
    data: function() {
        return {
            inputVal: this.value
        };
    },
    watch:{
        value(val){
            this.inputVal = val;
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

