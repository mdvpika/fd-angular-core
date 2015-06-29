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
//# sourceMappingURL=utils.js.map