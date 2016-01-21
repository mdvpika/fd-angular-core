import {funcMeta, dashCase} from "./utils";
import {app} from "./app";
import {Controller} from "./Controller";

const DEFAULT_SUFFIX = "Controller";

/**
Declare an angular Component directive.

@function Component

@param {Object} [opts]
@param {String} [opts.name]
@param {String} [opts.restrict="EA"]
@param {Boolean} [opts.restrict="false"]
@param {Boolean} [opts.transclude="EA"]
@param {Object} [opts.scope={}]
@param {String} [opts.template]
@param {String} [opts.templateUrl]

@example
[@]Component({
	scope: { "attr": "=" }
})
class MyComponentController {}

*/
export function Component(opts) {
	if (typeof opts === "function") {
		let constructor = opts; opts = null;
		return register(constructor);
	}

	opts = (opts || {});
	var {
		restrict="EA",
		replace=false,
		transclude=false,
		scope={},
		template,
		templateUrl,
	} = opts;
	return register;

	function register(constructor) {
		Controller(constructor);
		let meta = funcMeta(constructor);

		let name = meta.name;
		name = name[0].toLowerCase() + name.substr(1, name.length - DEFAULT_SUFFIX.length - 1);

		if (!template && !templateUrl && (template !== false)) {
			var tmplName = dashCase(name);
			templateUrl = `./components/${tmplName}/${tmplName}.html`;
		}

		if (template === false) {
			template = undefined;
			templateUrl = undefined;
		}

		app.directive(name, function () {
			return {
				restrict:         restrict,
				scope:            scope,
				bindToController: true,
				controller:       meta.controller.name,
				controllerAs:     name,
				template:         template,
				templateUrl:      templateUrl,
				replace:          replace,
				transclude:       transclude,
			};
		});
	}
}
