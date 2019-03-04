var babylon = require("babylon")
let traverse = require("babel-traverse").default;
let generate = require("babel-generator").default;
let t = require("@babel/types");

parse(`
export default class extends wepy.app {
	constructor(){

	}
}
`);
function parse(content, map, meta) {
	var ast = babylon.parse(content, {
		sourceType: 'module',
		plugins: [
			'classProperties',
			'asyncGenerators',
			'objectRestSpread'
		]
	})


	traverse(ast, {
		ClassBody(path) {
			var keyName = [
				"data",
				// "onLoad",
				//   "onLaunch",
				"constructor",
				"onShow",
				"onHide",
				"onReady",
				"methods",
				"components",
				"watch",
				"computed",
				"events",
				"props",
				"created"
			];
			
			var node = path.node;

			// 没有data就添加  data={}
			var _data = node.body.find(it => it.key.name == "data");
			if (!_data) {
				_data = t.classProperty(t.identifier("data"), t.objectExpression([]));
				node.body.push(_data);
			}
			var com = node.body.find(it => it.key.name == "components");
			
			if (com) {
				var _com = t.objectProperty(t.identifier("_com"), t.objectExpression([]));
				// com.value.properties.map(it => {
				// 	_com.value.properties.push(t.objectProperty(t.identifier(it.value.name), it.value));
				// });
				_com.value.properties = com.value.properties;
				_data.value.properties.push(_com);
			}

			// 没有methods就添加  methods={}
			if (!node.body.some(it => it.key.name == "methods")) {
				let data = t.classProperty(t.identifier("methods"), t.objectExpression([]));
				node.body.push(data);
			}

			if (node.body.some(it => it.key.name == "onLoad") || node.body.some(it => it.key.name == "onLaunch")) {
				let name;
				if (node.body.some(it => it.key.name == "onLoad")) {
					name = "onLoad";
				} else {
					name = "onLaunch";
				}
				let MemberExpressionLeft = t.MemberExpression(t.thisExpression(), t.identifier(name));
				let MemberExpressionright = t.MemberExpression(
					t.MemberExpression(t.thisExpression(), t.identifier("$route")),
					t.identifier("query")
				);

				let callExpression = t.callExpression(MemberExpressionLeft, [MemberExpressionright]);

				let createdBody = t.blockStatement([t.expressionStatement(callExpression)]);
				let data = t.classMethod("method", t.identifier("created"), [], createdBody);
				node.body.push(data);
			}

			//将非关键字筛选出来
			var body = node.body.filter(function (it) {
				return keyName.indexOf(it.key.name) == -1;
			});

			node.body = node.body.filter(function (it) {
				return keyName.indexOf(it.key.name) > -1;
			});

			//筛选出 key={}
			var ObjectExpression = [];

			var OtherBody = [];

			body.map(it => {
				if (it.value && it.value.type == "ObjectExpression") {
					ObjectExpression.push(it);
				} else {
					OtherBody.push(it);
				}
			});

			//转换 key={}   为   key:{}
			var objectProperty = ObjectExpression.map(it => {
				let objectProperty = t.objectProperty(it.key, it.value);
				return objectProperty;
			});

			node.body.map(it => {
				if (it.key.name == "methods") {
					it.value.properties = it.value.properties.concat(OtherBody);
				}
				if (it.key.name == "data") {
					it.value.properties = it.value.properties.concat(objectProperty);
				}
			});
		},
		StringLiteral(path) {
			var value = path.node.name;
			switch (path.node.value) {
				case "wepy":
					value = "wepy-web";
					break;
				default:
					value = path.node.value;
					break;
			}
			path.node.value = value;
		},
		Identifier(path) {
			var name = path.node.name;
			
			switch (path.node.name) {
				// case 'onLoad':
				// 	name = 'created';
				// 	break;
				case "onLaunch":
					name = "created";
					break;
				case "onShow":
					name = "activated";
					break;
				case "onHide":
					name = "deactivated";
					break;
				case "onReady":
					name = "mounted";
					break;
				case "onUnload":
					name = "beforeDestroy";
					break;
				// case 'wepy':
				// 	name = 'wx';
				// 	break;
				default:
					break;
			}
			path.node.name = name;
		},
		ClassMethod(path) {
			if(path.node.key.name==='constructor'){
				path.remove()
				return;
			}
			// 转换a(){}  =>  a=function(){}
			if (path.get("key").isIdentifier({ name: "data" })) return;
			if (path.parentKey == "body") {
				var value = t.FunctionExpression(null, path.node.params, path.node.body, false, path.node.async);
				path.replaceWith(t.classProperty(path.node.key, value));
			}
		},
		ClassProperty(path) {
			// 转换data
			var node = path.node;
			if (path.get("key").isIdentifier({ name: "data" }) && node.value.type == "ObjectExpression") {
				var body = t.blockStatement([t.returnStatement(node.value)]);
				var value = t.FunctionExpression(null, [], body);

				path.replaceWith(t.classProperty(node.key, value));
			}
		},
		ClassDeclaration(path) {
			var callee = t.classExpression(path.node.id, path.node.superClass, path.node.body, []);

			path.replaceWith(t.newExpression(callee, []));
		}
	});

	content = generate(ast, {}, content);
	
	return content.code;
};
module.exports = parse;