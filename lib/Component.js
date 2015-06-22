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
//# sourceMappingURL=Component.js.map