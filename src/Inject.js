
/**
@function Inject
@param {...String} deps - Names of values to inject.

@example
[@]Inject('$scope')
class MyController {
	constructor($scope) {
		// ...
	}
}

*/
export function Inject(...deps) {
	return function (target, name, desc){
		let isMethod = desc && (typeof desc.value === "function");

		if (isMethod) {
			desc.value.$inject = deps;
			return desc;
		}

		target.$inject = deps;
		return target;
	};
}
