/// <reference path="../typings/tsd.d.ts" />

import $ = require("jquery");
import angular = require("angular");
import {extendInjector} from './injector';
import {console} from 'mr-util';

// Base modules
import "angular-ui-router";

import {buildUiRouterState, flattenUiRouterStates, IState} from './State';


let appRootState = null;
let appDeps = ["ui.router"];
export var app : angular.IModule = angular.module("app", appDeps);

app.run(['$injector', function($injector) {
	extendInjector($injector);
}]);

app.config(["$stateProvider", function($stateProvider) {
	if (!document.querySelector('[ui-view], ui-view')) {
		console.warn('No root ui-view found!');
	}

	if (appRootState) {
		let state = buildUiRouterState(appRootState);
		let states = flattenUiRouterStates(state);
		for (let s of states) {
			$stateProvider.state(s);
		}
	}
}]);

/**
@param name name of the module to include.
*/
export function includeModule(name: string) : void {
	appDeps.push(name);
}

export var ng = angular;

var beforeBootPromiseGo = undefined;
var beforeBootPromise = new Promise<void>((resolve) => { beforeBootPromiseGo = resolve; });

export function beforeBoot(func: () => Promise<void>) {
	beforeBootPromise = beforeBootPromise.then(() => func());
}

export function bootstrap(mainState: IState, ...deps: string[]) : Promise<void> {
	appRootState = mainState;
	for (let dep of deps) {
		includeModule(dep);
	}

	beforeBootPromiseGo();
	return beforeBootPromise.then(function() {
		return new Promise<void>(function(resolve, reject){
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
