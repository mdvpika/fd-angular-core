import {app} from './app';
import {IViews, IResolvers, IState} from './State';

/** @hidden */
export function dashCase(str : string) : string {
	return str.replace(/([A-Z])/g, function ($1) {
		return "-" + $1.toLowerCase();
	});
}

/** @hidden */
export function funcName(func : Function) : string {
	return funcMeta(func).name;
}

/** @hidden */
export function superClass(func : Function) : Function {
	return funcMeta(func).superClass;
}

/** @hidden */
export interface IMetadata {
	controller: ControllerMetadata;
	service:    ServiceMetadata;
	state:      StateMetadata;
	wrappers:   Function;
	base:       Function;
	top:        Function;
	name:       string;
	superClass: Function;
	wrap:       Function;
}

/** @hidden */
export interface StateMetadata {
	name:       string;
	bindTo:     string;
	url:        string;
	hidden:     boolean;
	abstract:   boolean;
	registered: boolean;
	aliases:    string[];
	children:   IState[];
	views:      IViews;
	resolve:    IResolvers;
	callbacks: {
		onActivate: Function[];
		onAttach: Function[];
		onDetach: Function[];
	};
}

/** @hidden */
export interface ControllerMetadata {
	name: string;
}

/** @hidden */
export interface ServiceMetadata {
	name: string;
}

/**
@returns The function metadata.
*/
export declare function Metadata(func: Function) : IMetadata;

/** @hidden */
export function funcMeta(func: Function) : IMetadata;
export function funcMeta(func) : any {
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

	let meta : IMetadata = {
		controller: null,
		service:    null,
		state:      null,
		wrappers:   null,
		base:       func,
		top:        func,
		name:       getName(),
		superClass: getSuperClass(),
		wrap:       wrapFunc,
	};

	func.$meta = meta;

	return meta;

	function testEqualConstructor(other : Function) : boolean {
		return ((func === other) || (func.prototype && func.prototype.constructor === other));
	}

	function getName() : string {
		let name = ((func && func.name) || null);
		if (name === null) {
			name = func.toString().match(/^function\s*([^\s(]+)/)[1];
		}
		return name;
	}

	function getSuperClass() : Function {
		if (!func) { return null; }
		if (!func.prototype) { return null; }
		if (!Object.getPrototypeOf(func.prototype)) { return null; }
		let s = Object.getPrototypeOf(func.prototype).constructor || null;
		if (s === Object) { s = null; }
		return s;
	}
}

/** @hidden */
export function wrapFunc(wrapperFunc: Function) : Function {
	let func = this.top;

	this.top = wrapperFunc;
	if (!this.wrappers) {
		this.wrappers = [wrapperFunc];
	} else {
		this.wrappers.unshift(wrapperFunc);
	}

	wrapperFunc['$meta'] = this;
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

/** @hidden */
export function assign<T>(dst: T, src: T) : T {
	if (Object['assign']){
		return Object['assign'](dst, src);
	}

	return assignPolyfill<T>(dst, src);
}

function assignPolyfill<T>(target: T, firstSource: T) {
	if (target === undefined || target === null) {
		throw new TypeError('Cannot convert first argument to object');
	}

	var to = Object(target);
	for (var i = 1; i < arguments.length; i++) {
		var nextSource = arguments[i];
		if (nextSource === undefined || nextSource === null) {
			continue;
		}

		var keysArray = Object.keys(Object(nextSource));
		for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
			var nextKey = keysArray[nextIndex];
			var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
			if (desc !== undefined && desc.enumerable) {
				to[nextKey] = nextSource[nextKey];
			}
		}
	}
	return to;
}
