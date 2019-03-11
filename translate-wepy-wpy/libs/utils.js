
const template = `
<template>
  <div id='web-main' :class="{'web-show-tabbar':config&&config.tabBar&&config.tabBar.list.some(it=>'/'+it.pagePath==$route.path)}">
    <div class='view-box'>
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </div>
    <div class='tabbar-box' v-if="config&&config.tabBar&&config.tabBar.list.some(it=>'/'+it.pagePath==$route.path)">
      <tabbar >
        <tabbar-item v-for='(it,index) in config.tabBar.list' :selected="'/'+it.pagePath==$route.path" :key="index" :link="'/'+it.pagePath">
          <img slot="icon" src="'/'+{{it.iconPath}}">
          <img slot="icon-active" src="'/'+{{it.selectedIconPath}}">
          <span slot="label">{{it.text}}</span>
        </tabbar-item>
      </tabbar>
    </div>
  </div>
</template>
`;

const appStyle = `
    
`;

function _appHandle(content) {
    content = content.replace(/(<\/style>)/m,'\r\n'+appStyle+'\r\n</style>')
    content = template+'\r\n'+content ;
    return content;
}

var content = `
<style lang="less">
  @import "./styles/base";
  @import "./styles/icon";
  @import "./styles/style";
  @import "./styles/font";
  @import "./styles/animation";
</style>

<script>
</script>

`;
_appHandle(content)
exports.appHandle = _appHandle;