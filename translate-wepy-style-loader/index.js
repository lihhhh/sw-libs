
var utils = require('./libs/utils.js')

module.exports = function (content, map, meta) {
	// debugger
	var style = utils.parsestyle.call(this,content);
	// debugger
	return style;
};