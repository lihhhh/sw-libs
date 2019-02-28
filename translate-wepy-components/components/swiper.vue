<template>
  <vue-swiper
    :options="swiperOption"
    ref="mySwiper"
  >
    <slot></slot>
    <!-- <wepy-swiper-item>111</wepy-swiper-item>
    <wepy-swiper-item>222</wepy-swiper-item> -->
  </vue-swiper>
</template>
 
<script>
import { swiper } from "vue-awesome-swiper";

export default {
  name: "carrousel",
  data() {
    return {
      swiperOption: {
        // some swiper options/callbacks
        // 所有的参数同 swiper 官方 api 参数
        // ...
      }
    };
  },
  components: {
    vueSwiper:swiper,
  },
  computed: {
    swiper() {
      return this.$refs.mySwiper.swiper;
    }
  },
  mounted() {
    // current swiper instance
    // 然后你就可以使用当前上下文内的swiper对象去做你想做的事了
    console.log("this is current swiper instance object", this.swiper);
    this.swiper.slideTo(3, 1000, false);
  }
};
</script>
<style>
</style>
