'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.Controller = Controller;

var _utils = require('./utils');

var _app = require('./app');

function Controller(name, opts) {
  if (typeof name === 'function') {
    var _constructor = name;name = null;
    return register(_constructor, opts);
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
    throw '@Controller() can only be used once!';
  }

  constructor.$$controller = { constructor: constructor };
  return constructor.$$controller;
}
//# sourceMappingURL=Controller.js.map