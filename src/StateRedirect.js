import {State} from './State';
import {Inject} from './Inject';

let redirectId = 0;

export function Redirect(stateName, stateParams) {
  redirectId++;

  let func;
  if (typeof stateName === 'function') {
    func = stateName;
    stateName = null;
    stateParams = null;
  }

  @State({
    url: '',
    name: `redirect_${redirectId}`,
    template: '',
  })
  class Redirector {

    @Inject('$state', '$injector', '$locals', '$q')
    attach($state, $injector, $locals, $q) {
      if (func) {
        $q.when($injector.invoke(func, this, $locals))
          .then(x => {
            if (x === false) {
              return;
            }
            let {name, params} = x;
            $state.go(name, params);
          });
      } else {
        $state.go(stateName, stateParams);
      }
    }

  }

  return Redirector;
}
