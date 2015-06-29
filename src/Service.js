import {funcName} from "./utils";
import {app} from "./app";

export function Service(name) {
  if (typeof name === "function") {
    let constructor = name; name = null;
    return register(constructor);
  }
  return register;

  function register(constructor){
    name = (name || funcName(constructor));
    app.service(name, constructor);
  }
}
