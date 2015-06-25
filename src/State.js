import {funcName, dashCase, superClass} from './utils';
import {app} from './app';
import {Controller} from './Controller';

const DEFAULT_SUFFIX = 'Controller';

export function State(opts) {
  if (typeof opts === 'function') {
    var constructor = opts; opts = null;
    return register(constructor);
  }

  opts = (opts || {});

  return register;

  function register(constructor) {
    Controller(constructor, { name: opts.controllerName });

    let prototype = constructor.prototype;

    if (prototype.activate) {
      State.onActivate(
        prototype,
        "activate",
        { value: prototype.activate });
    }

    if (prototype.attach) {
      State.onAttach(
        prototype,
        "attach",
        { value: prototype.attach });
    }

    if (prototype.detach) {
      State.onDetach(
        prototype,
        "detach",
        { value: prototype.detach });
    }

    let callbacks = (prototype.$$stateCallbacks || {});
    delete prototype['$$stateCallbacks'];

    let meta = registerLock(constructor);
    let superMeta = superClass(constructor).$$state;
    superMeta = (superMeta || {});

    {
      let _opts = Object.create(superMeta.opts || {}, {});

      let keys = Object.keys(opts);
      for (let idx in keys) {
        let key = keys[idx];
        let val = opts[key];

        // Ignored keys
        if (key === 'name') continue;
        if (key === 'controllerName') continue;
        if (key === 'resolve') continue;
        if (key === 'children') continue;
        // if (key === '$onEnter') continue;
        // if (key === '$onExit') continue;

        _opts[key] = val;
      }

      { // inherit name
        _opts.name = opts.name;
      }

      { // inherit controllerName
        _opts.controllerName = opts.controllerName;
      }

      { // Inherit resolve
        let _resolve = {};
        Object.assign(_resolve, _opts.resolve || {});
        Object.assign(_resolve, opts.resolve || {});
        _opts.resolve = _resolve;
      }

      { // Inherit children
        _opts.children = (opts.children || (_opts.children || []).concat([]));
      }

      opts = _opts;
    }

    applyDefaultName(opts, constructor);
    applyDefaultTemplate(opts);

    meta.opts = opts;
    meta.name = opts.name;

    let state = meta.state = {
      name:          opts.name,
      template:      opts.template,
      templateUrl:   opts.templateUrl,
      controllerAs:  (opts.bindTo || opts.name),
      url:           opts.url,
      abstract:      opts.abstract,
      resolve:       Object.assign({}, opts.resolve),
      childStates:   opts.children,

      get children() { return this.childStates.map(x => x.$$state.state); }
    };

    let controllerProvider = function controllerProvider(ctrl, $hooks, $scope) {
      try {
        if ($hooks.attach) {
          for (let hook of $hooks.attach) { hook.call(ctrl); }
        }

        $scope.$on('$destroy', function() {
          if ($hooks.detach) {
            for (let hook of $hooks.detach) { hook.call(ctrl); }
          }
        });
      } catch(e) {
        console.error(e);
        throw e;
      }

      return ctrl;
    };

    controllerProvider = controllerProvider
      ::inject(opts.name, '$hooks', '$scope');

    if (callbacks.onAttach) {
      for (let hook of callbacks.onAttach) {
        controllerProvider = controllerProvider::pushHook('attach', hook);
      }
    }
    if (callbacks.onDetach) {
      for (let hook of callbacks.onDetach) {
        controllerProvider = controllerProvider::pushHook('detach', hook);
      }
    }

    state.controller = controllerProvider;

    let ctrlR = function($q, $controller, $constructorInject, $hooks) {
      let ctrl;
      let p;

      try {
        ctrl = $controller(constructor.$$controller.name, $constructorInject);
        p = $q.when(ctrl);
      } catch(e) {
        console.error(e);
        return $q.reject(e);
      }

      if ($hooks.activate) {
        for (let hook of $hooks.activate) {
          p = p.then(x => hook.call(ctrl));
        }
        p = p.then(x => ctrl);
      }

      return p;
    };

    ctrlR = ctrlR
      ::inject('$q', '$controller', '$constructorInject', '$hooks')
      ::namedInjectionCollector('$constructorInject', constructor.$inject);

    if (callbacks.onActivate) {
      for (let hook of callbacks.onActivate) {
        ctrlR = ctrlR::pushHook('activate', hook);
      }
    }

    state.resolve[opts.name] = ctrlR;
  }
}

State.onActivate = function onActivate(target, name, desc) {
  if (typeof desc.value !== 'function') {
    throw "@State.onActivate expects a function target";
  }

  if (!target.$$stateCallbacks) {
    target.$$stateCallbacks = {};
  }
  if (!target.$$stateCallbacks.onActivate) {
    target.$$stateCallbacks.onActivate = [];
  }

  target.$$stateCallbacks.onActivate.push(desc.value);
};

State.onAttach = function onAttach(target, name, desc) {
  if (typeof desc.value !== 'function') {
    throw "@State.onAttach expects a function target";
  }

  if (!target.$$stateCallbacks) {
    target.$$stateCallbacks = {};
  }
  if (!target.$$stateCallbacks.onAttach) {
    target.$$stateCallbacks.onAttach = [];
  }

  target.$$stateCallbacks.onAttach.push(desc.value);
};

State.onDetach = function onDetach(target, name, desc) {
  if (typeof desc.value !== 'function') {
    throw "@State.onDetach expects a function target";
  }

  if (!target.$$stateCallbacks) {
    target.$$stateCallbacks = {};
  }
  if (!target.$$stateCallbacks.onDetach) {
    target.$$stateCallbacks.onDetach = [];
  }

  target.$$stateCallbacks.onDetach.push(desc.value);
};

export function mountAt(url) {
  let state = Object.create(this.$$state.state, {});
  state.url = url;

  let $$state = Object.create(this.$$state, {});
  $$state.state = state;

  let _this = Object.create(this, {});
  _this.$$state = $$state;

  return _this;
}

function registerLock(constructor) {
  var lock = constructor.$$state;

  if (lock && (lock.constructor === constructor)) {
    throw "@State() can only be used once!";
  }

  constructor.$$state = { constructor };
  return constructor.$$state;
}

function applyDefaultName(opts, constructor) {
  if (opts.name) return;

  let name = opts.name;
  name = funcName(constructor);
  name = name[0].toLowerCase() + name.substr(1, name.length - DEFAULT_SUFFIX.length - 1);
  opts.name = name;
}

function applyDefaultTemplate(opts) {
  let {template, templateUrl, children} = opts;

  if (template !== undefined || templateUrl !== undefined) {
    return;
  }

  if (children && children.length > 0) {
    opts.template = `<ui-view></ui-view>`;
  }
}

function inject(...splat) {
  if (splat.length === 1 && !splat[0]) {
    splat = [];
  }
  if (splat.length === 1 && splat[0].length > 0) {
    splat = splat[0];
  }

  this.$inject = splat;
  return this;
}

function injectionCollector(as, ...splat) {
  if (splat.length === 1 && !splat[0]) {
    splat = [];
  }
  if (splat.length === 1 && splat[0].length > 0) {
    splat = splat[0];
  }

  let base      = this;
  let inject    = (base.$inject || []).concat([]);
  let injectLen = base.$inject.length;
  let splatIdxs = []

  let idx = inject.indexOf(as);
  if (idx < 0) { return base; }

  while (idx >= 0) {
    splatIdxs.unshift(idx);
    inject.splice(idx, 1);
    injectLen--;
    idx = inject.indexOf(as);
  }

  inject = inject.concat(splat);
  collectInjections.$inject = inject;
  return collectInjections;

  function collectInjections() {
    let inject = Array.prototype.slice.call(arguments, 0, injectLen);
    let splat  = Array.prototype.slice.call(arguments, injectLen);

    for (let idx in splatIdxs) {
      inject.splice(splatIdxs[idx], 0, splat);
    }

    return base.apply(this, inject);
  }
}

function namedInjectionCollector(as, ...splat) {
  if (splat.length === 1 && !splat[0]) {
    splat = [];
  }
  if (splat.length === 1 && splat[0].length > 0) {
    splat = splat[0];
  }

  let base      = this;
  let inject    = (base.$inject || []).concat([]);
  let injectLen = base.$inject.length;
  let splatIdxs = []

  let idx = inject.indexOf(as);
  if (idx < 0) { return base; }

  while (idx >= 0) {
    splatIdxs.unshift(idx);
    inject.splice(idx, 1);
    injectLen--;
    idx = inject.indexOf(as);
  }

  inject = inject.concat(splat);
  collectInjections.$inject = inject;
  return collectInjections;

  function collectInjections() {
    let inject = Array.prototype.slice.call(arguments, 0, injectLen);
    let splatVals = Array.prototype.slice.call(arguments, injectLen);

    let namedSplat = {};

    for (let idx in splat) {
      namedSplat[splat[idx]] = splatVals[idx];
    }

    for (let idx in splatIdxs) {
      inject.splice(splatIdxs[idx], 0, namedSplat);
    }

    return base.apply(this, inject);
  }
}

app.constant('$hooks', { $fake: true });
let nextHookId = 0;
function pushHook(name, func) {
  if (!func) return this;

  let base = this;
  nextHookId++;
  let hookId = `_hook_${name}_${nextHookId}`;
  let inject = (base.$inject || []);
  let hooksIdx = inject.indexOf('$hooks');

  binder.$inject = [hookId].concat(inject);
  return binder::injectionCollector(hookId, func.$inject);

  function binder(vars, ...rest) {
    var hooks = rest[hooksIdx];
    if (!hooks || hooks.$fake) {
      hooks = {};
      rest[hooksIdx] = hooks;
    }

    var chain = hooks[name];
    if (!chain) {
      chain = [];
      hooks[name] = chain;
    }

    chain.push(hook);
    return base.apply(this, rest);

    function hook() {
      return func.apply(this, vars);
    }
  }
}
