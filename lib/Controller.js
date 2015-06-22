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
//# sourceMappingURL=Controller.js.map