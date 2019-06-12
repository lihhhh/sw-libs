<!--
@author: lih
-->
<template>
    <textarea @input="onChange" :disabled='disabled' :placeholder="placeholder" name="" spellcheck="false"></textarea>
    <!-- <group title="">
        <x-textarea :max='Number(maxlength)' :disabled='disabled' @on-change='onChange' name="detail" :placeholder="placeholder" :show-counter="false"></x-textarea>
    </group> -->
</template>
<script>

export default {
  name: "wepy-view",
  data() {
    return {};
  },

  props: {
    maxlength: {
      type: [Number, String],
      default: 140
    },
    placeholder: {
      type: String,
      default: ""
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },

  methods: {
      onChange(value){
          this.$emit('input',{
              detail:{
                  value:value.target.value
              }
          })
      }
  }
};
</script>
<style lang="less">
.wepy-textarea {
    border:none;
    resize:none;
    outline: none;
}
</style>

