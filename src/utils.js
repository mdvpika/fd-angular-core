import {app} from './app';

export function dashCase(str) {
  return str.replace(/([A-Z])/g, function ($1) {
    return "-" + $1.toLowerCase();
  });
}

export function funcName(func) {
  return funcMeta(func).name;
}

export function superClass(func) {
  return funcMeta(func).superClass;
}

export function funcMeta(func) {
  if (func.$meta !== undefined) {
    return func.$meta;
  }

  let meta = {
    controller: null,
    service:    null,
    state:      null,
    wrappers:   null,
    base:       func,
    top:        func,
    name:       getName(),
    superClass: getSuperClass(),
  };

  func.$meta = meta;

  return meta;

  function getName() {
    let name = ((func && func.name) || null);
    if (name === null) {
      name = func.toString().match(/^function\s*([^\s(]+)/)[1];
    }
    return name;
  }

  function getSuperClass() {
    if (!func) { return null; }
    if (!func.prototype) { return null; }
    if (!Object.getPrototypeOf(func.prototype)) { return null; }
    return Object.getPrototypeOf(func.prototype).constructor || null;
  }
}

export function wrapFunc(func, wrapperFunc) {
  let meta = funcMeta(func);

  meta.top = wrapperFunc;
  if (!meta.wrappers) {
    meta.wrappers = [wrapperFunc];
  } else {
    meta.wrappers.unshift(wrapperFunc);
  }

  wrapperFunc.$meta = meta;

  // inherit $inject
  if (func.$inject) {
    wrapperFunc.$inject = func.$inject.slice();
  }

  if (meta.controller) {
    // re-register controller
    app.controller(meta.controller.name, meta.top);
  }

  if (meta.service) {
    // re-register service
    app.service(meta.service.name, meta.top);
  }

  return wrapperFunc;
}
