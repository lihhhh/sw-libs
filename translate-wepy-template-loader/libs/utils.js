

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

var tags = ['form', 'button', 'checkbox-group', 'checkbox', 'radio-group', 'radio', 'switch', 'slider', 'web-view', 'view', 'text', 'navigator', 'scroll-view', 'swiper', 'swiper-item', 'image', 'repeat', 'input'];


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
<view>
    <view class="feeding" wx:if="{{!no_login}}">
      <view catchtouchmove="doNotMove" class="{{first_into?'background_image_first':'background_image_second'}} {{show_share_page?'top_stroke':'down_stroke'}}" style="height:{{windowHeight}}px;" @tap="hide_tan()">
        <!-- <canvas style="position:absolute;top:0;left:0;width:300px;height:277px;" canvas-id="my-canvas" hidden="{{loading}}"></canvas> -->
        <!-- <view class="pet-chunk" style="background:url({{profilesConfig.SOD_SPRITE}});background-position-x:{{(profiles.SOD_NUMBER_OF_DREAM*1-1)*11}}%" wx:if="{{profiles.SOD_NUMBER_OF_PET==0&&profiles.SOD_NUMBER_OF_DREAM>0}}" @tap.stop="dreamPet"> -->
        <view class="pet-chunk" wx:if="{{profiles.SOD_NUMBER_OF_PET==0&&profiles.SOD_NUMBER_OF_DREAM>0}}" @tap.stop="dreamPet">
          <view class="fragmentation_guade" style="background:url({{profiles.SOD_NUMBER_OF_DREAM>5?'https://images.sweetown.com/miniapp/956e131b-db79-4a7b-b095-95b8f26cbe80':'https://images.sweetown.com/miniapp/3e51d9f6-5873-49cd-8abd-490cdd26d2d9'}});background-size:100% 100%;">
            <view class="fragmentation_info">Lv{{profiles.SOD_NUMBER_OF_DREAM}}</view>
          </view>
          <view class="fragmentation_pet">
            <image class="fragmentation_petsize" src="{{profiles.SOD_NUMBER_OF_DREAM>5?'https://images.sweetown.com/miniapp/0158d246-5309-470d-bb91-ee72b6596a7a':'https://images.sweetown.com/miniapp/b3ef0d69-8e9d-4207-b303-dbb421139ed2'}}"></image>
          </view>
        </view>
        <view class="tip {{tipLeft?'to_left':''}}" animation="{{tipAnimation}}" hidden="{{showSwiper}}" @tap.stop="closeTip">{{tipText}}</view>
        <zanPopup direction="top" @popupHide.user="windowHide">
          <view class="voucher_window}}" animation="{{voucherAnimation}}">
            <view class="window_bg">
              <view wx:for="{{dreamVoucher}}" wx:key="{{item.key}}" class="voucherlist list_bg_or dream_list more voucher_win" style="background-image:url({{petBg[item.profile]}})">
                <image class="window_level" src="{{winLevel[item.level]}}" />
                <view class="voucheritem">
                  <view class="price">
                    <image wx:if="{{dreamLevel[item.level]}}" class="dream_voucher_level" src="{{dreamLevel[item.level]}}" />
                  </view>
                  <view class="content line">
                    <view class="columns">
                      <view class="row">
                        <view class="header">
                          <view class="iconbg bgo" style="background:{{petColor[item.profile]}};">
                            <i class="iconfont icon-quanpingtai"></i>
                          </view>
                          <view class="title" style="color:{{petColor[item.profile]}}">{{item.name}}</view>
                        </view>
                        <view class="dreamcondition">多品类可用 各品类满减幅度不同</view>
                        <view class="date_couponuse">{{item.start_datetime}}-{{item.end_datetime}}有效</view>
                        <view class="foot" @tap.stop="get_show({{index}})">
                          <text style="padding-right:20rpx;position:absolute;bottom:0rpx">使用规则</text>
                          <!-- <i class="iconfont icon-xiangxia {{item.show?'icon_up_transition':' icon_down_transition'}}"></i> -->
                        </view>
                      </view>
                      <view class="to_use" style="color:{{petColor[item.profile]}}">
                        <text class="btn_text">恭\n喜\n发\n财</text>
                      </view>
                    </view>
                  </view>
                </view>
                <view class="rule color_rule">
                  <!-- wx:if="{{item.show}}" -->
                  <view class="des">本优惠券是多品类同时折扣优惠券,单品类商品满300生效,遵循少不多不退不补偿原则.</view>
                  <view class="vou_title">各品类可优惠金额</view>
                  <view class="rule_content">
                    <view wx:for="{{item.price_range}}" wx:for-item="price" wx:key="{{price.price}}" class="price">{{price.category.name}}\t\t￥{{price.benefit}}</view>
                  </view>
                </view>
              </view>
            </view>
            <view class="btn_left" @tap.stop="hiddenWindow">收着先</view>
            <view class="btn_right" @tap.stop="toUse">立即使用</view>
          </view>
        </zanPopup>
        <view class="my-pet" hidden="{{profiles.SOD_NUMBER_OF_PET==0}}" @tap.stop="dreamPet">
          <image mode="aspectFit" hidden="{{catchPet&&!showBox}}" src="{{info.image}}"></image>
          <image class="animation_gif" hidden="{{!catchPet||showBox}}" src="https://images.sweetown.com/miniapp/46626bc6-640e-414d-81c3-4f6d2ae892c4" />
        </view>
        <view class="gazebo" @tap.stop="dreamHourse('动面凉亭--梦想乐园')">
          <image class="gazebo_img" src="https://images.sweetown.com//miniapp/5a398e99-45b5-40f6-b2a4-9280b4aa9304"></image>
        </view>
        <view class="box" style="opacity:0" animation="{{boxAnimation}}" wx:if="{{profiles.SOD_NUMBER_OF_PET>0}}" @tap.stop="showPetVoucher">
          <image class="box_bottom" src="https://images.sweetown.com/Fn0WUcOZL_g2InZQgSTk3WgUyp8E"></image>
          <image class="box_top" animation="{{catchPetAnimation2.top}}" src="https://images.sweetown.com/FvkfsP_BMdhiGv5K-RSOLL-Yx3Ut" />
        </view>
        <view class="dream_house" style="top:{{statusBarHeight+52}}px" @tap.stop="dreamHourse('梦想乐园')">
          <image class="house_img" mode="aspectFit" src="https://images.sweetown.com//miniapp/5a398e99-45b5-40f6-b2a4-9280b4aa9304"></image>
          <!-- 梦想乐园 -->
          <view class="box_name">{{profilesConfig.SOD_VIEW_HISTORY_MAIN_BTN_TEXT}}</view>
        </view>
        <!-- 投喂加速 -->
        <view class="dream_house accelerate" style="top:{{statusBarHeight+112}}px" @tap.stop="feedSpeed()" wx:if="{{profiles.SOD_NUMBER_OF_PET==0}}">
          <image class="house_img" mode="aspectFit" src="https://images.sweetown.com//miniapp/bb5f688e-83b5-4148-9c37-1c374eb381b6"></image>
          <view class="box_name">{{profilesConfig.SOD_FEED_MON_MAIN_BTN_TEXT}}</view>
        </view>
        <!-- 梦兽属性 有补梦兽时显示-->
        <view class="dream_house accelerate" style="top:{{statusBarHeight+112}}px" @tap.stop="dreamPet" wx:if="{{profiles.SOD_NUMBER_OF_PET>0}}">
          <image class="house_img" mode="aspectFit" src="https://images.sweetown.com/FomS1KrkOOnpd391TlEDsmdiiJm4"></image>
          <view class="box_name">{{profilesConfig.SOD_VIEW_DREAMPET_MAIN_BTN_TEXT}}</view>
        </view>
        <!-- 打卡签到 -->
        <view class="dream_house sign_in" style="top:{{statusBarHeight+172}}px" @tap.stop="signIn()">
          <image class="house_img" mode="aspectFit" src="https://images.sweetown.com//miniapp/d5337aaf-7d39-4c97-96f0-211fd5c1e64e"></image>
          <view class="box_name">{{profilesConfig.SOD_CHECKIN_MAIN_BTN_TEXT}}</view>
        </view>
        <!-- 逮住梦想 -->
        <view class="dream_house catch_dream" style="top:{{statusBarHeight+232}}px" @tap.stop="catchDream">
          <view class="catch_again" wx:if="{{info.catchAgain>0}}">
            <view class="outer"></view>
            <view class="pie"></view>
            <view class="again_time">{{info.catchAgain}}天</view>
          </view>
          <image class="house_img" mode="aspectFit" src="https://images.sweetown.com/FvMzXZ_m4CTCtACw49LrV3VuyX6J"></image>
          <view class="box_name">{{profilesConfig.SOD_VIEW_CATCHDREAM_MAIN_BTN_TEXT}}</view>
        </view>
        <view class="blank_bottom" wx:if="{{show_share_page}}">
          <image class="blank_img" src="https://images.sweetown.com//miniapp/9703368f-755f-4f57-aa19-3011de748c00"></image>
        </view>
      </view>
      <view catchtouchmove="doNotMove" class="feedinfo_frame {{show_share_page?'top_frame':'down_frame'}}" wx:if="{{!first_into&&slide_frame}}">
        <view class="feed_people_box">
          <view class="people_info">
            <view class="image_box {{count>=1?'have_people':'no_people'}}">
              <image class="people_img" src="{{share_list.length>0&&share_list[0].shared_user.image}}" wx:if="{{count>=1}}"></image>
              <view class="share-box" wx:if="{{count==0}}">
                <i class=" iconfont add_people icon-add1"></i>
                <button open-type="share" class="gotofeed_frame"></button>
              </view>
            </view>
            <view class="people_name" wx:if="{{count>=1}}">{{share_list.length>0&&share_list[0].shared_user.name}}</view>
          </view>
          <view class="people_info">
            <view class="image_box {{count>=2?'have_people':'no_people'}}">
              <image class="people_img" src="{{share_list.length>0&&share_list[1].shared_user.image}}" wx:if="{{count>=2}}"></image>
              <view class="share-box" wx:if="{{count<2}}">
                <i class=" iconfont add_people icon-add1"></i>
                <button open-type="share" class="gotofeed_frame"></button>
              </view>
            </view>
            <view class="people_name" wx:if="{{count>=2}}">{{share_list.length>0&&share_list[1].shared_user.name}}</view>
          </view>
          <view class="people_info">
            <view class="image_box  {{count>=3?'have_people':'no_people'}}">
              <image class="people_img" src="{{share_list.length>0&&share_list[2].shared_user.image}}" wx:if="{{count>=3}}"></image>
              <view class="share-box" wx:if="{{count<3}}">
                <i class=" iconfont add_people icon-add1"></i>
                <button open-type="share" class="gotofeed_frame"></button>
              </view>
            </view>
            <view class="people_name" wx:if="{{count>=3}}">{{share_list.length>0&&share_list[2].shared_user.name}}</view>
          </view>
        </view>
        <view class="feed_info">
          <view class="text_info">已有
            <view class="num_info">{{count}}</view>人投喂，还有
            <view class="num_info">{{3-count}}</view>次投喂机会</view>
        </view>
        <view class="gotofeed">
          <button open-type="share" class="gotofeed_frame">{{profilesConfig.SOD_FEED_SHARE_BTN_TEXT}}</button>
        </view>
        <view class="receive_dream" @tap="refreshFriendList()">
          <view class="receivedream_frame">刷新
            <i class=" iconfont icon_refresh icon-refresh"></i>
          </view>
        </view>
      </view>
      <view class="deadline {{!first_into?'top_deadline':'down_deadline'}}" wx:if="{{!first_into&&show_share_page}}">
        <view class="bothside_line_left"></view>
        <view class="dream_text">已有{{profilesConfig.SOD_DREAM_COMPLETED}}人完成梦想</view>
        <view class="bothside_line_right"></view>
      </view>
      <!-- 许愿弹框 -->
      <chunkPop wx:if='{{showSwiper}}' @right.user="sendHope" :day.sync="day" :text.sync="chunkText" :profiles.sync="profilesConfig" :maskchunk.sync="feedmaskchunk"></chunkPop>
      <Sayhello class="{{showBulletBox&&'box_filter'}}" @right.user="rightHello" wx:if="{{showHello}}" :profiles.sync="profilesConfig"></Sayhello>
      <!-- 梦想属性 -->
      <SwDrawer mode="bottom" :visible.sync="showLeft1" @close.user="toggle">
        <view class="demo-container">
          <historyContainer :canScroll.sync="canScroll" :info.sync="info" :profiles.sync="profilesConfig" image="true">
            <scroll-view scroll-y class="list" enable-back-to-top="true" scroll-into-view="{{current_itemid}}" scroll-top="{{gototop}}">
              <view class="voucher" id="classic_price">
                <view class="pet-det">
                  <view class="pet-det-item" wx:for="{{voucherList}}" wx:key="index">
                    <image src="{{item.category.icon}}"></image>
                    <!-- style="{{index%2>0?'margin-left:20rpx;':''}}" -->
                    <view class="pet-det-item-right ">
                      <view class="pet-det-item-name {{item.pricepet<maximum?'minnum':'maxnum'}}" wx:if="{{profiles.SOD_NUMBER_OF_PET>0}}">{{item.category.name}}</view>
                      <view class="pet-det-item-name {{item.price<maximum?'minnum':'maxnum'}}" wx:if="{{profiles.SOD_NUMBER_OF_PET==0}}">{{item.category.name}}</view>
                      <view class="pet-det-item-price {{item.pricepet<maximum?'minnum':'maxnum'}} {{item.min>=10&&item.max>=100?'numlong':'num_normal'}}" wx:if="{{profiles.SOD_NUMBER_OF_PET>0}}">¥ {{item.min?item.min:'0'}} - ¥ {{item.max?item.max:'0'}}</view>
                      <span class="pet-det-item-price {{item.price<maximum?'minnum':'maxnum'}}" wx:if="{{profiles.SOD_NUMBER_OF_PET==0}}">¥ {{item.price}}</span>
                    </view>
                  </view>
                </view>
              </view>
              <view class="voucher_tip" wx:if="{{profiles.SOD_NUMBER_OF_PET>0}}">捕梦兽的各品类属性值实际为“叼劵”的能力值</view>
              <view class="voucher_tip" wx:if="{{profiles.SOD_NUMBER_OF_PET==0}}">* 唐仔可作为优惠券使用，养成捕梦兽可捕获梦想优惠券</view>
              <view class="dream_voucher">
                <view class="list_title">
                  <view class="pet_name">{{info.name}}の战绩</view>
                  <view class="more_voucher" @tap="goto_morecoupon()" wx:if="{{catchdreamVoucherList.length>0}}">查看更多 <i class="iconfont iconfontright icon-right  "></i></view>
                </view>
              </view>
              <scroll-view class="voucher_container" scroll-x scroll-with-animation wx:if="{{profiles.SOD_NUMBER_OF_PET>0&&catchdreamVoucherList.length>0}}">
                <view wx:for="{{catchdreamVoucherList}}" wx:key="{{item.key}}" class="voucherlist list_bg_or {{item.show?'more':''}}  dream_list" style="background-image:url({{petBg[info.profile]}})">
                  <view class="voucheritem">
                    <view class="price">
                      <image wx:if="{{dreamLevel[item.level]}}" class="dream_voucher_level" src="{{dreamLevel[item.level]}}"></image>
                    </view>
                    <view class="content {{item.show?'line':''}}">
                      <view class="columns">
                        <view class="row">
                          <view class="header">
                            <view class="iconbg bgo" style="background:{{petColor[item.profile]}};">
                              <i class="iconfont icon-quanpingtai"></i>
                            </view>
                            <view class="title" style="color:{{petColor[item.profile]}}">{{item.name}}</view>
                          </view>
                          <view class="dreamcondition">多品类可用 各品类满减幅度不同</view>
                          <view class="date_couponuse">{{item.start_datetime}}-{{item.end_datetime}}有效</view>
                          <view class="foot" @tap.stop="show_rule({{index}})">
                            <text style="padding-right:20rpx;position:absolute;bottom:0rpx">使用规则</text>
                            <i class="iconfont icon-xiangxia {{item.show?'icon_up_transition':' icon_down_transition'}}"></i>
                          </view>
                        </view>
                        <view class="to_use" style="color:{{petColor[item.profile]}};{{item.is_used?'margin-left:-24rpx;':''}}">
                          <text wx:if="{{!item.is_used}}" @tap.stop="toUse" class="btn_text">立\n即\n使\n用</text>
                          <i wx:if="{{item.is_used}}" class="iconfont icon-yishiyong used_size"></i>
                        </view>
                      </view>
                    </view>
                  </view>
                  <view class="rule">
                    <view class="des">本优惠券是多品类同时折扣优惠券,单品类商品满300生效,遵循少不多不退不补偿原则.</view>
                    <view class="vou_title">各品类可优惠金额</view>
                    <view class="rule_content">
                      <view wx:for="{{item.price_range}}" wx:for-item="price" wx:key="{{price.price}}" class="price">{{price.category.name}}\t\t￥{{price.benefit}}</view>
                    </view>
                  </view>
                </view>
              </scroll-view>
              <view class="blankpet_tip" wx:if="{{profiles.SOD_NUMBER_OF_PET>0&&catchdreamVoucherList.length==0}}">{{CAPTURE_PET_RECORD}}</view>
              <view class="blankpet_tip" wx:if="{{profiles.SOD_NUMBER_OF_PET==0}}">{{dayRecordinfo?dayRecordinfo:"唐仔试图挑战脆皮猪，被坐成了肉饼"}}</view>
            </scroll-view>
          </historyContainer>
        </view>
      </SwDrawer>
      <!-- 合成宠物 -->
      <petShow @right.user="closeBulletBox" :showBulletBox.sync="petShowBox" :petInfo.sync="info" :profiles.sync="profilesConfig"></petShow>
      <!-- 获得碎片 -->
      <bulletBox @right.user="closeBulletBox" :showBulletBox.sync="showBulletBox" :delayImg.sync="delayImg" :profiles.sync="profilesConfig"></bulletBox>
      <bulletBoxnew @right.user="closeBulletBoxNew" :showBulletBoxNew.sync="showBulletBoxNew" :delayImgNew.sync="delayImgNew" :profiles.sync="profilesConfig"></bulletBoxnew>
      <Loading wx:if="{{loading}}"></Loading>
    </view>
    <view wx:if="{{no_login}}">
      <placeholder :show.sync="no_login" type="no_login" title="您还没有登陆无法进行操作" message="快去登陆再来看看吧"></placeholder>
      <view class="btn_view">
        <view class="login_button" @tap="toLogin">立即登录</view>
      </view>
    </view>
  </view>
`

parsehtml(el)


module.exports = {
	parsehtml: parsehtml
}