import angular from "angular";

var originalInjector = angular.injector;
angular.injector = function createInjector() {
  let i = originalInjector.apply(this, arguments);
  extendInjector(i);
  return i;
};

export function extendInjector($injector) {

  let originalInvoke = $injector.invoke;
  $injector.invoke = function invoke(fn, self, locals, serviceName) {
    if (typeof locals === 'string') {
      serviceName = locals;
      locals = null;
    }

    if (!locals) {
      locals = {};
    }
    locals.$locals = locals;

    return originalInvoke.call(this, fn, self, locals, serviceName);
  };

  let originalInstantiate = $injector.instantiate;
  $injector.instantiate = function instantiate(Type, locals, serviceName) {
    if (typeof locals === 'string') {
      serviceName = locals;
      locals = null;
    }

    if (!locals) {
      locals = {};
    }
    locals.$locals = locals;

    return originalInstantiate.call(this, Type, locals, serviceName);
  };

};
