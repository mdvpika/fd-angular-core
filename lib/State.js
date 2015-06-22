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

    if (constructor.$$resolvers) {
      for (var _name in constructor.$$resolvers) {
        resolve[_name] = constructor.$$resolvers[_name];
      }
    }

    var state = {
      name: name,
      template: template,
      templateUrl: templateUrl,
      controller: (0, _utils.funcName)(constructor),
      controllerAs: name,

      children: children.map(function (c) {
        return Object.create(c.$state, {});
      }),
      resolve: resolve,
      url: url,
      abstract: abstract
    };

    if (constructor.onEnter) {
      state.onEnter = constructor.onEnter;
    }

    if (constructor.onExit) {
      state.onExit = constructor.onExit;
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
//# sourceMappingURL=State.js.map