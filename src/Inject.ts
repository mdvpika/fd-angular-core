
/**

@param deps Names of values to inject.

```js
; @Inject('$scope')
class MyController {
	constructor($scope) {
		// ...
	}
}
```
*/
export function Inject(...deps: string[]) : MethodDecorator
export function Inject(...deps: string[]) : ClassDecorator
export function Inject(...deps: string[]) : any {
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
