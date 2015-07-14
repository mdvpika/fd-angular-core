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
    registerLock(constructor);
    var meta = (0, _utils.funcMeta)(constructor);

    name = name || opts && opts.name || meta.name;
    meta.controller.name = name;

    _app.app.controller(name, constructor);
  }
}

function registerLock(constructor) {
  var meta = (0, _utils.funcMeta)(constructor);
  var lock = meta.controller;

  if (lock) {
    throw "@Controller() can only be used once!";
  }

  meta.controller = {};
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

  return function (target, name, desc) {
    var isMethod = desc && typeof desc.value === "function";

    if (isMethod) {
      desc.value.$inject = deps;
    } else {
      target.$inject = deps;
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
    registerLock(constructor);
    var meta = (0, _utils.funcMeta)(constructor);

    name = name || meta.name;
    meta.service.name = name;

    _app.app.service(name, constructor);
  }
}

function registerLock(constructor) {
  var meta = (0, _utils.funcMeta)(constructor);
  var lock = meta.service;

  if (lock) {
    throw "@Service() can only be used once!";
  }

  meta.service = {};
}

},{"./app":6,"./utils":8}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.State = State;
exports.mountAt = mountAt;
exports.buildUiRouterState = buildUiRouterState;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _utils = require("./utils");

var _Controller = require("./Controller");

var DEFAULT_SUFFIX = "Controller";

/*
@param {Object}  opts - The options
@param {string}  [opts.name] - The name of the state.
@param {string}  [opts.bindTo] - Bind the controller to the provided name.
@param {string}  [opts.url] - The url of the state.
@param {Boolean} [opts.abstract] - True for abstract states.
@param {string}  [opts.template] - An angular template.
@param {string}  [opts.templateUrl] - A URL to an angular template.
@param {State[]} [opts.children] - List of child states.
@param {string}  [opts.controllerName] - The name of the controller as seen by angular.
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
      State.onActivate(prototype, "activate", { value: prototype.activate });
    }
    if (prototype.attach) {
      State.onAttach(prototype, "attach", { value: prototype.attach });
    }
    if (prototype.detach) {
      State.onDetach(prototype, "detach", { value: prototype.detach });
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

    var inheritedTemplated = false;
    if (opts.template === false) {
      meta.state.template = null;
    } else if (opts.template) {
      meta.state.template = opts.template;
    } else if (opts.templateUrl) {
      meta.state.templateUrl = opts.templateUrl;
    } else if (superMeta.state.template) {
      inheritedTemplated = true;
      meta.state.template = superMeta.state.template;
    } else if (superMeta.state.templateUrl) {
      inheritedTemplated = true;
      meta.state.templateUrl = superMeta.state.templateUrl;
    }
    if (!meta.state.template && !meta.state.templateUrl) {
      if (meta.state.children.length > 0) {
        meta.state.template = "<ui-view></ui-view>";
      } else {
        meta.state.template = "";
      }
    }

    if (opts.name) {
      meta.state.name = opts.name;
    } else {
      var _name = meta.name;
      _name = _name[0].toLowerCase() + _name.substr(1, _name.length - DEFAULT_SUFFIX.length - 1);
      meta.state.name = _name;
    }

    if (opts.bindTo) {
      if (inheritedTemplated) {
        throw Error("bindTo cannot be used with inherited templates");
      }
      meta.state.bindTo = opts.bindTo;
    } else {
      if (inheritedTemplated) {
        meta.state.bindTo = superMeta.state.bindTo;
      } else {
        meta.state.bindTo = meta.state.name;
      }
    }

    if (opts.url === false) {
      if (opts.url) {
        meta.state.url = opts.url;
      } else if (superMeta.state.url) {
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

function mountAt(url) {
  var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var name = opts.name;

  return {
    state: this,
    url: url,
    name: name,
    buildUiRouterState: builder
  };

  function builder() {
    var state = buildUiRouterState(this.state);

    if (this.url) {
      state.url = url;
    }

    if (this.name) {
      state.name = name;
    }

    return state;
  }
}

function buildUiRouterState(obj) {
  console.log("buildUiRouterState: %o", obj);
  if (!obj) {
    return null;
  }

  if (obj.buildUiRouterState) {
    var _state = obj.buildUiRouterState();
    console.log("State: => %o", _state);
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

      children.push(buildUiRouterState(child));
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

  var state = {
    name: meta.state.name,
    template: meta.state.template,
    templateUrl: meta.state.templateUrl,
    controllerAs: meta.state.bindTo,
    url: meta.state.url,
    abstract: meta.state.abstract,
    children: children,
    controller: [meta.state.name, "$locals", "$injector", "$scope", controllerAttacher],
    resolve: _defineProperty({}, meta.state.name, ["$q", "$controller", "$locals", "$injector", controllerProvider])
  };

  console.log("State: => %o", state);
  return state;

  function controllerAttacher(ctrl, $locals, $injector, $scope) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = meta.callbacks.onAttach[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var clb = _step2.value;

        $injector.invoke(clb, ctrl, $locals);
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

    $scope.$on("$destroy", function () {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = meta.callbacks.onDetach[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var clb = _step3.value;

          $injector.invoke(clb, ctrl, $locals);
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
    });

    return ctrl;
  }

  function controllerProvider($q, $controller, $locals, $injector) {
    var ctrl = $controller(meta.controller.name, $locals);
    var p = $q.when(ctrl);

    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      var _loop = function () {
        var clb = _step4.value;

        p = p.then(function () {
          return $injector.invoke(clb, ctrl, $locals);
        });
      };

      for (var _iterator4 = meta.callbacks.onActivate[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        _loop();
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

    p = p.then(function () {
      return ctrl;
    });
    return p;
  }
}

},{"./Controller":2,"./utils":8}],6:[function(require,module,exports){
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

},{"./State":5,"angular":undefined,"angular-ui-router":undefined,"angular-ui-router.statehelper":undefined,"jquery":undefined}],7:[function(require,module,exports){
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

var _utils = require("./utils");

Object.defineProperty(exports, "Metadata", {
  enumerable: true,
  get: function get() {
    return _utils.funcMeta;
  }
});

},{"./Component":1,"./Controller":2,"./Inject":3,"./Service":4,"./State":5,"./app":6,"./utils":8}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dashCase = dashCase;
exports.funcName = funcName;
exports.superClass = superClass;
exports.funcMeta = funcMeta;
exports.wrapFunc = wrapFunc;

var _app = require("./app");

function dashCase(str) {
  return str.replace(/([A-Z])/g, function ($1) {
    return "-" + $1.toLowerCase();
  });
}

function funcName(func) {
  return funcMeta(func).name;
}

function superClass(func) {
  return funcMeta(func).superClass;
}

function funcMeta(func) {
  if (func.$meta !== undefined) {
    return func.$meta;
  }

  var meta = {
    controller: null,
    service: null,
    state: null,
    wrappers: null,
    base: func,
    top: func,
    name: getName(),
    superClass: getSuperClass()
  };

  func.$meta = meta;

  return meta;

  function getName() {
    var name = func && func.name || null;
    if (name === null) {
      name = func.toString().match(/^function\s*([^\s(]+)/)[1];
    }
    return name;
  }

  function getSuperClass() {
    if (!func) {
      return null;
    }
    if (!func.prototype) {
      return null;
    }
    if (!Object.getPrototypeOf(func.prototype)) {
      return null;
    }
    return Object.getPrototypeOf(func.prototype).constructor || null;
  }
}

function wrapFunc(func, wrapperFunc) {
  var meta = funcMeta(func);

  meta.top = wrapperFunc;
  if (!meta.wrappers) {
    meta.wrappers = [wrapperFunc];
  } else {
    meta.wrappers.unshift(wrapperFunc);
  }

  wrapperFunc.$meta = meta;

  // inherit $inject
  if (func.$inject) {
    wrapperFunc.$inject = func.$inject.slice();
  }

  if (meta.controller) {
    // re-register controller
    _app.app.controller(meta.controller.name, meta.top);
  }

  if (meta.service) {
    // re-register service
    _app.app.service(meta.service.name, meta.top);
  }

  return wrapperFunc;
}

},{"./app":6}]},{},[7])(7)
});
//# sourceMappingURL=fd-angular-core.js.map
