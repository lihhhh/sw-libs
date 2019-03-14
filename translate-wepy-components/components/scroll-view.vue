<template>
  <div
    ref="element"
    class="wepy-scroll-view"
    :style="getStyle"
    @touchstart="touchStart"
  >
    <div>
      <slot></slot>
    </div>
  </div>
</template>
<script>
import event from "../event";
import util from "../util";
import BScroll from "better-scroll";
let TABLE_OPTIONS = {
  "scroll-x": {
    // type: Boolean,
    default: false
  },
  "scroll-y": {
    // type: Boolean,
    default: false
  },
  "upper-threshold": {
    type: Number,
    default: 50
  },
  "lower-threshold": {
    type: Number,
    default: 50
  },
  "scroll-top": {
    type: Number,
    default: 0
  },
  "scroll-left": {
    type: Number,
    default: 0
  },
  "scroll-into-view": {
    type: String,
    default: ""
  },
  "scroll-with-animation": {
    type: Boolean,
    default: false
  },
  "enable-back-to-top": {
    // type: Boolean,
    default: false
  },
  bindscroll: {}
};
let TABLE_EVENT = {
  scrolltoupper: null,
  scrolltolower: null,
  scroll: null
};
export default {
  name: "wepy-scroll-view",
  props: {
    ...TABLE_OPTIONS
  },
  data() {
    var scX = this.scrollX;
    scX = scX===''?true:scX;
    var scY = this.scrollY;
    scY = scY===''?true:scY;
    return {
      BScroll: {},
      scX: scX,
      scY: scY
    };
  },
  computed: {
    getStyle() {
      var style = {};
      if (this.scrollX) {
        style["overflow-x"] = "hidden";
      } else {
        style["overflow-y"] = "hidden";
      }
      return style;
    }
  },
  methods: {
    touchStart(){
      this.BScroll.refresh()
    }
  },
  watch: {
    scrollIntoView(value) {
      this.BScroll.refresh()
      if (this.scY) {
        var offsetTop = this.$el.querySelector("#" + value).offsetTop;
        this.BScroll.scrollTo(0, -offsetTop,300);
      } else if (this.scX) {
        var offsetLeft = this.$el.querySelector("#" + value).offsetLeft;
        this.BScroll.scrollTo(-offsetLeft,0,300);
      }
    }
  },
  mounted() {
    var options = {
      probeType: "2",
      click: true,
      tap: true,
      mouseWheel: true,
      pullUpLoad: true
    };
    if (this.scX) {
      options.scrollX = true;
    }
    if (this.scY) {
      options.scrollY = true;
    }
    
    this.BScroll = new BScroll(this.$refs["element"], options);

    this.BScroll.on("scroll", e => {
      var evt = {
        detail: {
          scrollTop: Math.abs(parseFloat(e.y))
        },
        currentTarget: {
          dataset: util.setDataset(this.$refs["element"])
        }
      };
      this.$emit("scroll", evt);
    });

    this.BScroll.on("pullingUp", e => {
      var evt = {};
      this.$emit("scrolltolower", evt);
    });
  }
};
</script>
<style lang="less">
</style>
