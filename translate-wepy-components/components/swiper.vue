<template>
  <vue-swiper :options="swiperOption" ref="mySwiper">
    <slot></slot>
    <!-- <wepy-swiper-item>111</wepy-swiper-item>
    <wepy-swiper-item>222</wepy-swiper-item>-->
  </vue-swiper>
</template>
 
<script>
import { swiper } from "vue-awesome-swiper";

export default {
  name: "carrousel",
  props: {
    currentItemId: {
      default: ""
    }
  },
  data() {
    return {
      swiperOption: {
        // autoplay: true
        on: {
          slideChange: (a,b,c)=>{
            console.log({...this.swiper})
            var swiperItemList = this.$el.querySelectorAll(".wepy-swiper-item");
            var activeIndex = this.swiper.activeIndex;
            var currentItemId = swiperItemList[activeIndex].getAttribute('item-id')

            this.$emit('change',{
              detail:{
                currentItemId
              }
            })
          }
        }
      }
    };
  },
  components: {
    vueSwiper: swiper
  },
  computed: {
    swiper() {
      return this.$refs.mySwiper.swiper;
    }
  },
  watch: {
    currentItemId: {
      handler(val) {
        this.$nextTick(() => {
          var swiperItemList = this.$el.querySelectorAll(".wepy-swiper-item");

          Array.from(swiperItemList).map((it, idx) => {
            if (it.getAttribute("item-id") === val) {
              this.swiper.slideTo(idx, 0, false);
            }
          });
        }, 0);
      },
      immediate: true
    }
  },
  mounted() {}
};
</script>
<style>
</style>
