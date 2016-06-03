**Note** This is a WIP and not working correctly yet, do not use and expect much.

# can-register-element

Registers all CanJS Components with the native Web Component API. This means you can put your components directly in the template:

```html
<my-app></my-app>
```

## Install

```shell
npm install can-register-element --save
```

## Use

Simply import can-register-element any where in your app (typically in your main module):

```js
import 'can-register-element';
```

All Components (including those already created) will be registered as Web Components.

## License

BSD 2 Clause
