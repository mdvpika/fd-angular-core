# `fd-angular-core`

## Requirements

* a `Promise` polyfill.

## Getting started

```js
import {bootstrap, State} from 'npm:fd-angular-core';

@State({
  template: `<p>{{ app.message }}</p>`
})
class AppController {

  constructor() {
    this.message = "Hello world!";
  }

  activate() {
    // can return a promise
  }

  attach() {

  }

  detach() {

  }

}

bootstrap(AppController); // => Promise
```

## `@Inject`

```js
@Inject('$scope')
class Foo {

  constructor($scope) {}

  @Inject('$scope')
  aMethod($scope) {}

}
```


## `$injector.superConstruct` and `$injector.superCall`

```js
class Foo extends Bar {

  constructor($injector) {
    $injector.superConstruct(this);
    // or:
    // $injector.superConstruct(this, locals);
  }

  aMethod($injector) {
    $injector.superCall(this, "aMethod");
    // or:
    // $injector.superCall(this, "aMethod", locals)
  }

}
```


## `@Service`

```js
@Service
// or: @Service('Foo')
class Foo {}
// this service is injectable as 'Foo'
```


## `@Controller`

```js
@Controller
// or: @Controller('Foo')
class Foo {}
// this controller is injectable as 'Foo'
```


## `@Component`

```js
@Component
// or: @Component({ ... })
class FooController {}
// this component can be used as `<foo>` or `<div foo></div>`
// and uses the `./components/foo/foo.html` template
```

**options**: `restrict`, `scope`, `template`, `templateUrl`

Set `template` to `false` to prevent the default template from being used.
