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

    if (constructor.onEnter) {
      state.onEnter = constructor.onEnter;
    }

    if (constructor.onExit) {
      state.onExit = constructor.onExit;
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
}
