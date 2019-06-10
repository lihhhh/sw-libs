<template>
  <!-- <x-input title="title" v-model="inputVal"></x-input> -->
  <input v-model="inputVal" autocomplete="off" @input="change">
</template>
<script>
export default {
  name: "wepy-input",
  props: {
    name: {
      type: String,
      default: ""
    },
    value: {
      default: ""
    }
  },
  computed:{
    outputValue(){
      return this.inputVal;
    }
  },
  data: function() {
    return {
      inputVal: this.value
    };
  },
  methods: {
    change(event) {
      // this.inputVal = event.target.value;
      this.$emit("input", {
        detail: {
          value: event.target.value
        }
      });
    }
  },
  watch: {
    value(val) {
      if (val !== this.inputVal) {
        this.inputVal = val;
      }
    },
    inputVal(val) {
      this.$emit("update:value", val);
    }
  }
};
</script>
<style lang="less">
.wepy-input {
  display: block;
  width: 100%;
  height: 22px;
  text-overflow: clip;
  overflow: hidden;
  white-space: nowrap;
  font-family: UICTFontTextStyleBody;
  min-height: 22px;
  font-size: 14px;
  border: none;
}
.wepy-input:focus {
  outline: none;
}
</style>

