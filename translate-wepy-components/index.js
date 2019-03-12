

import scrollView from './components/scroll-view.vue';
import view from './components/view.vue';
import text from './components/text.vue';
import swiper from './components/swiper.vue';
import swiperItem from './components/swiper-item.vue';
import image from './components/image.vue';
import navigator from './components/navigator.vue';
import repeat from './components/repeat.vue';
import input from './components/input.vue';
import webView from './components/web-view.vue';

const before = 'wepy-';

export default {
    install:function(Vue){
        Vue.component(before+'image',image);
        Vue.component(before+'navigator',navigator);
        Vue.component(before+'swiper-item',swiperItem);
        Vue.component(before+'swiper',swiper);
        Vue.component(before+'text',text);
        Vue.component(before+'view',view);
        Vue.component(before+'scroll-view',scrollView);
        Vue.component(before+'repeat',repeat);
        Vue.component(before+'input',input);
        Vue.component(before+'web-view',webView);
        
    }
}