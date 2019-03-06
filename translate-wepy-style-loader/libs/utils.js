

var postcss = require("postcss");
const translateTags = {
	view: "div",
	text: "span"
};
function getPageSpace(resourcePath) {
	var pageClass;
	if (resourcePath && /[\/\\]src[\/\\]pages[\/\\]/.test(resourcePath)) {
		resourcePath = resourcePath.replace('.wpy','')
		var resourcePathArr = resourcePath.split(/[\/\\]src[\/\\]/);
		pageClass = resourcePathArr[1].replace(/[\/\\]/, '-') + '-space';
	}
	return pageClass;
}

/* 去除注释 */
function removeNote(style) {
	style = style.replace(/:\s*\/\//gm, ':##')
	
	// 特殊注释  /* @web { color:red; } */
	style = style.replace(/\/\*\s*@web.*?\{([\s\S]*?)\}.*?\*\//gm,function(all,$1){
		return $1;
	})
	// 特殊注释  /* @web  color:red; */
	style = style.replace(/\/\*\s*@web([\s\S]*?)\*\//gm,function(all,$1){
		return $1;
	})
	// 特殊注释  // @web color:red; 
	style = style.replace(/\/\/\s*@web/gm,'')
	// 特殊注释  @web color:red; 
	style = style.replace(/@web\s*/gm,'')
	// 去除注释   
	style = style.replace(/\/+\*[\s\S]*?\*\//gm, '').replace(/([^A-Za-z\d\+\-'"\/])\/\/.*$/gm, '$1').replace(/:##/gm, '://')
	return style;
}

function parsestyle(style) {
	style = removeNote(style)
	
	var ast = postcss.parse(style);
	ast.walkRules(rule => {
		var pageClass = getPageSpace(this.resourcePath)
		if(pageClass){
			rule.selector = '.'+pageClass+' '+rule.selector;
		}
		
		var selectorArr = rule.selector.split(/([,>\+\s])/);
		selectorArr = selectorArr.map(it => {
			if (translateTags[it]) {
				return translateTags[it];
			}
			return it;
		});
		rule.selector = selectorArr.join("");
		// Transform each rule here
		rule.walkDecls(decl => {
			if (decl.value.indexOf('rpx') > -1) {
				var value = decl.value.split(/(\d+rpx)/);
				value = value.map(it => {
					if (it.indexOf('rpx') > -1) {
						var num = it.replace('rpx', '');
						it = num / 2 + 'px';
					}
					return it;
				})

				decl.value = value.join('');
			}
		});
	});
	debugger
	return ast.toString();
}


// var el = `
// .sw_input {
// 	height: 100%;
// 	width: 100%;
// 	.sw-input-placeholder {
// 	  font-size: 26rpx;
// 	  color: #888;
// 	}
// 	input {
// 	  /* @web border:none; */
// 	  height: 100%;
// 	  width: 100%;
// 	  background: rgba(249, 249, 249, 0.8);
// 	  padding: 4rpx 20rpx;
// 	}
// 	/* @web {
// 		input:focus {
// 			outline: none;
// 		  }
// 	} */
// 	textarea {
// 	  height: 100%;
// 	  width: 100%;
// 	  box-sizing: border-box;
// 	  padding: 10rpx 20rpx;
// 	  background: rgba(249, 249, 249, 0.8);
// 	}
//   }
// `;

// parsestyle(el)

module.exports = {
	parsestyle: parsestyle
}