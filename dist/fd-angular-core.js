(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.FdAngularCore = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Component = Component;

var _utils = require("./utils");

var _app = require("./app");

var _Controller = require("./Controller");

var DEFAULT_SUFFIX = "Controller";

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

    var name = (0, _utils.funcName)(constructor);
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
        controller: (0, _utils.funcName)(constructor),
        controllerAs: name,
        template: template,
        templateUrl: templateUrl
      };
    });
  }
}

},{"./Controller":2,"./app":6,"./utils":8}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Controller = Controller;

var _utils = require("./utils");

var _app = require("./app");

function Controller(name, options) {
  if (typeof name === "function") {
    var _constructor = name;name = null;
    return register(_constructor, options);
  }

  return register;
  function register(constructor, opts) {
    var meta = registerLock(constructor);

    var className = (0, _utils.funcName)(constructor);
    opts = opts || {};
    name = name || opts.name || className;

    meta.name = name;
    _app.app.controller(name, constructor);
  }
}

function registerLock(constructor) {
  var lock = constructor.$$controller;

  if (lock && lock.constructor === constructor) {
    throw "@Controller() can only be used once!";
  }

  constructor.$$controller = { constructor: constructor };
  return constructor.$$controller;
}

},{"./app":6,"./utils":8}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Inject = Inject;

function Inject() {
  for (var _len = arguments.length, deps = Array(_len), _key = 0; _key < _len; _key++) {
    deps[_key] = arguments[_key];
  }

  return function (constructor, name, desc) {
    if (desc && typeof desc.value === "function") {
      desc.value.$inject = deps;
    } else {
      constructor.$inject = deps;
    }
  };
}

},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Service = Service;

var _utils = require("./utils");

var _app = require("./app");

function Service(name) {
  if (typeof name === "function") {
    var _constructor = name;name = null;
    return register(_constructor);
  }
  return register;

  function register(constructor) {
    name = name || (0, _utils.funcName)(constructor);
    _app.app.service(name, constructor);
  }
}

},{"./app":6,"./utils":8}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.State = State;
exports.mountAt = mountAt;

var _utils = require("./utils");

var _app = require("./app");

var _Controller = require("./Controller");

var DEFAULT_SUFFIX = "Controller";

function State(opts) {
  if (typeof opts === "function") {
    var _constructor = opts;opts = null;
    return register(_constructor);
  }

  opts = opts || {};

  return register;

  function register(constructor) {
    var _context;

    (0, _Controller.Controller)(constructor, { name: opts.controllerName });

    var prototype = constructor.prototype;

    if (prototype.activate) {
      State.onActivate(prototype, "activate", { value: prototype.activate });
    }

    if (prototype.attach) {
      State.onAttach(prototype, "attach", { value: prototype.attach });
    }

    if (prototype.detach) {
      State.onDetach(prototype, "detach", { value: prototype.detach });
    }

    var callbacks = prototype.$$stateCallbacks || {};
    delete prototype.$$stateCallbacks;

    var meta = registerLock(constructor);
    var superMeta = (0, _utils.superClass)(constructor).$$state;
    superMeta = superMeta || {};

    // start inheriting
    var $opts = Object.create(superMeta.opts || {}, {});

    var keys = Object.keys(opts);
    for (var idx in keys) {
      var key = keys[idx];
      var val = opts[key];

      // Ignored keys
      if (key === "name") {
        continue;
      }
      if (key === "controllerName") {
        continue;
      }
      if (key === "resolve") {
        continue;
      }
      if (key === "children") {
        continue;
      }
      // if (key === "$onEnter") { continue; }
      // if (key === "$onExit") { continue; }

      $opts[key] = val;
    }

    // inherit name
    $opts.name = opts.name;

    // inherit controllerName
    $opts.controllerName = opts.controllerName;

    // Inherit resolve
    var $resolve = {};
    Object.assign($resolve, $opts.resolve || {});
    Object.assign($resolve, opts.resolve || {});
    $opts.resolve = $resolve;

    // Inherit children
    $opts.children = opts.children || ($opts.children || []).concat([]);

    opts = $opts;
    // done inheriting

    applyDefaultName(opts, constructor);
    applyDefaultTemplate(opts);

    meta.opts = opts;
    meta.name = opts.name;

    var state = meta.state = Object.defineProperties({
      name: opts.name,
      template: opts.template,
      templateUrl: opts.templateUrl,
      controllerAs: opts.bindTo || opts.name,
      url: opts.url,
      abstract: opts.abstract,
      resolve: Object.assign({}, opts.resolve),
      childStates: opts.children

    }, {
      children: {
        get: function get() {
          return this.childStates.map(function (x) {
            return x.$$state.state;
          });
        },
        configurable: true,
        enumerable: true
      }
    });

    var controllerProvider = function controllerProvider(ctrl, $hooks, $scope) {
      try {
        if ($hooks.attach) {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = $hooks.attach[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var hook = _step.value;
              hook.call(ctrl);
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

        $scope.$on("$destroy", function () {
          if ($hooks.detach) {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = $hooks.detach[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var hook = _step2.value;
                hook.call(ctrl);
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
          }
        });
      } catch (e) {
        console.error(e);
        throw e;
      }

      return ctrl;
    };

    controllerProvider = inject.call(controllerProvider, opts.name, "$hooks", "$scope");

    if (callbacks.onAttach) {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = callbacks.onAttach[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var hook = _step3.value;

          controllerProvider = pushHook.call(controllerProvider, "attach", hook);
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
    }
    if (callbacks.onDetach) {
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = callbacks.onDetach[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var hook = _step4.value;

          controllerProvider = pushHook.call(controllerProvider, "detach", hook);
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
    }

    state.controller = controllerProvider;

    var ctrlR = function ctrlR($q, $controller, $constructorInject, $hooks) {
      var ctrl = undefined;
      var p = undefined;

      try {
        ctrl = $controller(constructor.$$controller.name, $constructorInject);
        p = $q.when(ctrl);
      } catch (e) {
        console.error(e);
        return $q.reject(e);
      }

      if ($hooks.activate) {
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          var _loop = function () {
            var hook = _step5.value;

            p = p.then(function () {
              return hook.call(ctrl);
            });
          };

          for (var _iterator5 = $hooks.activate[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
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
      }

      return p;
    };

    ctrlR = (_context = inject.call(ctrlR, "$q", "$controller", "$constructorInject", "$hooks"), namedInjectionCollector).call(_context, "$constructorInject", constructor.$inject);

    if (callbacks.onActivate) {
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = callbacks.onActivate[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var hook = _step6.value;

          ctrlR = pushHook.call(ctrlR, "activate", hook);
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
    }

    state.resolve[opts.name] = ctrlR;
  }
}

State.onActivate = function onActivate(target, name, desc) {
  if (typeof desc.value !== "function") {
    throw "@State.onActivate expects a function target";
  }

  if (!target.$$stateCallbacks) {
    target.$$stateCallbacks = {};
  }
  if (!target.$$stateCallbacks.onActivate) {
    target.$$stateCallbacks.onActivate = [];
  }

  target.$$stateCallbacks.onActivate.push(desc.value);
};

State.onAttach = function onAttach(target, name, desc) {
  if (typeof desc.value !== "function") {
    throw "@State.onAttach expects a function target";
  }

  if (!target.$$stateCallbacks) {
    target.$$stateCallbacks = {};
  }
  if (!target.$$stateCallbacks.onAttach) {
    target.$$stateCallbacks.onAttach = [];
  }

  target.$$stateCallbacks.onAttach.push(desc.value);
};

State.onDetach = function onDetach(target, name, desc) {
  if (typeof desc.value !== "function") {
    throw "@State.onDetach expects a function target";
  }

  if (!target.$$stateCallbacks) {
    target.$$stateCallbacks = {};
  }
  if (!target.$$stateCallbacks.onDetach) {
    target.$$stateCallbacks.onDetach = [];
  }

  target.$$stateCallbacks.onDetach.push(desc.value);
};

function mountAt(url) {
  var opts = arguments[1] === undefined ? {} : arguments[1];
  var name = opts.name;

  var state = Object.create(this.$$state.state, {});
  state.url = url;

  if (name) {
    state.name = name;
  }

  var $$state = Object.create(this.$$state, {});
  $$state.state = state;

  var $this = Object.create(this, {});
  $this.$$state = $$state;

  return $this;
}

function registerLock(constructor) {
  var lock = constructor.$$state;

  if (lock && lock.constructor === constructor) {
    throw "@State() can only be used once!";
  }

  constructor.$$state = { constructor: constructor };
  return constructor.$$state;
}

function applyDefaultName(opts, constructor) {
  if (opts.name) {
    return;
  }

  var name = opts.name;
  name = (0, _utils.funcName)(constructor);
  name = name[0].toLowerCase() + name.substr(1, name.length - DEFAULT_SUFFIX.length - 1);
  opts.name = name;
}

function applyDefaultTemplate(opts) {
  var template = opts.template;
  var templateUrl = opts.templateUrl;
  var children = opts.children;

  if (template !== undefined || templateUrl !== undefined) {
    return;
  }

  if (children && children.length > 0) {
    opts.template = "<ui-view></ui-view>";
  }
}

function inject() {
  for (var _len = arguments.length, splat = Array(_len), _key = 0; _key < _len; _key++) {
    splat[_key] = arguments[_key];
  }

  if (splat.length === 1 && !splat[0]) {
    splat = [];
  }
  if (splat.length === 1 && splat[0].length > 0) {
    splat = splat[0];
  }

  this.$inject = splat;
  return this;
}

function injectionCollector(as) {
  for (var _len2 = arguments.length, splat = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    splat[_key2 - 1] = arguments[_key2];
  }

  if (splat.length === 1 && !splat[0]) {
    splat = [];
  }
  if (splat.length === 1 && splat[0].length > 0) {
    splat = splat[0];
  }

  var base = this;
  var $inject = (base.$inject || []).concat([]);
  var injectLen = base.$inject.length;
  var splatIdxs = [];

  var idx = $inject.indexOf(as);
  if (idx < 0) {
    return base;
  }

  while (idx >= 0) {
    splatIdxs.unshift(idx);
    $inject.splice(idx, 1);
    injectLen--;
    idx = $inject.indexOf(as);
  }

  $inject = $inject.concat(splat);
  collectInjections.$inject = $inject;
  return collectInjections;

  function collectInjections() {
    var injectVals = Array.prototype.slice.call(arguments, 0, injectLen);
    var splatVals = Array.prototype.slice.call(arguments, injectLen);

    for (var splatIdx in splatIdxs) {
      injectVals.splice(splatIdxs[splatIdx], 0, splatVals);
    }

    return base.apply(this, injectVals);
  }
}

function namedInjectionCollector(as) {
  for (var _len3 = arguments.length, splat = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
    splat[_key3 - 1] = arguments[_key3];
  }

  if (splat.length === 1 && !splat[0]) {
    splat = [];
  }
  if (splat.length === 1 && splat[0].length > 0) {
    splat = splat[0];
  }

  var base = this;
  var $inject = (base.$inject || []).concat([]);
  var injectLen = base.$inject.length;
  var splatIdxs = [];

  var idx = $inject.indexOf(as);
  if (idx < 0) {
    return base;
  }

  while (idx >= 0) {
    splatIdxs.unshift(idx);
    $inject.splice(idx, 1);
    injectLen--;
    idx = $inject.indexOf(as);
  }

  $inject = $inject.concat(splat);
  collectInjections.$inject = $inject;
  return collectInjections;

  function collectInjections() {
    var injectVals = Array.prototype.slice.call(arguments, 0, injectLen);
    var splatVals = Array.prototype.slice.call(arguments, injectLen);

    var namedSplat = {};

    for (var nameIdx in splat) {
      namedSplat[splat[nameIdx]] = splatVals[nameIdx];
    }

    for (var splatIdx in splatIdxs) {
      injectVals.splice(splatIdxs[splatIdx], 0, namedSplat);
    }

    return base.apply(this, injectVals);
  }
}

_app.app.constant("$hooks", { $fake: true });
var nextHookId = 0;
function pushHook(name, func) {
  if (!func) {
    return this;
  }

  var base = this;
  nextHookId++;
  var hookId = "_hook_" + name + "_" + nextHookId;
  var $inject = base.$inject || [];
  var hooksIdx = $inject.indexOf("$hooks");

  binder.$inject = [hookId].concat($inject);
  return injectionCollector.call(binder, hookId, func.$inject);

  function binder(vars) {
    for (var _len4 = arguments.length, rest = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
      rest[_key4 - 1] = arguments[_key4];
    }

    var hooks = rest[hooksIdx];
    if (!hooks || hooks.$fake) {
      hooks = {};
      rest[hooksIdx] = hooks;
    }

    var chain = hooks[name];
    if (!chain) {
      chain = [];
      hooks[name] = chain;
    }

    chain.push(hook);
    return base.apply(this, rest);

    function hook() {
      return func.apply(this, vars);
    }
  }
}

},{"./Controller":2,"./app":6,"./utils":8}],6:[function(require,module,exports){
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

var appRootState = null;
var appDeps = ["ui.router", "ui.router.stateHelper"];
var app = _angular2["default"].module("app", appDeps);

exports.app = app;
app.config(["stateHelperProvider", function (stateHelperProvider) {
  if (appRootState) {
    stateHelperProvider.setNestedState(appRootState);
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
  appRootState = mainState && mainState.$$state && mainState.$$state.state || undefined;

  for (var _len = arguments.length, deps = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    deps[_key - 1] = arguments[_key];
  }

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
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

},{"angular":undefined,"angular-ui-router":undefined,"angular-ui-router.statehelper":undefined,"jquery":undefined}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _app = require("./app");

Object.defineProperty(exports, "app", {
  enumerable: true,
  get: function get() {
    return _app.app;
  }
});
Object.defineProperty(exports, "ng", {
  enumerable: true,
  get: function get() {
    return _app.ng;
  }
});
Object.defineProperty(exports, "bootstrap", {
  enumerable: true,
  get: function get() {
    return _app.bootstrap;
  }
});
Object.defineProperty(exports, "includeModule", {
  enumerable: true,
  get: function get() {
    return _app.includeModule;
  }
});
Object.defineProperty(exports, "beforeBoot", {
  enumerable: true,
  get: function get() {
    return _app.beforeBoot;
  }
});

var _Inject = require("./Inject");

Object.defineProperty(exports, "Inject", {
  enumerable: true,
  get: function get() {
    return _Inject.Inject;
  }
});

var _Service = require("./Service");

Object.defineProperty(exports, "Service", {
  enumerable: true,
  get: function get() {
    return _Service.Service;
  }
});

var _Controller = require("./Controller");

Object.defineProperty(exports, "Controller", {
  enumerable: true,
  get: function get() {
    return _Controller.Controller;
  }
});

var _Component = require("./Component");

Object.defineProperty(exports, "Component", {
  enumerable: true,
  get: function get() {
    return _Component.Component;
  }
});

var _State = require("./State");

Object.defineProperty(exports, "State", {
  enumerable: true,
  get: function get() {
    return _State.State;
  }
});
Object.defineProperty(exports, "mountAt", {
  enumerable: true,
  get: function get() {
    return _State.mountAt;
  }
});

},{"./Component":1,"./Controller":2,"./Inject":3,"./Service":4,"./State":5,"./app":6}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dashCase = dashCase;
exports.funcName = funcName;
exports.superClass = superClass;

function dashCase(str) {
  return str.replace(/([A-Z])/g, function ($1) {
    return "-" + $1.toLowerCase();
  });
}

function funcName(f) {
  var name = f && f.name || null;

  if (name === null) {
    name = f.toString().match(/^function\s*([^\s(]+)/)[1];
  }

  return name;
}

function superClass(constructor) {
  if (!constructor) {
    return Object;
  }
  if (!constructor.prototype) {
    return Object;
  }
  if (!Object.getPrototypeOf(constructor.prototype)) {
    return Object;
  }
  return Object.getPrototypeOf(constructor.prototype).constructor || Object;
}

},{}]},{},[7])(7)
});
//# sourceMappingURL=fd-angular-core.js.map
