
const template = `
<template>
  <web-apps :config='config'></web-apps>
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