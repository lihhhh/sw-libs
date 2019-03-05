
var appHandle = require('./libs/utils').appHandle;

module.exports = function(content){
    if(/app\.wpy/.test(this.resourcePath)){
        content = appHandle(content)
    }
    return content;
}