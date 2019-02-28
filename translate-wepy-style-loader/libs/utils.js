

var postcss = require("postcss");
const translateTags = {
	view: "div",
	text: "span"
};

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

function parsestyle(style) {
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
	debugger
	return ast.toString();
}


var el = `
.red {
	color:red;
}
`;

// parsestyle(el)

module.exports = {
	parsestyle: parsestyle
}