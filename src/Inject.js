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
