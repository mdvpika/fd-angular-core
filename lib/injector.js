'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.extendInjector = extendInjector;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var originalInjector = _angular2['default'].injector;
_angular2['default'].injector = function createInjector() {
	var i = originalInjector.apply(this, arguments);
	extendInjector(i);
	return i;
};

function extendInjector($injector) {

	var originalInvoke = $injector.invoke;
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

	var originalInstantiate = $injector.instantiate;
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
}
//# sourceMappingURL=injector.js.map