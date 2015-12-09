import {funcMeta} from "./utils";
import {app} from "./app";

/**

```js
; @Service()
class MyService {}
```

*/
export function Service(name?: string) : ClassDecorator;
export function Service<T extends Function>(target: T) : T;
export function Service(name) : any {
	if (typeof name === "function") {
		let constructor : Function = name; name = null;
		return register(constructor);
	}
	return register;

	function register(constructor: any){
		registerLock(constructor);
		let meta = funcMeta(constructor);

		name = (name || meta.name);
		meta.service.name = name;

		app.service(name, constructor);
	}
}

function registerLock(constructor) {
	let meta = funcMeta(constructor);
	var lock = meta.service;

	if (lock) {
		throw "@Service() can only be used once!";
	}

	meta.service = { name: null };
}
