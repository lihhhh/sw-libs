
const template = `
<template>
  <div id='web-main'>
    <div class='view-box'>
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </div>
    <div class='tabbar-box' v-if="config.tabBar.list.some(it=>'/'+it.pagePath==$route.path)">
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
    #web-main {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100vh;
        padding-bottom: 52px;
        .view-box {
            position: relative;
            flex: 1;
            overflow-y: scroll;
        }
        .tabbar-box {
            position: fixed;
            left: 0;
            bottom: 0;
            width: 100%;
            height: 52px;
            // background: pink;
        }
    }
    body {
        margin: 0;
        padding: 0;
        background: white;
    }
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