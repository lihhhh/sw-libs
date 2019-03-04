<template>
  <div
    ref="element"
    class="wepy-scroll-view"
    :style="getStyle"
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
  name: "scroll-view",
  props: {
    ...TABLE_OPTIONS
  },
  data() {
    return {
      BScroll: {},
      scX: this.scrollX,
      scY: this.scrollY
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
    // scroll (e) {
    //     let elem = e.srcElement || e.currentTarget;
    //     let evt = new event('system', this.$parent.$wepy, e.type);
    //     evt.$transfor(e);
    //     this.$parent.$event = evt;
    //     let options = merge(elem, TABLE_OPTIONS);
    //     this.$emit('scroll');
    //     let upper = options['scroll-x'] ? elem.scrollLeft : elem.scrollTop;
    //     let lower = options['scroll-x'] ? (elem.scrollWidth - elem.scrollLeft - elem.clientWidth) : (elem.scrollHeight - elem.scrollTop - elem.clientHeight);
    //     if (upper <= options['upper-threshold']) {
    //         this.$emit('scrolltoupper');
    //     }
    //     if (lower <= options['lower-threshold']) {
    //         this.$emit('scrolltolower');
    //     }
    // }
  },
  watch: {
    scrollIntoView(value) {
      if (this.scrollY) {
        var offsetTop = this.$el.querySelector("#" + value).offsetTop;
        this.BScroll.scrollTo(0, -offsetTop);
      } else if (this.scrollX) {
        var offsetLeft = this.$el.querySelector("#" + value).offsetLeft;
        this.BScroll.scrollTo(-offsetLeft,0);
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
    if (this.scrollX) {
      options.scrollX = true;
    }
    if (this.scrollY) {
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
