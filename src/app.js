import $ from "jquery";
import angular from "angular";
import {extendInjector} from './injector';

// Base modules
import "angular-ui-router";
import "angular-ui-router.statehelper";

import {buildUiRouterState} from './State';

let appRootState = null;
let appDeps = ["ui.router", "ui.router.stateHelper"];
export var app = angular.module("app", appDeps);

app.run(['$injector', function($injector) {
	extendInjector($injector);
}]);

app.config(["stateHelperProvider", function(stateHelperProvider) {
	if (appRootState) {
		let state = buildUiRouterState(appRootState);
		stateHelperProvider.setNestedState(state);
	}
}]);

export function includeModule(name) {
	appDeps.push(name);
}

export var ng = angular;
var beforeBootPromise = Promise.resolve(true);

export function beforeBoot(p) {
	beforeBootPromise = beforeBootPromise.then(() => Promise.resolve(p));
}

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
