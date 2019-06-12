<!--
@author: lih
-->
<template>
    <popup-picker :title="title" :placeholder='placeholder' @on-change='onChange' value-text-align='left' :data="list3" :columns="3" v-model="value" show-name></popup-picker>
</template>
<script>
import { PopupPicker } from "vux";
import area from "../libs/map/area";

export default {
  name: "wepy-view",
  data() {
    return {
      isHover: false,
      title: "",
      value: [],
      list3: area
    };
  },

  components: {
    PopupPicker
  },

  props: {
    placeholder: {
      type: String,
      default: "请选择"
    },
    mode: {
      type: String,
      default: "selector" //region|time|date|multiSelector|selector
    }
  },

  methods: {
    onChange(code) {
      var data;
      if (this.mode == "region") {
        var value = [];

        code.map(item => {
          area.map(it => {
            if (it.value == item) {
              value.push(it.name);
            }
          });
        });
        data = {
          code,
          value: value,
          postcode: ""
        };
      }
      this.$emit("change", {
        detail: data
      });
    }
  },
  created() {}
};
</script>
<style lang="less">
.wepy-picker {
  height: 100%;
  > div {
    height: 100%;
  }
}
</style>
