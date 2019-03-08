
var utils = require('./libs/utils.js')
var { getOptions } = require('loader-utils');

module.exports = function (content, map, meta) {
	const options = getOptions(this);
	if(/[\/\\]vux[\/\\]/.test(this.resourcePath)){
		return content;
	}
	var html = utils.parsehtml.call(this,content);
	return html;
};