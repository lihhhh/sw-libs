<!--
@author: lih
-->
<template>
    <popup-picker :title="title" :placeholder='placeholder' @on-change='onChange' :value-text-align='valueTextAlign' :data="data" :columns="columns" v-model="value" show-name></popup-picker>
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
      data: [],
      columns: 1 //列数
    };
  },

  components: {
    PopupPicker
  },

  props: {
    "value-text-align": {
      type: String,
      default: "right"
    },
    placeholder: {
      type: String,
      default: "请选择"
    },
    mode: {
      type: String,
      default: "selector" //region|time|date|multiSelector|selector
    },
    range: {
      type: Array,
      default: () => []
    }
  },

  watch: {
    range: {
      handler(range) {
        if (Array.isArray(range) && this.mode == "selector") {
          this.data = range;
        }

        // 转化为数组对象  
        this.data = this.data.map(it=>{
            if(typeof it == 'string'){
                return {
                    name:it,
                    value:it
                }
            }
            return it;
        })
      },
      deep: true,
      immediate:true
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
  created() {
    if (this.mode == "region") {
      this.data = area;
      this.columns = 3;
    }
  }
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
