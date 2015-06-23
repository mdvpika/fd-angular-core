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
    templateUrl
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

    let state = {
      name:         name,
      template:     template,
      templateUrl:  templateUrl,
      controller:   funcName(constructor),
      controllerAs: name,

      children:     children.map(c => Object.create(c.$state, {})),
      resolve:      resolve,
      url:          url,
      abstract:     abstract,
    };

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

        $state.transition = p;
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
