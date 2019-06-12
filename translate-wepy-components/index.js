

import scrollView from './components/scroll-view.vue';
import button from './components/button.vue';
import view from './components/view.vue';
import text from './components/text.vue';
import swiper from './components/swiper.vue';
import swiperItem from './components/swiper-item.vue';
import image from './components/image.vue';
import navigator from './components/navigator.vue';
import repeat from './components/repeat.vue';
import input from './components/input.vue';
import webView from './components/web-view.vue';
import slider from './components/slider.vue';
import switchCom from './components/switch.vue';
import radio from './components/radio.vue';
import radioGroup from './components/radio-group.vue';
import checkbox from './components/checkbox.vue';
import checkboxGroup from './components/checkbox-group.vue';
import form from './components/form.vue';
import picker from './components/picker.vue';
import textarea from './components/textarea.vue';

const before = 'wepy-';

export default {
    install:function(Vue){
        Vue.component(before+'image',image);
        Vue.component(before+'button',button);
        Vue.component(before+'navigator',navigator);
        Vue.component(before+'swiper-item',swiperItem);
        Vue.component(before+'swiper',swiper);
        Vue.component(before+'text',text);
        Vue.component(before+'view',view);
        Vue.component(before+'scroll-view',scrollView);
        Vue.component(before+'repeat',repeat);
        Vue.component(before+'input',input);
        Vue.component(before+'web-view',webView);
        Vue.component(before+'slider',slider);
        Vue.component(before+'switch',switchCom);
        Vue.component(before+'radio',radio);
        Vue.component(before+'radio-group',radioGroup);
        Vue.component(before+'checkbox',checkbox);
        Vue.component(before+'checkbox-group',checkboxGroup);
        Vue.component(before+'form',form);
        Vue.component(before+'picker',picker);
        Vue.component(before+'textarea',textarea);
    }
}