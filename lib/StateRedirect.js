'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

exports.Redirect = Redirect;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _State = require('./State');

var _Inject = require('./Inject');

var redirectId = 0;

function Redirect(stateName, stateParams) {
	redirectId++;

	var func = undefined;
	if (typeof stateName === 'function') {
		func = stateName;
		stateName = null;
		stateParams = null;
	}

	var Redirector = (function () {
		function Redirector() {
			_classCallCheck(this, _Redirector);
		}

		var _Redirector = Redirector;

		_createDecoratedClass(_Redirector, [{
			key: 'attach',
			decorators: [(0, _Inject.Inject)('$state', '$injector', '$locals', '$q')],
			value: function attach($state, $injector, $locals, $q) {
				if (func) {
					$q.when($injector.invoke(func, this, $locals)).then(function (x) {
						if (x === false) {
							return;
						}
						var name = x.name;
						var params = x.params;

						$state.go(name, params);
					});
				} else {
					$state.go(stateName, stateParams);
				}
			}
		}]);

		Redirector = (0, _State.State)({
			url: '',
			template: '',
			name: 'redirect_' + redirectId
		})(Redirector) || Redirector;
		return Redirector;
	})();

	return Redirector;
}
//# sourceMappingURL=StateRedirect.js.map