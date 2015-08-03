import $ from "jquery";
import angular from "angular";
import {extendInjector} from './injector';

// Base modules
import "angular-ui-router";

import {buildUiRouterState, flattenUiRouterStates} from './State';

/**
@var {ngModule} app
*/
let appRootState = null;
let appDeps = ["ui.router"];
export var app = angular.module("app", appDeps);

app.run(['$injector', function($injector) {
	extendInjector($injector);
}]);

app.config(["$stateProvider", function($stateProvider) {
	if (appRootState) {
		let state = buildUiRouterState(appRootState);
		let states = flattenUiRouterStates(state);
		for (let state of states) {
			$stateProvider.state(state);
		}
	}
}]);

/**
@function includeModule
@param {String} name - name of the module to include.
*/
export function includeModule(name) {
	appDeps.push(name);
}

/**
@var {angular} ng
*/
export var ng = angular;
var beforeBootPromise = Promise.resolve(true);

/**
@function beforeBoot
@param {Promise} p - includes a Promise before the app is booted.
*/
export function beforeBoot(p) {
	beforeBootPromise = beforeBootPromise.then(() => Promise.resolve(p));
}

/**
@function bootstrap
@param {State} mainState
@param {...Sgtring} deps
@return {Promise}
*/
export function bootstrap(mainState, ...deps) {
	appRootState = mainState;
	for (let dep of deps) {
		includeModule(dep);
	}

	return beforeBootPromise.then(function() {
		return new Promise(function(resolve, reject){
			$(() => {
				try {
					let injector = angular.bootstrap(document, ["app"]);
					extendInjector(injector);
					resolve();
				} catch(e) {
					reject(e);
				}
			});
		});
	});
}
