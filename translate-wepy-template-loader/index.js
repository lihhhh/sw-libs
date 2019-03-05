
var utils = require('./libs/utils.js')

module.exports = function (content, map, meta) {
	if(/app\.wpy/.test(this.resourcePath)){
        debugger
    }
	var html = utils.parsehtml(content);
	return html;
};