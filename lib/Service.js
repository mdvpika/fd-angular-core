"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Service = Service;

var _utils = require("./utils");

var _app = require("./app");

function Service(name) {
	if (typeof name === "function") {
		var _constructor = name;name = null;
		return register(_constructor);
	}
	return register;

	function register(constructor) {
		registerLock(constructor);
		var meta = (0, _utils.funcMeta)(constructor);

		name = name || meta.name;
		meta.service.name = name;

		_app.app.service(name, constructor);
	}
}

function registerLock(constructor) {
	var meta = (0, _utils.funcMeta)(constructor);
	var lock = meta.service;

	if (lock) {
		throw "@Service() can only be used once!";
	}

	meta.service = {};
}
//# sourceMappingURL=Service.js.map