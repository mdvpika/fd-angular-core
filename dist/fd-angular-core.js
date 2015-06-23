(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.FdAngularCore = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.Component = Component;

var _utils = require('./utils');

var _app = require('./app');

var _Controller = require('./Controller');

var DEFAULT_SUFFIX = 'Controller';

function Component(opts) {
  if (typeof opts === 'function') {
    var constructor = opts;opts = null;
    return register(constructor);
  }

  opts = opts || {};
  var _opts$restrict = opts.restrict;
  var restrict = _opts$restrict === undefined ? 'EA' : _opts$restrict;
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
      templateUrl = './components/' + tmplName + '/' + tmplName + '.html';
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
  };
}

},{"./Controller":2,"./app":6,"./utils":8}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.Controller = Controller;

var _utils = require('./utils');

var _app = require('./app');

function Controller(name) {
  if (typeof name === 'function') {
    var constructor = name;name = null;
    return register(constructor);
  }
  return register;

  function register(constructor) {
    if (constructor.$controller) {
      return;
    }

    constructor.$controller = true;
    name = name || (0, _utils.funcName)(constructor);
    _app.app.controller(name, constructor);
  }
}

},{"./app":6,"./utils":8}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.Inject = Inject;

function Inject() {
  for (var _len = arguments.length, deps = Array(_len), _key = 0; _key < _len; _key++) {
    deps[_key] = arguments[_key];
  }

  return function (constructor, name, desc) {
    if (desc && typeof desc.value === 'function') {
      desc.value.$inject = deps;
    } else {
      constructor.$inject = deps;
    }
  };
}

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.Service = Service;

var _utils = require('./utils');

var _app = require('./app');

function Service(name) {
  if (typeof name === 'function') {
    var constructor = name;name = null;
    return register(constructor);
  }
  return register;

  function register(constructor) {
    name = name || (0, _utils.funcName)(constructor);
    _app.app.service(name, constructor);
  }
}

},{"./app":6,"./utils":8}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.State = State;

var _utils = require('./utils');

var _app = require('./app');

var _Controller = require('./Controller');

var DEFAULT_SUFFIX = 'Controller';

function State(opts) {
  if (typeof opts === 'function') {
    var constructor = opts;opts = null;
    return register(constructor);
  }

  opts = opts || {};
  var url = opts.url;
  var abstract = opts.abstract;
  var _opts$children = opts.children;
  var children = _opts$children === undefined ? [] : _opts$children;
  var _opts$scope = opts.scope;
  var scope = _opts$scope === undefined ? {} : _opts$scope;
  var _opts$resolve = opts.resolve;
  var resolve = _opts$resolve === undefined ? {} : _opts$resolve;
  var template = opts.template;
  var templateUrl = opts.templateUrl;

  return register;

  function register(constructor) {
    (0, _Controller.Controller)(constructor);

    var name = (0, _utils.funcName)(constructor);
    name = name[0].toLowerCase() + name.substr(1, name.length - DEFAULT_SUFFIX.length - 1);

    if (!template && !templateUrl && template !== false) {
      var tmplName = (0, _utils.dashCase)(name);
      templateUrl = './components/' + tmplName + '/' + tmplName + '.html';
    }

    if (template === false) {
      template = undefined;
      templateUrl = undefined;
    }

    if (constructor.onEnter) {
      State.registerOnEnter(constructor, constructor.onEnter);
    }

    if (constructor.onExit) {
      State.registerOnExit(constructor, constructor.onExit);
    }

    if (constructor.$$resolvers) {
      for (var _name in constructor.$$resolvers) {
        resolve[_name] = constructor.$$resolvers[_name];
      }
    }

    var state = {
      name: name,
      template: template,
      templateUrl: templateUrl,
      controllerAs: name,

      children: children.map(function (c) {
        return Object.create(c.$state, {});
      }),
      resolve: resolve,
      url: url,
      abstract: abstract
    };

    state.controller = function (ctrl, $injector, $scope, $state) {
      var current = $state.$current,
          locals = current && current.locals.globals;

      try {
        if (ctrl.attach) {
          $injector.invoke(ctrl.attach, ctrl, locals);
        }

        if (ctrl.detach) {
          $scope.$on('$destroy', function () {
            $injector.invoke(ctrl.detach, ctrl, locals);
          });
        }
      } catch (e) {
        console.error(e);
        throw e;
      }

      return ctrl;
    };
    state.controller.$inject = [name, '$injector', '$scope', '$state'];

    var $constructorInject = constructor.$inject || [];
    state.resolve['$constructorInject'] = $constructorInject.concat(function () {
      var locals = {};

      for (var idx in $constructorInject) {
        locals[$constructorInject[idx]] = arguments[idx];
      }

      return locals;
    });

    var activate = constructor.prototype.activate;
    var $activateInject = activate && activate.$inject || [];
    state.resolve['$activateInject'] = $activateInject.concat(function () {
      var locals = {};

      for (var idx in $activateInject) {
        locals[$activateInject[idx]] = arguments[idx];
      }

      return locals;
    });

    state.resolve[name] = ['$injector', '$q', '$controller', '$state', '$constructorInject', '$activateInject', function ($injector, $q, $controller, $state, $constructorInject, $activateInject) {
      var ctrl = undefined;
      var p = undefined;

      try {
        ctrl = $controller((0, _utils.funcName)(constructor), $constructorInject);
        p = $q.when(ctrl);
      } catch (e) {
        console.error(e);
        return $q.reject(e);
      }

      if (ctrl.activate) {
        try {
          p = $q.when($injector.invoke(ctrl.activate, ctrl, $activateInject)).then(function (_) {
            return ctrl;
          });
        } catch (e) {
          console.error(e);
          return $q.reject(e);
        }
      }

      return p;
    }];

    if (constructor.$$afterTransition) {
      State.registerOnEnter(constructor, ['$injector', '$q', '$state', function ($injector, $q, $state) {
        var p = $state.transition || $q.when(null);
        var $scope = $state.$current.locals['@app'].$scope;
        var ctrl = $scope[name];

        var _loop = function (idx) {
          var func = constructor.$$afterTransition[idx];

          p = p.then(function () {
            var val = undefined;
            if (func.$$static) {
              val = $injector.invoke(func);
            } else {
              val = $injector.invoke(func, ctrl);
            }
            return $q.when(val);
          });
        };

        for (var idx in constructor.$$afterTransition) {
          _loop(idx);
        }
      }]);
    }

    if (constructor.$$onEnter) {
      state.onEnter = ['$injector', '$q', function ($injector, $q) {
        var p = $q.when(null);

        var _loop2 = function (idx) {
          var func = constructor.$$onEnter[idx];

          p = p.then(function () {
            var val = $injector.invoke(func);
            return $q.when(val);
          });
        };

        for (var idx in constructor.$$onEnter) {
          _loop2(idx);
        }

        return p;
      }];
    }

    if (constructor.$$onExit) {
      state.onExit = ['$injector', '$q', function ($injector, $q) {
        var p = $q.when(null);

        var _loop3 = function (idx) {
          var func = constructor.$$onExit[idx];

          p = p.then(function () {
            var val = $injector.invoke(func);
            return $q.when(val);
          });
        };

        for (var idx in constructor.$$onExit) {
          _loop3(idx);
        }

        return p;
      }];
    }

    constructor.$state = state;
  }
}

State.resolveAs = function resolveAs(name) {
  return function (target, funcName, desc) {
    if (!target.$$resolvers) {
      target.$$resolvers = {};
    }
    if (typeof desc.value != 'function') {
      throw Error('expected a function');
    }
    target.$$resolvers[name] = desc.value;
  };
};

State.onEnter = function onEnter(target, name, desc) {
  if (typeof target !== 'function') {
    throw Error('@State.onEnter can only be used with static methods.');
  }

  State.registerOnEnter(target, desc.value);
};

State.registerOnEnter = function registerOnEnter(target, func) {
  if (!target.$$onEnter) {
    target.$$onEnter = [];
  }

  target.$$onEnter.push(func);
};

State.onExit = function onExit(target, name, desc) {
  if (typeof target !== 'function') {
    throw Error('@State.onExit can only be used with static methods.');
  }

  State.registerOnExit(target, desc.value);
};

State.registerOnExit = function registerOnExit(target, func) {
  if (!target.$$onExit) {
    target.$$onExit = [];
  }

  target.$$onExit.push(func);
};

State.afterTransition = function afterTransition(target, name, desc) {
  var func = desc.value;

  if (typeof target === 'function') {
    func.$$static = true;
  } else {
    func.$$static = false;
  }

  State.registerAfterTransition(target, func);
};

State.registerAfterTransition = function registerAfterTransition(target, func) {
  if (!target.$$afterTransition) {
    target.$$afterTransition = [];
  }

  target.$$afterTransition.push(func);
};

},{"./Controller":2,"./app":6,"./utils":8}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.includeModule = includeModule;
exports.bootstrap = bootstrap;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

// Base modules

require('angular-ui-router');

require('angular-ui-router.statehelper');

var appRootState = null;
var appDeps = ['ui.router', 'ui.router.stateHelper'];
var app = _angular2['default'].module('app', appDeps);

exports.app = app;
app.config(['stateHelperProvider', function (stateHelperProvider) {
  if (appRootState) {
    stateHelperProvider.setNestedState(appRootState);
  }
}]);

function includeModule(name) {
  appDeps.push(name);
}

var ng = _angular2['default'];

exports.ng = ng;

function bootstrap(mainState) {
  appRootState = mainState && mainState.$state || undefined;

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
      if (!_iteratorNormalCompletion && _iterator['return']) {
        _iterator['return']();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return new Promise(function (resolve, reject) {
    (0, _jquery2['default'])(function () {
      try {
        _angular2['default'].bootstrap(document, ['app']);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  });
}

},{"angular":undefined,"angular-ui-router":undefined,"angular-ui-router.statehelper":undefined,"jquery":undefined}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _app = require('./app');

Object.defineProperty(exports, 'app', {
  enumerable: true,
  get: function get() {
    return _app.app;
  }
});
Object.defineProperty(exports, 'ng', {
  enumerable: true,
  get: function get() {
    return _app.ng;
  }
});
Object.defineProperty(exports, 'bootstrap', {
  enumerable: true,
  get: function get() {
    return _app.bootstrap;
  }
});
Object.defineProperty(exports, 'includeModule', {
  enumerable: true,
  get: function get() {
    return _app.includeModule;
  }
});

var _Inject = require('./Inject');

Object.defineProperty(exports, 'Inject', {
  enumerable: true,
  get: function get() {
    return _Inject.Inject;
  }
});

var _Service = require('./Service');

Object.defineProperty(exports, 'Service', {
  enumerable: true,
  get: function get() {
    return _Service.Service;
  }
});

var _Controller = require('./Controller');

Object.defineProperty(exports, 'Controller', {
  enumerable: true,
  get: function get() {
    return _Controller.Controller;
  }
});

var _Component = require('./Component');

Object.defineProperty(exports, 'Component', {
  enumerable: true,
  get: function get() {
    return _Component.Component;
  }
});

var _State = require('./State');

Object.defineProperty(exports, 'State', {
  enumerable: true,
  get: function get() {
    return _State.State;
  }
});

},{"./Component":1,"./Controller":2,"./Inject":3,"./Service":4,"./State":5,"./app":6}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.dashCase = dashCase;
exports.funcName = funcName;

function dashCase(str) {
  return str.replace(/([A-Z])/g, function ($1) {
    return '-' + $1.toLowerCase();
  });
}

function funcName(f) {
  var name = f && f.name || null;

  if (name === null) {
    name = f.toString().match(/^function\s*([^\s(]+)/)[1];
  }

  return name;
}

},{}]},{},[7])(7)
});
//# sourceMappingURL=fd-angular-core.js.map
