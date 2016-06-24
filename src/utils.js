import {app} from './app';

export function dashCase(str) {
	return str.replace(/([A-Z])/g, function ($1) {
		return "-" + $1.toLowerCase();
	});
}

export function funcName(func) {
	return funcMeta(func).name;
}

export function superClass(func) {
	return funcMeta(func).superClass;
}

/**
@function Metadata
@param {Function} func
@returns {Object} The function metadata.
*/
export function funcMeta(func) {
	if (!func) {
		return null;
	}

	if (func.$meta !== undefined) {
		if (testEqualConstructor(func.$meta.top)) {
			return func.$meta;
		}
		if (testEqualConstructor(func.$meta.base)) {
			return func.$meta;
		}
		if (func.$meta.wrappers.findIndex(testEqualConstructor) >= 0) {
			return func.$meta;
		}
	}

	let meta = {
		controller: null,
		service:    null,
		state:      null,
		wrappers:   [],
		base:       func,
		top:        func,
		name:       getName(),
		superClass: getSuperClass(),
		wrap:       wrapFunc,
	};

	func.$meta = meta;

	return meta;

	function testEqualConstructor(other) {
		return ((func === other) || (func.prototype && func.prototype.constructor === other));
	}

	function getName() {
		let name = ((func && func.name) || null);
		if (name === null) {
			name = func.toString().match(/^function\s*([^\s(]+)/)[1];
		}
		return name;
	}

	function getSuperClass() {
		if (!func) { return null; }
		if (!func.prototype) { return null; }
		if (!Object.getPrototypeOf(func.prototype)) { return null; }
		let s = Object.getPrototypeOf(func.prototype).constructor || null;
		if (s === Object) { s = null; }
		return s;
	}
}

export function wrapFunc(wrapperFunc) {
	let func = this.top;

	this.top = wrapperFunc;
	if (!this.wrappers) {
		this.wrappers = [wrapperFunc];
	} else {
		this.wrappers.unshift(wrapperFunc);
	}

	wrapperFunc.$meta = this;
	wrapperFunc.prototype = func.prototype;

	// inherit $inject
	if (func.$inject) {
		wrapperFunc.$inject = func.$inject.slice();
	}

	if (this.controller) {
		// re-register controller
		app.controller(this.controller.name, this.top);
	}

	if (this.service) {
		// re-register service
		app.service(this.service.name, this.top);
	}

	return wrapperFunc;
}
