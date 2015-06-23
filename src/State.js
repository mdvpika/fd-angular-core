import {funcName, dashCase} from './utils';
import {app} from './app';
import {Controller} from './Controller';

const DEFAULT_SUFFIX = 'Controller';

export function State(opts) {
  if (typeof opts === 'function') {
    var constructor = opts; opts = null;
    return register(constructor);
  }

  opts = (opts || {});
  var {
    url,
    abstract,
    children=[],
    scope={},
    resolve={},
    template,
    templateUrl,
    bindTo
  } = opts;
  return register;

  function register(constructor) {
    Controller(constructor);

    var name = funcName(constructor);
    name = name[0].toLowerCase() + name.substr(1, name.length - DEFAULT_SUFFIX.length - 1);

    if (!template && !templateUrl && (template !== false)) {
      var tmplName = dashCase(name);
      templateUrl = './components/'+tmplName+'/'+tmplName+'.html';
    }

    if (template === false) {
      template = undefined;
      templateUrl = undefined;
      if (children && children.length > 0) {
        template = `<ui-view></ui-view>`
      }
    }

    if (constructor.onEnter) {
      State.registerOnEnter(constructor, constructor.onEnter);
    }

    if (constructor.onExit) {
      State.registerOnExit(constructor, constructor.onExit);
    }

    if (constructor.$$resolvers) {
      for (let name in constructor.$$resolvers) {
        resolve[name] = constructor.$$resolvers[name];
      }
    }

    let controllerAs = name;
    if (bindTo) {
      controllerAs = bindTo;
    }

    let state = {
      name:         name,
      template:     template,
      templateUrl:  templateUrl,
      controllerAs: controllerAs,

      children:     children.map(c => Object.create(c.$state, {})),
      resolve:      resolve,
      url:          url,
      abstract:     abstract,
    };

    state.controller = function(ctrl, $injector, $scope, $state) {
      let current = $state.$current,
          locals  = current && current.locals.globals;

      try {
        if (ctrl.attach) {
          $injector.invoke(ctrl.attach, ctrl, locals);
        }

        if (ctrl.detach) {
          $scope.$on('$destroy', function() {
            $injector.invoke(ctrl.detach, ctrl, locals);
          });
        }
      } catch(e) {
        console.error(e);
        throw e;
      }

      return ctrl;
    };
    state.controller.$inject = [name, '$injector', '$scope', '$state'];

    let $constructorInject = (constructor.$inject || []);
    state.resolve['$constructorInject'] = $constructorInject.concat(function() {
      let locals = {};

      for (let idx in $constructorInject) {
        locals[$constructorInject[idx]] = arguments[idx];
      }

      return locals
    });

    let activate = constructor.prototype.activate
    let $activateInject = ((activate && activate.$inject) || []);
    state.resolve['$activateInject'] = $activateInject.concat(function() {
      let locals = {};

      for (let idx in $activateInject) {
        locals[$activateInject[idx]] = arguments[idx];
      }

      return locals
    });

    state.resolve[name] = [
      '$injector', '$q', '$controller', '$state', '$constructorInject', '$activateInject',
      function($injector, $q, $controller, $state, $constructorInject, $activateInject) {
        let ctrl;
        let p;

        try {
          ctrl = $controller(funcName(constructor), $constructorInject);
          p = $q.when(ctrl);
        } catch(e) {
          console.error(e);
          return $q.reject(e);
        }

        if (ctrl.activate) {
          try {
            p = $q.when($injector.invoke(ctrl.activate, ctrl, $activateInject)).then(_ => ctrl);
          } catch(e) {
            console.error(e);
            return $q.reject(e);
          }
        }

        return p;
      }];

    if (constructor.$$afterTransition) {
      State.registerOnEnter(constructor, ['$injector', '$q', '$state', function($injector, $q, $state) {
        let p = $state.transition || $q.when(null);
        let $scope = $state.$current.locals['@app'].$scope;
        let ctrl = $scope[name];

        for (let idx in constructor.$$afterTransition) {
          let func = constructor.$$afterTransition[idx];

          p = p.then(function() {
            let val;
            if (func.$$static) {
              val = $injector.invoke(func);
            } else {
              val = $injector.invoke(func, ctrl);
            }
            return $q.when(val);
          });
        }
      }]);
    }

    if (constructor.$$onEnter) {
      state.onEnter = ['$injector', '$q', function($injector, $q) {
        let p = $q.when(null);

        for (let idx in constructor.$$onEnter) {
          let func = constructor.$$onEnter[idx];

          p = p.then(function() {
            let val = $injector.invoke(func);
            return $q.when(val);
          });
        }

        return p;
      }];
    }

    if (constructor.$$onExit) {
      state.onExit = ['$injector', '$q', function($injector, $q) {
        let p = $q.when(null);

        for (let idx in constructor.$$onExit) {
          let func = constructor.$$onExit[idx];

          p = p.then(function() {
            let val = $injector.invoke(func);
            return $q.when(val);
          });
        }

        return p;
      }];
    }

    constructor.$state = state;
  }
}

State.resolveAs = function resolveAs(name) {
  return function(target, funcName, desc) {
    if (!target.$$resolvers) {
      target.$$resolvers = {};
    }
    if (typeof desc.value != 'function') {
      throw Error("expected a function");
    }
    target.$$resolvers[name] = desc.value;
  };
};

State.onEnter = function onEnter(target, name, desc) {
  if (typeof target !== 'function') {
    throw Error("@State.onEnter can only be used with static methods.");
  }

  State.registerOnEnter(target, desc.value);
};

State.registerOnEnter = function registerOnEnter(target, func) {
  if (!target.$$onEnter) {
    target.$$onEnter = [];
  }

  target.$$onEnter.push(func);
};

State.onExit = function onExit(target, name, desc) {
  if (typeof target !== 'function') {
    throw Error("@State.onExit can only be used with static methods.");
  }

  State.registerOnExit(target, desc.value);
};

State.registerOnExit = function registerOnExit(target, func) {
  if (!target.$$onExit) {
    target.$$onExit = [];
  }

  target.$$onExit.push(func);
};

State.afterTransition = function afterTransition(target, name, desc) {
  let func = desc.value;

  if (typeof target === 'function') {
    func.$$static = true;
  } else {
    func.$$static = false;
  }

  State.registerAfterTransition(target, func);
};

State.registerAfterTransition = function registerAfterTransition(target, func) {
  if (!target.$$afterTransition) {
    target.$$afterTransition = [];
  }

  target.$$afterTransition.push(func);
};
