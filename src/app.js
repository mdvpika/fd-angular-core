import $ from "jquery";
import angular from "angular";

// Base modules
import "angular-ui-router";
import "angular-ui-router.statehelper";

import {buildUiRouterState} from './State';

let appRootState = null;
let appDeps = ["ui.router", "ui.router.stateHelper"];
export var app = angular.module("app", appDeps);

app.config(['$injector', function($injector) {

  let originalInvoke = $injector.invoke;
  $injector.invoke = function invoke(fn, self, locals, serviceName) {
    if (typeof locals === 'string') {
      serviceName = locals;
      locals = null;
    }

    if (!locals) {
      locals = {};
    }
    locals.$locals = locals;

    return originalInvoke.call(this, fn, self, locals, serviceName);
  };

  let originalInstantiate = $injector.instantiate;
  $injector.instantiate = function instantiate(Type, locals, serviceName) {
    if (typeof locals === 'string') {
      serviceName = locals;
      locals = null;
    }

    if (!locals) {
      locals = {};
    }
    locals.$locals = locals;

    return originalInstantiate.call(this, Type, locals, serviceName);
  };

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
          angular.bootstrap(document, ["app"]);
          resolve();
        } catch(e) {
          reject(e);
        }
      });
    });
  });
}
