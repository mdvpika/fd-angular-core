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
  var bindTo = opts.bindTo;

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
      if (children && children.length > 0) {
        template = '<ui-view></ui-view>';
      }
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

    var controllerAs = name;
    if (bindTo) {
      controllerAs = bindTo;
    }

    var state = {
      name: name,
      template: template,
      templateUrl: templateUrl,
      controllerAs: controllerAs,

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
//# sourceMappingURL=State.js.map