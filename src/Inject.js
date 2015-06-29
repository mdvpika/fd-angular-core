
export function Inject(...deps) {
  return function (constructor, name, desc){
    if (desc && (typeof desc.value === "function")) {
      desc.value.$inject = deps;
    } else {
      constructor.$inject = deps;
    }
  };
}
