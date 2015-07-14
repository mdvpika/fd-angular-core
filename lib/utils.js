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
//# sourceMappingURL=utils.js.map