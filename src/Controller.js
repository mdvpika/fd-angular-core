import {funcName} from './utils';
import {app} from './app';

export function Controller(name, opts) {
  if (typeof name === 'function') {
    let constructor = name; name = null;
    return register(constructor, opts);
  }

  return register;
  function register(constructor, opts){
    let meta = registerLock(constructor);

    let className = funcName(constructor);
    opts = (opts || {});
    name = (name || opts.name || className);

    meta.name = name;
    app.controller(name, constructor);
  }
}

function registerLock(constructor) {
  var lock = constructor.$$controller;

  if (lock && (lock.constructor === constructor)) {
    throw "@Controller() can only be used once!";
  }

  constructor.$$controller = { constructor };
  return constructor.$$controller;
}
