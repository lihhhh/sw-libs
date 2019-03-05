

var postcss = require("postcss");
const translateTags = {
	view: "div",
	text: "span"
};

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
		var selectorArr = rule.selector.split(/([,>+\s])/);
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
	// console.log(ast.toString())
	return ast.toString();
}


var el = `
/* @web color:red; */
/* @web { color:red; } */
`;

// parsestyle(el)

module.exports = {
	parsestyle: parsestyle
}