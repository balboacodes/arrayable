# Arrayable

[![publish](https://github.com/balboacodes/arrayable/actions/workflows/publish.yml/badge.svg)](https://github.com/balboacodes/arrayable/actions/workflows/publish.yml)

## About Arrayable

Arrayable is a TypeScript port of [Laravel's](https://github.com/laravel/laravel) array helpers. It also supports object literals.

## Installation

`npm i @balboacodes/arrayable`

## Usage

Arrayable consists of one class, `Arr`, which provides methods via a static interface, and several helper functions.

### `Arr`

```ts
import { Arr } from '@balboacodes/arrayable';

const array = Arr.collapse([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
]);

// [1, 2, 3, 4, 5, 6, 7, 8, 9]

const object = {'products': {'desk': {'price': 100}}};

const flattened = Arr::dot(object);

// {'products.desk.price': 100}
```

### Helpers

- [`data_fill`](https://laravel.com/docs/12.x/helpers#method-data-fill)
- [`data_forget`](https://laravel.com/docs/12.x/helpers#method-data-forget)
- [`data_get`](https://laravel.com/docs/12.x/helpers#method-data-get)
- [`data_set`](https://laravel.com/docs/12.x/helpers#method-data-set)
- [`head`](https://laravel.com/docs/12.x/helpers#method-head)
- [`last`](https://laravel.com/docs/12.x/helpers#method-last)
- [`value`](https://laravel.com/docs/12.x/helpers#method-value)

## Documentation

Documentation for the methods and helpers can be found on Laravel's [Arrays documentation](https://laravel.com/docs/12.x/helpers#arrays-and-objects-method-list) page. Just translate PHP's syntax to JS like shown above.

## Related

If you like this package, be sure to check out our [other packages](https://www.npmjs.com/~balboacodes).
