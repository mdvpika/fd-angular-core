"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.includeModule = includeModule;
exports.beforeBoot = beforeBoot;
exports.bootstrap = bootstrap;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _jquery = require("jquery");

var _jquery2 = _interopRequireDefault(_jquery);

var _angular = require("angular");

var _angular2 = _interopRequireDefault(_angular);

var _injector = require("./injector");

// Base modules

require("angular-ui-router");

var _State = require("./State");

/**
@var {ngModule} app
*/
var appRootState = null;
var appDeps = ["ui.router"];
var app = _angular2["default"].module("app", appDeps);

exports.app = app;
app.run(["$injector", function ($injector) {
	(0, _injector.extendInjector)($injector);
}]);

app.config(["$stateProvider", function ($stateProvider) {
	if (appRootState) {
		var state = (0, _State.buildUiRouterState)(appRootState);
		var states = (0, _State.flattenUiRouterStates)(state);
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = states[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var _state = _step.value;

				$stateProvider.state(_state);
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
	}
}]);

/**
@function includeModule
@param {String} name - name of the module to include.
*/

function includeModule(name) {
	appDeps.push(name);
}

/**
@var {angular} ng
*/
var ng = _angular2["default"];
exports.ng = ng;
var beforeBootPromise = Promise.resolve(true);

/**
@function beforeBoot
@param {Promise} p - includes a Promise before the app is booted.
*/

function beforeBoot(p) {
	beforeBootPromise = beforeBootPromise.then(function () {
		return Promise.resolve(p);
	});
}

/**
@function bootstrap
@param {State} mainState
@param {...Sgtring} deps
@return {Promise}
*/

function bootstrap(mainState) {
	appRootState = mainState;
	var _iteratorNormalCompletion2 = true;
	var _didIteratorError2 = false;
	var _iteratorError2 = undefined;

	try {
		for (var _len = arguments.length, deps = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
			deps[_key - 1] = arguments[_key];
		}

		for (var _iterator2 = deps[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
			var dep = _step2.value;

			includeModule(dep);
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

	return beforeBootPromise.then(function () {
		return new Promise(function (resolve, reject) {
			(0, _jquery2["default"])(function () {
				try {
					var injector = _angular2["default"].bootstrap(document, ["app"]);
					(0, _injector.extendInjector)(injector);
					resolve();
				} catch (e) {
					reject(e);
				}
			});
		});
	});
}
//# sourceMappingURL=app.js.map