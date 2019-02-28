

var parse5 = require("parse5");

var tags = ['view', 'text', 'navigator', 'scroll-view', 'swiper', 'swiper-item', 'image'];
function deep(rows, cb) {
	if (Array.isArray(rows)) {
		rows.map(it => {
			cb(it)
			if (it.childNodes) {
				deep(it.childNodes, cb)
			}
		})
	} else {
		deep([rows], cb)
	}
}

function parsehtml(html) {
	var el = parse5.parseFragment(html);
	deep(el, function (it) {
		it.attrs && it.attrs.map(attr => {
			debugger
			switch (attr.name) {
				case 'wx:for':
					var value = attr.value.replace(/\{\{(.*?)\}\}/, '$1')
					var forItem = it.attrs.find(item => item.name == 'wx:for-item')
					var forIndex = it.attrs.find(item => item.name == 'wx:for-index')
					var key = forItem ? forItem.value : 'item';
					var index = forIndex ? forIndex.value : 'index';
					attr.value = `(${key},${index}) in ${value}`;
					attr.name = 'v-for';
					break;
				case 'wx:key':
					attr.value = attr.value.replace(/\{\{(.*?)\}\}/, '$1')
					attr.name = ':key';
					break;
				case 'wx:if':
					if (/\{\{/.test(attr.value)) {
						attr.value = attr.value.replace(/[\{\}]/g, '')
						attr.name = 'v-if';
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
					if (tags.indexOf(it.tagName) >= 0) {
						attr.name = attr.name + '.native'
					}
					break;
				case '@tap':
					attr.value = attr.value.replace(/[\{\}]/g, '')
					attr.name = '@click';
					if (tags.indexOf(it.tagName) >= 0) {
						attr.name = attr.name + '.native'
					}
					break;
				case 'bindload':
					attr.value = attr.value.replace(/[\{\}]/g, '')
					attr.name = '@load';
					break;
				case 'bindscroll':
					attr.value = attr.value.replace(/[\{\}]/g, '')
					attr.name = '@scroll';
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
					if (value.indexOf('{{')>=0) {
						attr.name = ':style';
						value = value.replace(/\{\{/g, '${').replace(/\}\}/g, '}');
						attr.value = "`" + value + "`";
					}

					value = attr.value.split(/(\d+rpx)|(\{.*?\}rpx)/);
					value = value.map(it => {
						if (/^\d+rpx$/.test(it)) {
							var num = it.replace('rpx', '');
							it = num / 2 + 'px';
						} else if(/^\{.*?\}rpx$/.test(it)){
							it = it.replace("{","{(").replace("}",")/2}").replace('rpx','px')
						}
						return it;
					})

					attr.value = value.join('');

					break;
				default:
					// 开头为 ：@ 或者value里面没有 {}   或者以非字母或{开头
					if (/^[:@]/.test(attr.name) || !/[\{\}]/.test(attr.value) || /$[^\w\{}]/.test(attr.value)) return;
					var vueName = ':' + attr.name;
					if (it.attrs.some(it => it.name == vueName)) return;
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
		})

		if (it.tagName == 'img' && it.attrs.some(it => it.name == 'mode')) it.tagName = 'image';
		if (tags.indexOf(it.tagName) >= 0) {
			it.tagName = 'wepy-' + it.tagName;
		}
		switch (it.tagName) {
			case 'block':
				it.tagName = 'span';
				break;
		}
	})

	html = parse5.serialize(el);

	// console.log(html)
	return html;
}


var el = `
<orderItem :imgurl.sync="imgurl" :orderList.sync="orderList"></orderItem>
`

parsehtml(el)


module.exports = {
	parsehtml: parsehtml
}