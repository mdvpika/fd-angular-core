import {funcMeta} from "./utils";
import {Controller} from "./Controller";

const DEFAULT_SUFFIX = "Controller";

/**
@function State
@param {Object}  opts - The options
@param {string}  [opts.name] - The name of the state.
@param {string}  [opts.hidden] - Hide this state from the state path.
@param {string}  [opts.bindTo] - Bind the controller to the provided name.
@param {string}  [opts.url] - The url of the state.
@param {Boolean} [opts.abstract] - True for abstract states.
@param {string}  [opts.template] - An angular template.
@param {string}  [opts.templateUrl] - A URL to an angular template.
@param {State[]} [opts.children] - List of child states.
@param {string}  [opts.controllerName] - The name of the controller as seen by angular.
@param {Object}  [opts.resolve] - Any required resolved.
@param {Object}  [opts.views] - State views

@example
[@]State({
	url: "/",
	template: `<h1>Hello World</h1>`,
})
class HelloWorld {
}
*/
export function State(opts) {
	if (typeof opts === "function") {
		let constructor = opts; opts = null;
		return register(constructor);
	}

	opts = (opts || {});

	return register;

	function register(constructor) {
		registerLock(constructor);
		Controller(constructor, { name: opts.controllerName });

		let meta = stateMeta(constructor);
		let superMeta = stateMeta(meta.superClass) || { state: {} };

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

		let views = {};
		if (superMeta.state.views) {
			Object.assign(views, superMeta.state.views);
		}
		if (opts.views) {
			Object.assign(views, opts.views);
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
			Object.assign(meta.state.resolve, superMeta.state.resolve);
			if (opts.resolve) {
				Object.assign(meta.state.resolve, opts.resolve);
			}
		}

	}
}

function stateMeta(constructor) {
	if (!constructor) {
		return null;
	}

	let meta = funcMeta(constructor);

	if (meta.state) {
		return meta;
	}

	meta.state = {
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

State.onActivate = function onActivate(target, name, desc) {
	if (typeof desc.value !== "function") {
		throw "@State.onActivate expects a function target";
	}

	let meta = stateMeta(target.constructor);
	meta.state.callbacks.onActivate.push(desc.value);
};

State.onAttach = function onAttach(target, name, desc) {
	if (typeof desc.value !== "function") {
		throw "@State.onAttach expects a function target";
	}

	let meta = stateMeta(target.constructor);
	meta.state.callbacks.onAttach.push(desc.value);
};

State.onDetach = function onDetach(target, name, desc) {
	if (typeof desc.value !== "function") {
		throw "@State.onDetach expects a function target";
	}

	let meta = stateMeta(target.constructor);
	meta.state.callbacks.onDetach.push(desc.value);
};

/**
@function mountAt
@param {String} url
@param {Object} [opts]
@param {String} [opts.name]

@example
SomeState::mountAt("/some/url")
*/
export function mountAt(url, opts={}) {
	let {name} = opts;

	return {
		state:              this,
		url:                url,
		name:               name,
		buildUiRouterState: builder,
	};

	function builder() {
		let state = buildUiRouterState(this.state);

		if (this.url) {
			state.url = url;
		}

		if (this.name) {
			state.name = name;
		}

		return state;
	}
}

export function buildUiRouterState(obj) {
	if (!obj) {
		return null;
	}

	if (obj.buildUiRouterState) {
		let state = obj.buildUiRouterState();
		return state;
	}

	let meta = funcMeta(obj);
	if (!meta.state) {
		throw Error("provided object is not a state");
	}

	let children = [];
	for (let child of meta.state.children) {
		children.push(buildUiRouterState(child));
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
	Object.assign(resolve, meta.state.resolve);
	controllerProvider.$inject = ['$q', '$controller', '$locals', '$injector'].concat(Object.keys(resolve));
	controllerAttacher.$inject = [meta.state.name, '$locals', '$injector', '$scope'].concat(Object.keys(resolve));
	resolve[meta.state.name] = controllerProvider;
	resolve.$viewCounter = () => ({ attached: 0, count: Object.keys(views).length });

	controllerProvider.$inject = controllerProvider.$inject.concat(meta.top.$inject || []);
	for (let clb of meta.state.callbacks.onActivate) {
		controllerProvider.$inject = controllerProvider.$inject.concat(clb.$inject || []);
	}

	let state = {
		name:        meta.state.name,
		url:         meta.state.url,
		hiddenState: meta.state.hidden,
		abstract:    meta.state.abstract,
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

				for (let clb of meta.state.callbacks.onActivate) {
					p = p.then(() => $injector.invoke(clb, ctrl, $locals));
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
			child.parent = state;

			if (prefix && !child.absoluteName) {
				child.name = `${prefix}.${child.name}`;
			}

			flattenUiRouterStates(child, acc);
		}
	}

	return acc;
}
