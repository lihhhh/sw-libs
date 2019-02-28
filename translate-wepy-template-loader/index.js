
var utils = require('./libs/utils.js')

module.exports = function (content, map, meta) {
	var html = utils.parsehtml(content);
	return html;
};