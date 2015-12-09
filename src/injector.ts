import angular = require("angular");
import {console} from 'mr-util';

var originalInjector = angular.injector;
angular.injector = function createInjector() {
	let i = originalInjector.apply(this, arguments);
	extendInjector(i);
	return i;
};

/** @hidden */
export function extendInjector($injector) {
	if (typeof $injector === 'undefined') {
		console.warn('Called extendInjector without an $injector. This might be because you have the Batarang browser extension running.');
		return;
	}

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

}
