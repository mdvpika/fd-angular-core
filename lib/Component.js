"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Component = Component;

var _utils = require("./utils");

var _app = require("./app");

var _Controller = require("./Controller");

var DEFAULT_SUFFIX = "Controller";

/**
Declare an angular Component directive.

@function Component

@param {Object} [opts]
@param {String} [opts.name]
@param {String} [opts.restrict="EA"]
@param {Object} [opts.scope={}]
@param {String} [opts.template]
@param {String} [opts.templateUrl]

@example
[@]Component({
	scope: { "attr": "=" }
})
class MyComponentController {}

*/

function Component(opts) {
	if (typeof opts === "function") {
		var _constructor = opts;opts = null;
		return register(_constructor);
	}

	opts = opts || {};
	var _opts$restrict = opts.restrict;
	var restrict = _opts$restrict === undefined ? "EA" : _opts$restrict;
	var _opts$scope = opts.scope;
	var scope = _opts$scope === undefined ? {} : _opts$scope;
	var template = opts.template;
	var templateUrl = opts.templateUrl;

	return register;

	function register(constructor) {
		(0, _Controller.Controller)(constructor);
		var meta = (0, _utils.funcMeta)(constructor);

		var name = meta.name;
		name = name[0].toLowerCase() + name.substr(1, name.length - DEFAULT_SUFFIX.length - 1);

		if (!template && !templateUrl && template !== false) {
			var tmplName = (0, _utils.dashCase)(name);
			templateUrl = "./components/" + tmplName + "/" + tmplName + ".html";
		}

		if (template === false) {
			template = undefined;
			templateUrl = undefined;
		}

		_app.app.directive(name, function () {
			return {
				restrict: restrict,
				scope: scope,
				bindToController: true,
				controller: meta.controller.name,
				controllerAs: name,
				template: template,
				templateUrl: templateUrl
			};
		});
	}
}
//# sourceMappingURL=Component.js.map