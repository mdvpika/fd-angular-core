import {funcMeta} from "./utils";
import {app} from "./app";

/**

@param name The name of the controller.

```js
; @Controller()
class MyController {}
```
*/

export function Controller(name: string) : ClassDecorator;
export function Controller<T extends Function>(target: T) : T;
export function Controller<T extends Function>(target: T, options?) : T;
export function Controller(name, options?) : any {
	if (typeof name === "function") {
		let constructor = name; name = null;
		return register(constructor, options);
	}

	return register;
	function register(constructor, opts){
		registerLock(constructor);
		let meta = funcMeta(constructor);

		name = (name || (opts && opts.name) || meta.name);
		meta.controller.name = name;

		app.controller(name, constructor);
	}
}

function registerLock(constructor) {
	let meta = funcMeta(constructor);
	var lock = meta.controller;

	if (lock) {
		throw "@Controller() can only be used once!";
	}

	meta.controller = { name: null };
}
