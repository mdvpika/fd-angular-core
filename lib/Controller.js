"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Controller = Controller;

var _utils = require("./utils");

var _app = require("./app");

/**
@function Controller
@param {String} [name] - The name of the controller.

@example
[@]Controller()
class MyController {}

*/

function Controller(name, options) {
	if (typeof name === "function") {
		var _constructor = name;name = null;
		return register(_constructor, options);
	}

	return register;
	function register(constructor, opts) {
		registerLock(constructor);
		var meta = (0, _utils.funcMeta)(constructor);

		name = name || opts && opts.name || meta.name;
		meta.controller.name = name;

		_app.app.controller(name, constructor);
	}
}

function registerLock(constructor) {
	var meta = (0, _utils.funcMeta)(constructor);
	var lock = meta.controller;

	if (lock) {
		throw "@Controller() can only be used once!";
	}

	meta.controller = {};
}
//# sourceMappingURL=Controller.js.map