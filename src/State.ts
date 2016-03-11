/* */
import {funcMeta, IMetadata, assign} from "./utils";
import {Controller} from "./Controller";

const DEFAULT_SUFFIX = "Controller";

var blankStateMetadata : IMetadata = {
	controller: null,
	service:    null,
	wrappers:   null,
	base:       null,
	top:        null,
	name:       null,
	superClass: null,
	wrap:       null,
	state: {
		name: null,
		bindTo: null,
		url: null,
		hidden: null,
		abstract: null,
		registered: null,
		aliases: null,
		children: null,
		views: null,
		resolve: null,
		data: null,
		callbacks: null
	}
};


export interface StateOptions {

	/**
	 * The name of the state.
	 */
	name?:           string;

	/**
	 * Hide this state from the state path.
	 */
	hidden?:         boolean;

	/**
	 * Bind the controller to the provided name.
	 */
	bindTo?:         string;

	/**
	 * The url of the state.
	 */
	url?:            string|boolean;

	/**
	 * True for abstract states.
	 */
	abstract?:       boolean;

	/**
	 * An angular template.
	 */
	template?:       string|boolean;

	/**
	 * A URL to an angular template.
	 */
	templateUrl?:    string;

	/**
	 * List of child states.
	 */
	children?:       IState[]|boolean;

	/**
	 * The name of the controller as seen by angular.
	 */
	controllerName?: string;

	/**
	 * Any required resolved.
	 */
	resolve?:        IResolvers;

	/**
	 * Data to associate with this state.
	 */
	data?: Object|boolean;

	/**
	 * State views
	 */
	views?:          IViews;

	/**
	 * Aliases for the current state.
	 */
	aliases?:        string[];
}

export interface IView {

	/**
	 * Bind the controller to the provided name.
	 */
	bindTo?:         string;

	/**
	 * An angular template.
	 */
	template?:       string|boolean;

	/**
	 * A URL to an angular template.
	 */
	templateUrl?:    string;

}

export interface IViews {
	[index: string]: IView;
}

export interface IResolvers {
	[index: string]: (...args: any[]) => Promise<any>;
}

export interface IState {
}

/**
Declare a state.

```js
\@State({
	url: "/",
	template: `<h1>Hello World</h1>`,
})
class HelloWorld {
}
```

*/
export function State(opts: StateOptions) : ClassDecorator;
export function State<T extends Function>(target: T) : T;
export function State(opts) : any {
	if (typeof opts === "function") {
		let constructor : Function = opts; opts = null;
		return register(constructor);
	}

	opts = (opts || {});

	return register;

	function register(constructor: Function) {
		registerLock(constructor);
		Controller(constructor, { name: opts.controllerName });

		let meta = stateMeta(constructor);
		let superMeta : IMetadata = stateMeta(meta.superClass) || blankStateMetadata;

		let prototype = constructor.prototype;
		if (prototype.activate) {
			meta.state.callbacks.onActivate.push(prototype.activate);
		}
		if (prototype.attach) {
			meta.state.callbacks.onAttach.push(prototype.attach);
		}
		if (prototype.detach) {
			meta.state.callbacks.onDetach.push(prototype.detach);
		}

		if (superMeta.state.callbacks) {
			meta.state.callbacks.onActivate = superMeta.state.callbacks.onActivate
				.concat(meta.state.callbacks.onActivate);
			meta.state.callbacks.onAttach = superMeta.state.callbacks.onAttach
				.concat(meta.state.callbacks.onAttach);
			meta.state.callbacks.onDetach = superMeta.state.callbacks.onDetach
				.concat(meta.state.callbacks.onDetach);
		}

		if (opts.children === false) {
			meta.state.children = null;
		} else if (opts.children) {
			meta.state.children = opts.children;
		} else if (superMeta.state.children) {
			meta.state.children = superMeta.state.children;
		}
		if (!meta.state.children) {
			meta.state.children = [];
		}

		if (opts.name) {
			meta.state.name = opts.name;
		} else {
			let name = meta.name;
			name = name[0].toLowerCase() + name.substr(1, name.length - DEFAULT_SUFFIX.length - 1);
			meta.state.name = name;
		}

		meta.state.bindTo = opts.bindTo;
		meta.state.aliases = (opts.aliases || []).concat(superMeta.state.aliases || []);

		let views : IViews = {};
		if (superMeta.state.views) {
			assign(views, superMeta.state.views);
		}
		if (opts.views) {
			assign(views, opts.views);
		}
		if (opts.template === false) {
			views[''] = undefined;
		} else if (opts.template !== undefined) {
			views[''] = { template: opts.template, bindTo: (opts.bindTo || meta.state.name) };
		} else if (opts.templateUrl) {
			views[''] = { templateUrl: opts.templateUrl, bindTo: (opts.bindTo || meta.state.name) };
		}
		meta.state.views = views;

		if (opts.url !== false) {
			if (opts.url !== undefined) {
				meta.state.url = opts.url;
			} else if (superMeta.state.url !== undefined) {
				meta.state.url = superMeta.state.url;
			}
		}

		if (opts.abstract === undefined) {
			meta.state.abstract = superMeta.state.abstract;
		} else if (opts.abstract === true) {
			meta.state.abstract = true;
		} else if (opts.abstract === false) {
			meta.state.abstract = false;
		}

		if (opts.hidden === undefined) {
			meta.state.hidden = superMeta.state.hidden;
		} else if (opts.hidden === true) {
			meta.state.hidden = true;
		} else if (opts.hidden === false) {
			meta.state.hidden = false;
		}

		meta.state.resolve = {};
		if (opts.resolve !== false) {
			assign(meta.state.resolve, superMeta.state.resolve);
			if (opts.resolve) {
				assign(meta.state.resolve, opts.resolve);
			}
		}

		meta.state.data = {};
		if (opts.data !== false) {
			assign(meta.state.data, superMeta.state.data);
			if (opts.data) {
				assign(meta.state.data, opts.data);
			}
		}

	}
}

function stateMeta(constructor) : IMetadata {
	if (!constructor) {
		return null;
	}

	let meta = funcMeta(constructor);

	if (meta.state) {
		return meta;
	}

	meta.state = {
		name: null,
		bindTo: null,
		url: null,
		hidden: null,
		abstract: null,
		registered: null,
		aliases: null,
		children: null,
		views: null,
		resolve: null,
		data: null,
		callbacks: {
			onActivate: [],
			onAttach:   [],
			onDetach:   [],
		},
	};

	return meta;
}

function registerLock(constructor) {
	let meta = stateMeta(constructor);

	if (meta.state.registered) {
		throw "@State() can only be used once!";
	}

	meta.state.registered = true;
}

export module State {
	export declare var onActivate : MethodDecorator;
	export declare var onAttach : MethodDecorator;
	export declare var onDetach : MethodDecorator;
}

State['onActivate'] = function onActivate(target, name, desc) {
	if (typeof desc.value !== "function") {
		throw "@State.onActivate expects a function target";
	}

	let meta = stateMeta(target.constructor);
	meta.state.callbacks.onActivate.push(desc.value);
};

State['onAttach'] = function onAttach(target, name, desc) {
	if (typeof desc.value !== "function") {
		throw "@State.onAttach expects a function target";
	}

	let meta = stateMeta(target.constructor);
	meta.state.callbacks.onAttach.push(desc.value);
};

State['onDetach'] = function onDetach(target, name, desc) {
	if (typeof desc.value !== "function") {
		throw "@State.onDetach expects a function target";
	}

	let meta = stateMeta(target.constructor);
	meta.state.callbacks.onDetach.push(desc.value);
};

export interface MountOptions {
	name?: string;
}

/**
```js
SomeState::mountAt("/some/url")
```
*/
export function mountAt(url:string, opts?: MountOptions) : IState {
	let {name} = opts || { name: undefined };

	return {
		state:              this,
		url:                url,
		name:               name,
		buildUiRouterState: builder,
	};

	function builder(options) {
		let state = buildUiRouterState(this.state, options);

		if (this.url !== undefined) {
			state.url = url;
		}

		if (this.name !== undefined) {
			state.name = name;
		}

		return state;
	}
}

/** @hidden */
export function buildUiRouterState(obj, options?) {
	if (!obj) {
		return null;
	}

	if (obj.buildUiRouterState) {
		let state = obj.buildUiRouterState(options);
		return state;
	}

	let meta = funcMeta(obj);
	if (!meta.state) {
		throw Error("provided object is not a state");
	}

	let children = [];
	for (let child of meta.state.children) {
		children.push(buildUiRouterState(child, options));
	}

	let views = {};
	for (let key of Object.keys(meta.state.views)) {
		let view = meta.state.views[key];
		if (!view) { continue; }

		views[key] = {
			template:     view.template,
			templateUrl:  view.templateUrl,
			controllerAs: (view.bindTo || meta.state.bindTo || meta.state.name),
			controller:   controllerAttacher,
		};
	}
	if (meta.state.views[''] === undefined) {
		if (children.length > 0) {
			views[''] = {
				template:     '<ui-view></ui-view>',
				controllerAs: (meta.state.bindTo || meta.state.name),
				controller:   controllerAttacher,
			};
		} else {
			views[''] = {
				template:     '',
				controllerAs: (meta.state.bindTo || meta.state.name),
				controller:   controllerAttacher,
			};
		}
	}

	let resolve = {};
	assign(resolve, meta.state.resolve);
	controllerProvider.$inject = ['$q', '$controller', '$locals', '$injector'].concat(Object.keys(resolve));
	controllerAttacher.$inject = [meta.state.name, '$locals', '$injector', '$scope'].concat(Object.keys(resolve));
	resolve[meta.state.name] = controllerProvider;
	for (let alias of (meta.state.aliases || [])) {
		if (!resolve[alias]) {
			resolve[alias] = [meta.state.name, function(mod){ return mod; }];
		}
	}
	resolve['$viewCounter'] = () => ({ attached: 0, count: Object.keys(views).length });

	controllerProvider.$inject = controllerProvider.$inject.concat(meta.top.$inject || []);
	for (let clb of meta.state.callbacks.onActivate) {
		controllerProvider.$inject = controllerProvider.$inject.concat(clb.$inject || []);
	}

	let state = {
		name:        meta.state.name,
		url:         meta.state.url,
		hiddenState: meta.state.hidden,
		abstract:    meta.state.abstract,
		data:        meta.state.data,
		children:    children,
		resolve:     resolve,
		views:       views,
	};

	return state;

	function controllerProvider($q, $controller, $locals, $injector) {
		return $q(function(ok, err) {
			try {
				let ctrl = $controller(meta.controller.name, $locals);
				let p = $q.when(ctrl);

				let _apply = function(clb) {
					p = p.then(() => $injector.invoke(clb, ctrl, $locals));
				};
				for (let clb of meta.state.callbacks.onActivate) {
					_apply(clb);
				}

				p = p.then(() => ctrl);
				ok(p);
			} catch (e) {
				err(e);
			}
		})
		.catch(err => {
			console.error("Error:", err);
			return $q.reject(err);
		});
	}

	function controllerAttacher(ctrl, $locals, $injector, $scope) {
		for (let clb of meta.state.callbacks.onAttach) {
			$injector.invoke(clb, ctrl, $locals);
		}

		$scope.$on("$destroy", function() {
			for (let clb of meta.state.callbacks.onDetach) {
				$injector.invoke(clb, ctrl, $locals);
			}
		});

		return ctrl;
	}
}

/** @hidden */
export function flattenUiRouterStates(state, acc=[]) {
	acc.push(state);

	if (state.children) {
		let prefix = state.name;
		if (state.hiddenState) {
			if (state.parent) {
				prefix = state.parent.name;
			} else {
				prefix = null;
			}
		}

		for (let child of state.children) {
			if (child) {
				child.parent = state;

				if (prefix && !child.absoluteName) {
					child.name = `${prefix}.${child.name}`;
				}

				flattenUiRouterStates(child, acc);
			} else {
				console.warn(`nil child for ${state.name}`);
			}
		}
	}

	return acc;
}
