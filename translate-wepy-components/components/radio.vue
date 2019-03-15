<!--
@author: dlhandsome
@description: 小程序表单组件radio
@link: https://mp.weixin.qq.com/debug/wxadoc/dev/component/radio.html

@properties:
value	String		<radio/> 标识。当该<radio/> 选中时，<radio-group/> 的 change 事件会携带<radio/>的value
checked	Boolean	false	当前是否选中
disabled	Boolean	false	是否禁用
color	Color		radio的颜色，同css的color
-->
<template>
  <div class="wepy_radio">
    <input
      type="radio"
      ref="ipt"
      :name="radioName"
      :checked="checked"
      :disabled="disabled"
      :value="value"
      @change="change"
    >
    <i class="wepy_icon" :style="{color: color}"></i>
  </div>
</template>
<script>
export default {
  name: "radio",

  data() {
    return {
      outputValue:'',
      radioName: "radio"
    };
  },

  props: {
    name: {
      type: String,
      default: ""
    },
    value: {
      type: String,
      default: ""
    },
    checked: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: ""
    }
  },

  methods: {
    getOutputValue() {
      var ipt = this.$refs["ipt"];
      if (ipt.checked) {
        return ipt.value;
      }
      return "";
    },
    change(e) {
      e.stopPropagation();
      
      this.outputValue = this.getOutputValue();

      this.$emit("change", {
        type: "change",
        detail: {
          value: this.value
        },
        currentTarget: this.$el
      });
    }
  },

  mounted() {
    if (this.$parent.$el.classList.contains("wepy_radio-group")) {
      this.radioName = this.$parent.$el.id;
    }
    this.outputValue = this.getOutputValue();
  }
};
</script>

<style lang="less">
@import "styles/mixin/icon-font.less";

.wepy_radio {
  display: inline-block;
}
.wepy_radio input {
  position: absolute;
  //   left: -9999em;
  opacity: 0;
}
.wepy_radio .wepy_icon:before {
  color: #c9c9c9;
  content: "\EA01";
  font-size: 23px;
  display: block;
}
.wepy_radio input:checked + .wepy_icon:before {
  color: #09bb07;
  content: "\EA06";
}
</style>
