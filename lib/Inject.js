'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.Inject = Inject;

var _app = require('./app');

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

_app.app.run(['$injector', function $superProvider($injector) {

  $injector.superConstruct = function superConstruct(target, locals) {
    return this.superCall(target, 'constructor', locals);
  };

  $injector.superCall = function superCall(target, method, locals) {
    var func = get(Object.getPrototypeOf(B.prototype), method, this);
    return this.invoke(func, target, locals);
  };

  function get(_x, _x2, _x3) {
    var _again = true;
    _function: while (_again) {
      var object = _x,
          property = _x2,
          receiver = _x3;
      desc = parent = getter = undefined;
      _again = false;
      if (object === null) object = Function.prototype;
      var desc = Object.getOwnPropertyDescriptor(object, property);
      if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
          return undefined;
        } else {
          _x = parent;
          _x2 = property;
          _x3 = receiver;
          _again = true;
          continue _function;
        }
      } else if ('value' in desc) {
        return desc.value;
      } else {
        var getter = desc.get;
        if (getter === undefined) {
          return undefined;
        }
        return getter.call(receiver);
      }
    }
  }
}]);
//# sourceMappingURL=Inject.js.map