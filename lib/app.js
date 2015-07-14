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

// Base modules

require("angular-ui-router");

require("angular-ui-router.statehelper");

var _State = require("./State");

var appRootState = null;
var appDeps = ["ui.router", "ui.router.stateHelper"];
var app = _angular2["default"].module("app", appDeps);

exports.app = app;
app.config(["$injector", function ($injector) {

  var originalInvoke = $injector.invoke;
  $injector.invoke = function invoke(fn, self, locals, serviceName) {
    if (typeof locals === "string") {
      serviceName = locals;
      locals = null;
    }

    if (!locals) {
      locals = {};
    }
    locals.$locals = locals;

    return originalInvoke.call(this, fn, self, locals, serviceName);
  };

  var originalInstantiate = $injector.instantiate;
  $injector.instantiate = function instantiate(Type, locals, serviceName) {
    if (typeof locals === "string") {
      serviceName = locals;
      locals = null;
    }

    if (!locals) {
      locals = {};
    }
    locals.$locals = locals;

    return originalInstantiate.call(this, Type, locals, serviceName);
  };
}]);

app.config(["stateHelperProvider", function (stateHelperProvider) {
  if (appRootState) {
    var state = (0, _State.buildUiRouterState)(appRootState);
    stateHelperProvider.setNestedState(state);
  }
}]);

function includeModule(name) {
  appDeps.push(name);
}

var ng = _angular2["default"];
exports.ng = ng;
var beforeBootPromise = Promise.resolve(true);

function beforeBoot(p) {
  beforeBootPromise = beforeBootPromise.then(function () {
    return Promise.resolve(p);
  });
}

function bootstrap(mainState) {
  appRootState = mainState;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _len = arguments.length, deps = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      deps[_key - 1] = arguments[_key];
    }

    for (var _iterator = deps[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var dep = _step.value;

      includeModule(dep);
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

  return beforeBootPromise.then(function () {
    return new Promise(function (resolve, reject) {
      (0, _jquery2["default"])(function () {
        try {
          _angular2["default"].bootstrap(document, ["app"]);
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });
  });
}
//# sourceMappingURL=app.js.map