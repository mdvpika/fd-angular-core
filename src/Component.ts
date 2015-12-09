import {funcMeta, dashCase} from "./utils";
import {app} from "./app";
import {Controller} from "./Controller";

const DEFAULT_SUFFIX = "Controller";


export interface ComponentOptions {
	name?: string;
	restrict?: string;
	scope?: Object;
	template?: string|boolean;
	templateUrl?: string;
}

/**
Declare an angular Component directive.

```js
; @Component({
	scope: { "attr": "=" }
})
class MyComponentController {}
```
*/
export function Component(opts: ComponentOptions) : ClassDecorator;
export function Component<T extends Function>(target: T) : T;
export function Component(opts) : any {
	if (typeof opts === "function") {
		let constructor = opts; opts = null;
		return register(constructor);
	}

	opts = (opts || {});
	var {
		restrict="EA",
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
			};
		});
	}
}
