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
//# sourceMappingURL=Service.js.map