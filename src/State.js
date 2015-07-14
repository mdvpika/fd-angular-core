import {funcMeta} from "./utils";
import {Controller} from "./Controller";

const DEFAULT_SUFFIX = "Controller";



/*
@param {Object}  opts - The options
@param {string}  [opts.name] - The name of the state.
@param {string}  [opts.bindTo] - Bind the controller to the provided name.
@param {string}  [opts.url] - The url of the state.
@param {Boolean} [opts.abstract] - True for abstract states.
@param {string}  [opts.template] - An angular template.
@param {string}  [opts.templateUrl] - A URL to an angular template.
@param {State[]} [opts.children] - List of child states.
@param {string}  [opts.controllerName] - The name of the controller as seen by angular.
*/
export function State(opts) {
  if (typeof opts === "function") {
    let constructor = opts; opts = null;
    return register(constructor);
  }

  opts = (opts || {});

  return register;

  function register(constructor) {
    registerLock(constructor);
    Controller(constructor, { name: opts.controllerName });

    let meta = stateMeta(constructor);
    let superMeta = stateMeta(meta.superClass) || { state: {} };

    let prototype = constructor.prototype;
    if (prototype.activate) {
      State.onActivate(prototype, "activate", { value: prototype.activate });
    }
    if (prototype.attach) {
      State.onAttach(prototype, "attach", { value: prototype.attach });
    }
    if (prototype.detach) {
      State.onDetach(prototype, "detach", { value: prototype.detach });
    }

    if (superMeta.state.callbacks) {
      meta.state.callbacks.onActivate = superMeta.state.callbacks.onActivate
        .concat(meta.state.callbacks.onActivate);
      meta.state.callbacks.onAttach = superMeta.state.callbacks.onAttach
        .concat(meta.state.callbacks.onAttach);
      meta.state.callbacks.onDetach = superMeta.state.callbacks.onDetach
        .concat(meta.state.callbacks.onDetach);
    }

    if (opts.children === false) {
      meta.state.children = null;
    } else if (opts.children) {
      meta.state.children = opts.children;
    } else if (superMeta.state.children) {
      meta.state.children = superMeta.state.children;
    }
    if (!meta.state.children) {
      meta.state.children = [];
    }

    let inheritedTemplated = false;
    if (opts.template === false) {
      meta.state.template = null;
    } else if (opts.template) {
      meta.state.template = opts.template;
    } else if (opts.templateUrl) {
      meta.state.templateUrl = opts.templateUrl;
    } else if (superMeta.state.template) {
      inheritedTemplated = true;
      meta.state.template = superMeta.state.template;
    } else if (superMeta.state.templateUrl) {
      inheritedTemplated = true;
      meta.state.templateUrl = superMeta.state.templateUrl;
    }
    if (!meta.state.template && !meta.state.templateUrl) {
      if (meta.state.children.length > 0) {
        meta.state.template = `<ui-view></ui-view>`;
      } else {
        meta.state.template = ``;
      }
    }

    if (opts.name) {
      meta.state.name = opts.name;
    } else {
      let name = meta.name;
      name = name[0].toLowerCase() + name.substr(1, name.length - DEFAULT_SUFFIX.length - 1);
      meta.state.name = name;
    }

    if (opts.bindTo) {
      if (inheritedTemplated) {
        throw Error("bindTo cannot be used with inherited templates");
      }
      meta.state.bindTo = opts.bindTo;
    } else {
      if (inheritedTemplated) {
        meta.state.bindTo = superMeta.state.bindTo;
      } else {
        meta.state.bindTo = meta.state.name;
      }
    }

    if (opts.url === false) {
      if (opts.url) {
        meta.state.url = opts.url;
      } else if (superMeta.state.url) {
        meta.state.url = superMeta.state.url;
      }
    }

    if (opts.abstract === undefined) {
      meta.state.abstract = superMeta.state.abstract;
    } else if (opts.abstract === true) {
      meta.state.abstract = true;
    } else if (opts.abstract === false) {
      meta.state.abstract = false;
    }

  }
}

function stateMeta(constructor) {
  if (!constructor) {
    return null;
  }

  let meta = funcMeta(constructor);

  if (meta.state) {
    return meta;
  }

  meta.state = {
    callbacks: {
      onActivate: [],
      onAttach:   [],
      onDetach:   [],
    },
  };

  return meta;
}

function registerLock(constructor) {
  let meta = stateMeta(constructor);

  if (meta.state.registered) {
    throw "@State() can only be used once!";
  }

  meta.state.registered = true;
}

State.onActivate = function onActivate(target, name, desc) {
  if (typeof desc.value !== "function") {
    throw "@State.onActivate expects a function target";
  }

  let meta = stateMeta(target.constructor);
  meta.state.callbacks.onActivate.push(desc.value);
};

State.onAttach = function onAttach(target, name, desc) {
  if (typeof desc.value !== "function") {
    throw "@State.onAttach expects a function target";
  }

  let meta = stateMeta(target.constructor);
  meta.state.callbacks.onAttach.push(desc.value);
};

State.onDetach = function onDetach(target, name, desc) {
  if (typeof desc.value !== "function") {
    throw "@State.onDetach expects a function target";
  }

  let meta = stateMeta(target.constructor);
  meta.state.callbacks.onDetach.push(desc.value);
};

export function mountAt(url, opts={}) {
  let {name} = opts;

  return {
    state:              this,
    url:                url,
    name:               name,
    buildUiRouterState: builder,
  };

  function builder() {
    let state = buildUiRouterState(this.state);

    if (this.url) {
      state.url = url;
    }

    if (this.name) {
      state.name = name;
    }

    return state;
  }
}

export function buildUiRouterState(obj) {
  console.log("buildUiRouterState: %o", obj);
  if (!obj) {
    return null;
  }

  if (obj.buildUiRouterState) {
    let state = obj.buildUiRouterState();
    console.log("State: => %o", state);
    return state;
  }

  let meta = funcMeta(obj);
  if (!meta.state) {
    throw Error("provided object is not a state");
  }

  let children = [];
  for (let child of meta.state.children) {
    children.push(buildUiRouterState(child));
  }

  let state = {
    name:         meta.state.name,
    template:     meta.state.template,
    templateUrl:  meta.state.templateUrl,
    controllerAs: meta.state.bindTo,
    url:          meta.state.url,
    abstract:     meta.state.abstract,
    children:     children,
    controller:   [meta.state.name, '$locals', '$injector', '$scope', controllerAttacher],
    resolve:      {
      [meta.state.name]: ['$q', '$controller', '$locals', '$injector', controllerProvider],
    },
  };

  console.log("State: => %o", state);
  return state;

  function controllerAttacher(ctrl, $locals, $injector, $scope) {
    for (let clb of meta.callbacks.onAttach) {
      $injector.invoke(clb, ctrl, $locals);
    }

    $scope.$on("$destroy", function() {
      for (let clb of meta.callbacks.onDetach) {
        $injector.invoke(clb, ctrl, $locals);
      }
    });

    return ctrl;
  }

  function controllerProvider($q, $controller, $locals, $injector) {
    let ctrl = $controller(meta.controller.name, $locals);
    let p = $q.when(ctrl);

    for (let clb of meta.callbacks.onActivate) {
      p = p.then(() => $injector.invoke(clb, ctrl, $locals));
    }

    p = p.then(() => ctrl);
    return p;
  }
}
