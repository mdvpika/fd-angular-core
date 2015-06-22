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

}

bootstrap(AppController); // => Promise
```
