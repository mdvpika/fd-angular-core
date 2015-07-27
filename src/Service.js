import {funcMeta} from "./utils";
import {app} from "./app";

export function Service(name) {
	if (typeof name === "function") {
		let constructor = name; name = null;
		return register(constructor);
	}
	return register;

	function register(constructor){
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

	meta.service = {};
}
