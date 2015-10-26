/* */
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.State = State;
exports.mountAt = mountAt;
exports.buildUiRouterState = buildUiRouterState;
exports.flattenUiRouterStates = flattenUiRouterStates;

var _utils = require("./utils");

var _Controller = require("./Controller");

var DEFAULT_SUFFIX = "Controller";

/**
@function State
@param {Object}   opts - The options
@param {string}   [opts.name] - The name of the state.
@param {string}   [opts.hidden] - Hide this state from the state path.
@param {string}   [opts.bindTo] - Bind the controller to the provided name.
@param {string}   [opts.url] - The url of the state.
@param {Boolean}  [opts.abstract] - True for abstract states.
@param {string}   [opts.template] - An angular template.
@param {string}   [opts.templateUrl] - A URL to an angular template.
@param {State[]}  [opts.children] - List of child states.
@param {string}   [opts.controllerName] - The name of the controller as seen by angular.
@param {Object}   [opts.resolve] - Any required resolved.
@param {Object}   [opts.views] - State views
@param {string[]} [opts.aliases] - Aliases for the current state.

@example
[@]State({
	url: "/",
	template: `<h1>Hello World</h1>`,
})
class HelloWorld {
}
*/

function State(opts) {
	if (typeof opts === "function") {
		var _constructor = opts;opts = null;
		return register(_constructor);
	}

	opts = opts || {};

	return register;

	function register(constructor) {
		registerLock(constructor);
		(0, _Controller.Controller)(constructor, { name: opts.controllerName });

		var meta = stateMeta(constructor);
		var superMeta = stateMeta(meta.superClass) || { state: {} };

		var prototype = constructor.prototype;
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
			meta.state.callbacks.onActivate = superMeta.state.callbacks.onActivate.concat(meta.state.callbacks.onActivate);
			meta.state.callbacks.onAttach = superMeta.state.callbacks.onAttach.concat(meta.state.callbacks.onAttach);
			meta.state.callbacks.onDetach = superMeta.state.callbacks.onDetach.concat(meta.state.callbacks.onDetach);
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
			var _name = meta.name;
			_name = _name[0].toLowerCase() + _name.substr(1, _name.length - DEFAULT_SUFFIX.length - 1);
			meta.state.name = _name;
		}

		meta.state.bindTo = opts.bindTo;
		meta.state.aliases = (opts.aliases || []).concat(superMeta.state.aliases || []);

		var views = {};
		if (superMeta.state.views) {
			Object.assign(views, superMeta.state.views);
		}
		if (opts.views) {
			Object.assign(views, opts.views);
		}
		if (opts.template === false) {
			views[''] = undefined;
		} else if (opts.template !== undefined) {
			views[''] = { template: opts.template, bindTo: opts.bindTo || meta.state.name };
		} else if (opts.templateUrl) {
			views[''] = { templateUrl: opts.templateUrl, bindTo: opts.bindTo || meta.state.name };
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

	var meta = (0, _utils.funcMeta)(constructor);

	if (meta.state) {
		return meta;
	}

	meta.state = {
		callbacks: {
			onActivate: [],
			onAttach: [],
			onDetach: []
		}
	};

	return meta;
}

function registerLock(constructor) {
	var meta = stateMeta(constructor);

	if (meta.state.registered) {
		throw "@State() can only be used once!";
	}

	meta.state.registered = true;
}

State.onActivate = function onActivate(target, name, desc) {
	if (typeof desc.value !== "function") {
		throw "@State.onActivate expects a function target";
	}

	var meta = stateMeta(target.constructor);
	meta.state.callbacks.onActivate.push(desc.value);
};

State.onAttach = function onAttach(target, name, desc) {
	if (typeof desc.value !== "function") {
		throw "@State.onAttach expects a function target";
	}

	var meta = stateMeta(target.constructor);
	meta.state.callbacks.onAttach.push(desc.value);
};

State.onDetach = function onDetach(target, name, desc) {
	if (typeof desc.value !== "function") {
		throw "@State.onDetach expects a function target";
	}

	var meta = stateMeta(target.constructor);
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

function mountAt(url) {
	var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	var name = opts.name;

	return {
		state: this,
		url: url,
		name: name,
		buildUiRouterState: builder
	};

	function builder(options) {
		var state = buildUiRouterState(this.state, options);

		if (this.url !== undefined) {
			state.url = url;
		}

		if (this.name !== undefined) {
			state.name = name;
		}

		return state;
	}
}

function buildUiRouterState(obj, options) {
	if (!obj) {
		return null;
	}

	if (obj.buildUiRouterState) {
		var _state = obj.buildUiRouterState(options);
		return _state;
	}

	var meta = (0, _utils.funcMeta)(obj);
	if (!meta.state) {
		throw Error("provided object is not a state");
	}

	var children = [];
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = meta.state.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var child = _step.value;

			children.push(buildUiRouterState(child, options));
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator["return"]) {
				_iterator["return"]();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	var views = {};
	var _iteratorNormalCompletion2 = true;
	var _didIteratorError2 = false;
	var _iteratorError2 = undefined;

	try {
		for (var _iterator2 = Object.keys(meta.state.views)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
			var key = _step2.value;

			var view = meta.state.views[key];
			if (!view) {
				continue;
			}

			views[key] = {
				template: view.template,
				templateUrl: view.templateUrl,
				controllerAs: view.bindTo || meta.state.bindTo || meta.state.name,
				controller: controllerAttacher
			};
		}
	} catch (err) {
		_didIteratorError2 = true;
		_iteratorError2 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
				_iterator2["return"]();
			}
		} finally {
			if (_didIteratorError2) {
				throw _iteratorError2;
			}
		}
	}

	if (meta.state.views[''] === undefined) {
		if (children.length > 0) {
			views[''] = {
				template: '<ui-view></ui-view>',
				controllerAs: meta.state.bindTo || meta.state.name,
				controller: controllerAttacher
			};
		} else {
			views[''] = {
				template: '',
				controllerAs: meta.state.bindTo || meta.state.name,
				controller: controllerAttacher
			};
		}
	}

	var resolve = {};
	Object.assign(resolve, meta.state.resolve);
	controllerProvider.$inject = ['$q', '$controller', '$locals', '$injector'].concat(Object.keys(resolve));
	controllerAttacher.$inject = [meta.state.name, '$locals', '$injector', '$scope'].concat(Object.keys(resolve));
	resolve[meta.state.name] = controllerProvider;
	var _iteratorNormalCompletion3 = true;
	var _didIteratorError3 = false;
	var _iteratorError3 = undefined;

	try {
		for (var _iterator3 = (meta.state.aliases || [])[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
			var alias = _step3.value;

			if (!resolve[alias]) {
				resolve[alias] = [meta.state.name, function (mod) {
					return mod;
				}];
			}
		}
	} catch (err) {
		_didIteratorError3 = true;
		_iteratorError3 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
				_iterator3["return"]();
			}
		} finally {
			if (_didIteratorError3) {
				throw _iteratorError3;
			}
		}
	}

	resolve.$viewCounter = function () {
		return { attached: 0, count: Object.keys(views).length };
	};

	controllerProvider.$inject = controllerProvider.$inject.concat(meta.top.$inject || []);
	var _iteratorNormalCompletion4 = true;
	var _didIteratorError4 = false;
	var _iteratorError4 = undefined;

	try {
		for (var _iterator4 = meta.state.callbacks.onActivate[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
			var clb = _step4.value;

			controllerProvider.$inject = controllerProvider.$inject.concat(clb.$inject || []);
		}
	} catch (err) {
		_didIteratorError4 = true;
		_iteratorError4 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
				_iterator4["return"]();
			}
		} finally {
			if (_didIteratorError4) {
				throw _iteratorError4;
			}
		}
	}

	var state = {
		name: meta.state.name,
		url: meta.state.url,
		hiddenState: meta.state.hidden,
		abstract: meta.state.abstract,
		children: children,
		resolve: resolve,
		views: views
	};

	return state;

	function controllerProvider($q, $controller, $locals, $injector) {
		return $q(function (ok, err) {
			try {
				var _iteratorNormalCompletion5;

				var _didIteratorError5;

				var _iteratorError5;

				var _iterator5, _step5;

				(function () {
					var ctrl = $controller(meta.controller.name, $locals);
					var p = $q.when(ctrl);

					_iteratorNormalCompletion5 = true;
					_didIteratorError5 = false;
					_iteratorError5 = undefined;

					try {
						var _loop = function () {
							var clb = _step5.value;

							p = p.then(function () {
								return $injector.invoke(clb, ctrl, $locals);
							});
						};

						for (_iterator5 = meta.state.callbacks.onActivate[Symbol.iterator](); !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
							_loop();
						}
					} catch (err) {
						_didIteratorError5 = true;
						_iteratorError5 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion5 && _iterator5["return"]) {
								_iterator5["return"]();
							}
						} finally {
							if (_didIteratorError5) {
								throw _iteratorError5;
							}
						}
					}

					p = p.then(function () {
						return ctrl;
					});
					ok(p);
				})();
			} catch (e) {
				err(e);
			}
		})["catch"](function (err) {
			console.error("Error:", err);
			return $q.reject(err);
		});
	}

	function controllerAttacher(ctrl, $locals, $injector, $scope) {
		var _iteratorNormalCompletion6 = true;
		var _didIteratorError6 = false;
		var _iteratorError6 = undefined;

		try {
			for (var _iterator6 = meta.state.callbacks.onAttach[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
				var clb = _step6.value;

				$injector.invoke(clb, ctrl, $locals);
			}
		} catch (err) {
			_didIteratorError6 = true;
			_iteratorError6 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion6 && _iterator6["return"]) {
					_iterator6["return"]();
				}
			} finally {
				if (_didIteratorError6) {
					throw _iteratorError6;
				}
			}
		}

		$scope.$on("$destroy", function () {
			var _iteratorNormalCompletion7 = true;
			var _didIteratorError7 = false;
			var _iteratorError7 = undefined;

			try {
				for (var _iterator7 = meta.state.callbacks.onDetach[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
					var clb = _step7.value;

					$injector.invoke(clb, ctrl, $locals);
				}
			} catch (err) {
				_didIteratorError7 = true;
				_iteratorError7 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion7 && _iterator7["return"]) {
						_iterator7["return"]();
					}
				} finally {
					if (_didIteratorError7) {
						throw _iteratorError7;
					}
				}
			}
		});

		return ctrl;
	}
}

function flattenUiRouterStates(state) {
	var acc = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

	acc.push(state);

	if (state.children) {
		var prefix = state.name;
		if (state.hiddenState) {
			if (state.parent) {
				prefix = state.parent.name;
			} else {
				prefix = null;
			}
		}

		var _iteratorNormalCompletion8 = true;
		var _didIteratorError8 = false;
		var _iteratorError8 = undefined;

		try {
			for (var _iterator8 = state.children[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
				var child = _step8.value;

				if (child) {
					child.parent = state;

					if (prefix && !child.absoluteName) {
						child.name = prefix + "." + child.name;
					}

					flattenUiRouterStates(child, acc);
				} else {
					console.warn("nil child for " + state.name);
				}
			}
		} catch (err) {
			_didIteratorError8 = true;
			_iteratorError8 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion8 && _iterator8["return"]) {
					_iterator8["return"]();
				}
			} finally {
				if (_didIteratorError8) {
					throw _iteratorError8;
				}
			}
		}
	}

	return acc;
}
//# sourceMappingURL=State.js.map