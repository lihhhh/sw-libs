

// var parse5 = require("parse5");
var posthtml = require("posthtml");

var tags = ['view', 'text', 'navigator', 'scroll-view', 'swiper', 'swiper-item', 'image'];

function attrPase(attr, el) {
	switch (attr.name) {
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
			if (value.indexOf('{{') >= 0) {
				attr.name = ':style';
				value = value.replace(/\{\{/g, '${').replace(/\}\}/g, '}');
				attr.value = "`" + value + "`";
			}

			value = attr.value.split(/(\d+rpx)|(\{.*?\}rpx)/);
			value = value.map(it => {
				if (/^\d+rpx$/.test(it)) {
					var num = it.replace('rpx', '');
					it = num / 2 + 'px';
				} else if (/^\{.*?\}rpx$/.test(it)) {
					it = it.replace("{", "{(").replace("}", ")/2}").replace('rpx', 'px')
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
		}
		switch (el.tag) {
			case 'block':
				el.tag = 'span';
				break;
		}

		return el;
	})

	return tree;
}
function parsehtml(html) {
	const result = posthtml()
		.use(parse)
		// .use(require('posthtml-custom-elements')())
		.process(html, { sync: true }).html
	return result;
}


var el = `
<view class="content">
    <view class="swiper-tab {{ showshadow && 'shadow'}}">
      <view class="swiper-tab-list {{type=='product' ? 'active' : ''}}" @tap="swich('product')">产品分类
      </view>
      <view class="swiper-tab-list {{type=='brand' ? 'active' : ''}}" @tap="swich('brand')">品牌分类
      </view>
    </view>
    <view class="line {{slidline?'slided':''}}"></view>
    <view hidden="{{type=='brand'}}" class="product_container">
      <scroll-view scroll-y height="{{windowHeight-40}}px" bindscroll="slide" class="product_scroll" enable-back-to-top="true">
        <view class="list_content">
          <view class="list" wx:for="{{catelist}}" wx:for-item="items" wx:key="index" wx:if="{{items.sub_cat.length>0}}">
            <image class="item_img" src="{{items.image?url+items.image:''}}" data-id="{{items.id}}" data-filter="{{items.name}}" data-title="{{items.name}}" @tap="navigatorto" />
            <view class="item_list">
              <view class="item_name of-hidden" wx:for="{{items.sub_cat}}" wx:for-item="item" data-id="{{item.id}}" data-filter="{{item.name}}" data-title="{{items.name}}" @tap="navigatorto" wx:key="item.id">{{item.name}}</view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
    <!-- <brandchoose hidden="{{type=='product'}}" :imgUrl.sync="url" @slide.user="slide_brand"></brandchoose> -->
  </view>
`

parsehtml(el)


module.exports = {
	parsehtml: parsehtml
}