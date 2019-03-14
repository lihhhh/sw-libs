<template>
  <vue-swiper-slide>
      <slot></slot>
  </vue-swiper-slide>
</template>
 
<script>
import { swiperSlide } from "vue-awesome-swiper";

export default {
  name:'wepy-swiper-item',
  data() {
    return {
    };
  },
  components: {
    vueSwiperSlide:swiperSlide
  },
  mounted() {
  }
};
</script>
<style>
</style>
