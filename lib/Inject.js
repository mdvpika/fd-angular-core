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
//# sourceMappingURL=Inject.js.map