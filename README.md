# Arrayable

[![publish](https://github.com/balboacodes/arrayable/actions/workflows/publish.yml/badge.svg)](https://github.com/balboacodes/arrayable/actions/workflows/publish.yml)

## About Arrayable

Arrayable is a TypeScript port of [Laravel's](https://github.com/laravel/laravel) array helpers. It aims to bring a small dose of the expressive and elegant syntax Laravel is known for to the TypeScript community. It has no third-party dependencies, is fully-typed, and includes all of Laravel's tests ported to [Vitest](https://github.com/vitest-dev/vitest). While most helper methods have been ported over, some exceptions were made:

- Methods that require third-party packages like `random` and `shuffle`
- Methods that are not documented on Laravel's docs page
- Methods that are not applicable to JavaScript like `float`, `isAssoc`, `prependKeysWith`, etc.

Only arrays are currently supported, but if there is enough demand, this package can be expanded to allow for objects.

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

Documentation for the methods and helpers can be found on Laravel's [Helpers documentation](https://laravel.com/docs/12.x/helpers) page. Just translate PHP's syntax to JS like shown above.

## Related

If you like this package and are looking for string helpers, check out the [Stringable](https://github.com/balboacodes/stringable) package.
