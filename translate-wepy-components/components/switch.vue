<!--
@author: Gcaufy
@description: 小程序基础组件switch
@link: https://mp.weixin.qq.com/debug/wxadoc/dev/component/switch.html

@properties:
checked Boolean false   是否选中
type    String  switch  样式，有效值：switch, checkbox
bindchange  EventHandle     checked 改变时触发 change 事件，event.detail={ value:checked}
color   Color       switch 的颜色，同 css 的 color
-->
<template>
    <input
        class="wepy_switch"
        type="checkbox"
        ref="ipt"
        :style="{backgroundColor: color}"
        @click="click($event)"
    >
</template>
<script>
import { numberValidator, stringToBoolean } from "../helper/util";
import event from "../event";

export default {
  name: "wepy-switch",

  props: {
    name: {
      type: String,
      default: ""
    },
    checked: {
      type: [Boolean, String],
      default: false,
      coerce: stringToBoolean()
    },
    // TODO type="checkbox" do not work
    type: {
      type: String,
      default: "switch"
    },
    color: {
      type: String,
      default: "#04BE02"
    }
  },
  data: function() {
    return {
      outputValue: ""
    };
  },
  methods: {
    getChecked() {
      return this.$refs["ipt"].checked;
    },
    click(e) {
      this.outputValue = this.getChecked();
      this.$emit("change", {
        type: "change",
        detail: {
          value: this.outputValue
        },
        currentTarget: this.$el
      });
    }
  }
};
</script>

<style lang="less">
.wepy_switch {
  -webkit-appearance: none;
  appearance: none;
  position: relative;
  width: 52px;
  height: 32px;
  border: 1px solid #dfdfdf;
  outline: 0;
  border-radius: 16px;
  box-sizing: border-box;
  background-color: #dfdfdf;
  -webkit-transition: background-color 0.1s, border 0.1s;
  transition: background-color 0.1s, border 0.1s;
  &:checked {
    border-color: #04be02;
    background-color: #04be02;
    &:before {
      transform: scale(0);
    }
    &:after {
      transform: translateX(20px);
    }
  }
  &:before {
    content: " ";
    position: absolute;
    top: 0;
    left: 0;
    width: 50px;
    height: 30px;
    border-radius: 15px;
    background-color: #fdfdfd;
    transition: transform 0.35s cubic-bezier(0.45, 1, 0.4, 1);
  }
  &:after {
    content: " ";
    position: absolute;
    top: 0;
    left: 0;
    width: 30px;
    height: 30px;
    border-radius: 15px;
    background-color: #ffffff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
    transition: transform 0.35s cubic-bezier(0.4, 0.4, 0.25, 1.35);
  }
}
</style>
