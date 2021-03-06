

// var parse5 = require("parse5");
var posthtml = require("posthtml");

// 非以下标签会自动闭合
var html5tags = [
	'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'blockquote',
	'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'datalist', 'dd', 'del', 'details', 'dfn',
	'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form',
	'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hr', 'html', 'iframe', 'img', 'input', 'ins', 'kbd', 'keygen',
	'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'menu', 'menuitem', 'meta', 'meter', 'nav', 'noscript', 'object',
	'ol', 'optgroup', 'option', 'output', 'p', 'param', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp',
	'script', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup',
	'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr'
];

var tags = ['form',
	'button',
	'checkbox-group',
	'checkbox',
	'radio-group',
	'radio',
	'switch',
	'slider',
	'web-view',
	'view',
	'text',
	'navigator',
	'scroll-view',
	'swiper',
	'swiper-item',
	'image',
	'repeat',
	'input',
	'picker',
	'textarea',
	'rich-text'
];


function getPageSpace(resourcePath) {
	var pageClass;
	if (resourcePath && /[\/\\]src[\/\\]pages[\/\\]/.test(resourcePath)) {
		resourcePath = resourcePath.replace('.wpy', '')
		var resourcePathArr = resourcePath.split(/[\/\\]src[\/\\]/);
		pageClass = resourcePathArr[1].replace(/[\/\\]/g, '-') + '-space';
	}
	return pageClass;
}

function attrPase(attr, el) {
	if (/^@/.test(attr.name)) {
		attr.name = attr.name.replace('.user', '')
	}
	if (/^bind/.test(attr.name)) {
		attr.name = attr.name.replace('bind', '@')
		attr.value = attr.value.replace(/[\{\}]/g, '')
	}
	switch (attr.name) {
		case 'for':
		case 'wx:for':
			var value = attr.value.replace(/\{\{(.*?)\}\}/, '$1')
			var forItem = el.attrs.find(item => item.name == 'wx:for-item')
			var forIndex = el.attrs.find(item => item.name == 'wx:for-index')

			var key = forItem ? forItem.value : 'item';
			var index = forIndex ? forIndex.value : 'index';
			attr.value = `(${key},${index}) in ${value}`;
			attr.name = 'v-for';
			break;
		case 'wx:key':
			attr.value = attr.value.replace(/^.*\{\{(.*?)\}\}.*$/, '$1')
			attr.name = ':key';
			break;
		case 'wx:if':
			attr.name = 'v-if';
			if (/\{\{/.test(attr.value)) {
				attr.value = attr.value.replace(/[\{\}]/g, '')
			}
			break;
		case 'wx:elif':
			attr.name = 'v-else-if';
			if (/\{\{/.test(attr.value)) {
				attr.value = attr.value.replace(/[\{\}]/g, '')
			}
			break;
		case 'wx:else':
			attr.name = 'v-else';
			if (/\{\{/.test(attr.value)) {
				attr.value = attr.value.replace(/[\{\}]/g, '')
			}
			break;
		case 'hidden':
			if (/\{\{/.test(attr.value)) {
				attr.value = '!(' + attr.value.replace(/[\{\}]/g, '') + ")"
				attr.name = 'v-show';
			}
			break;
		case '@tap.stop':
			attr.value = attr.value.replace(/[\{\}]/g, '')
			attr.name = '@click.stop';
			if (tags.indexOf(el.tag) >= 0) {
				attr.name = attr.name + '.native'
			}
			break;
		case '@touchstart.stop':
		case '@touchend.stop':
		case '@touchmove.stop':
			attr.value = attr.value.replace(/[\{\}]/g, '')
			if (tags.indexOf(el.tag) >= 0) {
				attr.name = attr.name + '.native'
			}
			break;
		case '@tap':
			attr.value = attr.value.replace(/[\{\}]/g, '')
			attr.name = '@click';
			if (tags.indexOf(el.tag) >= 0) {
				attr.name = attr.name + '.native'
			}
			break;
		case 'bindload':
			attr.value = attr.value.replace(/[\{\}]/g, '')
			attr.name = '@load';
			break;
		case 'src':
			if (/^http/.test(attr.value)) return;
			attr.name = ':src';
			if (/\{\{/.test(attr.value)) {
				attr.value = attr.value.replace(/[\{\}]/g, '')
			} else {
				attr.value = "require('" + attr.value + "')";
			}
			break;
		case 'style':
			var value = attr.value;
			if (value.indexOf('{{') >= 0) {
				attr.name = ':style';
				value = value.replace(/\{\{/g, '${').replace(/\}\}/g, '}');
				attr.value = "`" + value + "`";
			}

			value = attr.value.split(/(\d+rpx)|(\{.*?\}rpx)/);
			value = value.map(it => {
				if (/^\d+rpx$/.test(it)) {
					var num = it.replace('rpx', '');
					it = num / 7.5 + 'vw';
				} else if (/^\{.*?\}rpx$/.test(it)) {
					it = it.replace("{", "{(").replace("}", ")/7.5}").replace('rpx', 'vw')
				}
				return it;
			})

			attr.value = value.join('');

			break;
		default:
			// 开头为 ：@ 或者value里面没有 {}   或者以非字母或{开头
			if (/^[:@]/.test(attr.name) || !/[\{\}]/.test(attr.value) || /$[^\w\{}]/.test(attr.value)) return;
			var vueName = ':' + attr.name;
			if (el.attrs.some(it => it.name == vueName)) return;
			var value = attr.value;

			// 两种情况  一种   "{{aa}}"   一种 "aa {{bb}}"
			if (/^\{\{[^\{\}]*\}\}$/.test(value)) {
				attr.value = value.replace(/[\{\}]/g, '');
			} else {
				value = value.replace(/\{\{/g, '${').replace(/\}\}/g, '}');
				attr.value = "`" + value + "`";
			}

			attr.name = vueName;
			break;
	}
}

function parse(tree) {
	tree.walk(function (el) {
		if (typeof el !== 'object') return el;
		var attrs = el.attrs;

		if (attrs) {
			el.attrs = [];
			for (var k in attrs) {
				var attr = {
					name: k,
					value: attrs[k]
				};
				el.attrs.push(attr);
			}

			var newAttrs = {};
			for (var k in attrs) {
				var attr = {
					name: k,
					value: attrs[k]
				};

				attrPase(attr, el);

				newAttrs[attr.name] = attr.value;
			}

			el.attrs = newAttrs;
		}

		if (el.tag == 'img' && Object.keys(el.attrs || {}).some(it => el.name == 'mode')) el.tag = 'image';
		if (tags.indexOf(el.tag) >= 0) {
			el.tag = 'wepy-' + el.tag;

			// 添加与标签名同名的class
			el.attrs = el.attrs || {};
			el.attrs.class = el.attrs.class || '';
			if (el.attrs.class.indexOf(el.tag) === -1) {
				el.attrs.class += ' ' + el.tag;
			}
		}
		switch (el.tag) {
			case 'block':
				el.tag = 'template';
				delete el.attrs[':key'];
				break;
		}

		return el;
	})

	return tree;
}

/**
 * 
 * @param {String} html 
 * 
 * 标签自动补全
 */
function autoCloseTag(html) {
	var flags = {
		length: 0
	};

	html = html.replace(/(".*?")|('.*?')/g, function (all, $1) {
		var len = flags.length;
		flags.length += 1;
		flags[len] = all;
		return '[$' + len + ']';
	})

	html = html.replace(/<([a-zA-Z\-_]+)[^<>]*\/>/g, function (all, tagName) {
		if (html5tags.indexOf(tagName) == -1) {
			var out = `${all.replace('/>', '>')}</${tagName}>`;
			return out;
		}
		return all;
	})

	html = html.replace(/\[\$(\d+)\]/g, function (all, $1) {
		return flags[$1];
	})
	return html;
}

function parsehtml(html) {
	var pageClass = getPageSpace(this.resourcePath)
	if (pageClass) {
		html = `<view class="${pageClass}">\r\n${html}</view>\r\n`;
	}

	var html = autoCloseTag(html);

	const result = posthtml()
		.use(parse)
		// .use(require('posthtml-custom-elements')())
		.process(html, {
			sync: true
		}).html

	return result;
}


var el = `

`

parsehtml(el)


module.exports = {
	parsehtml: parsehtml
}