import {funcName} from './utils';
import {app} from './app';

export function Controller(name) {
  if (typeof name === 'function') {
    var constructor = name; name = null;
    return register(constructor);
  }
  return register;

  function register(constructor){
    if (constructor.$controller) {
      return;
    }

    constructor.$controller = true;
    name = (name || funcName(constructor));
    app.controller(name, constructor);
  }
}
