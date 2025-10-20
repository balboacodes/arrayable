import { expect, test } from 'vitest';
import { Arr } from '../src/Arr';
import { array_values } from '@balboacodes/php-utils';

test('accessible', () => {
    expect(Arr.accessible([])).toEqual(true);
    expect(Arr.accessible([1, 2])).toEqual(true);
    expect(Arr.accessible({ a: 1, b: 2 })).toEqual(true);
    expect(Arr.accessible(null)).toEqual(false);
    expect(Arr.accessible('abc')).toEqual(false);
    expect(Arr.accessible({})).toEqual(true);
    expect(Arr.accessible({ a: 1, b: 2 })).toEqual(true);
    expect(Arr.accessible(123)).toEqual(false);
    expect(Arr.accessible(12.34)).toEqual(false);
    expect(Arr.accessible(true)).toEqual(false);
    expect(Arr.accessible(new Date())).toEqual(true);
    expect(Arr.accessible(() => null)).toEqual(false);
});

test('add', () => {
    let array = Arr.add({ name: 'Desk' }, 'price', 100);
    expect(array).toEqual({ name: 'Desk', price: 100 });
    expect(Arr.add({}, 'surname', 'Mövsümov')).toEqual({ surname: 'Mövsümov' });
    expect(Arr.add({}, 'developer.name', 'Ferid')).toEqual({ developer: { name: 'Ferid' } });
    expect(Arr.add([], 1, 'hAz')).toEqual([undefined, 'hAz']);
    expect(Arr.add([], '1.1', 'hAz')).toEqual([undefined, [undefined, 'hAz']]);

    // Case where the key already exists
    expect(Arr.add({ type: 'Table' }, 'type', 'Chair')).toEqual({ type: 'Table' });
    expect(Arr.add({ category: { type: 'Table' } }, 'category.type', 'Chair')).toEqual({ category: { type: 'Table' } });
});

test('testPush', () => {
    let array = {};

    Arr.push(array, 'office.furniture', 'Desk');
    expect(array['office']['furniture']).toEqual(['Desk']);

    Arr.push(array, 'office.furniture', 'Chair', 'Lamp');
    expect(array['office']['furniture']).toEqual(['Desk', 'Chair', 'Lamp']);

    array = [];

    Arr.push(array, undefined, 'Chris', 'Nuno');
    expect(array).toEqual(['Chris', 'Nuno']);

    Arr.push(array, undefined, 'Taylor');
    expect(array).toEqual(['Chris', 'Nuno', 'Taylor']);

    array = { foo: { bar: false } };
    expect(() => Arr.push(array, 'foo.bar', 'baz')).toThrow(
        'Array value for key [foo.bar] must be an array, boolean found.',
    );
});

test('testCollapse', () => {
    // Normal case: a two-dimensional array with different elements
    let data = [['foo', 'bar'], ['baz']];
    expect(Arr.collapse(data)).toEqual(['foo', 'bar', 'baz']);

    // Case including numeric and string elements
    let array = [[1], [2], [3], ['foo', 'bar']];
    expect(Arr.collapse(array)).toEqual([1, 2, 3, 'foo', 'bar']);

    // Case with empty two-dimensional arrays
    let emptyArray = [[], [], []];
    expect(Arr.collapse(emptyArray)).toEqual([]);

    // Case with both empty arrays and arrays with elements
    let mixedArray = [[], [1, 2], [], ['foo', 'bar']];
    expect(Arr.collapse(mixedArray)).toEqual([1, 2, 'foo', 'bar']);
});

test('testCrossJoin', () => {
    // Single dimension
    expect(Arr.crossJoin([1], ['a', 'b', 'c'])).toEqual([
        [1, 'a'],
        [1, 'b'],
        [1, 'c'],
    ]);

    // Square matrix
    expect(Arr.crossJoin([1, 2], ['a', 'b'])).toEqual([
        [1, 'a'],
        [1, 'b'],
        [2, 'a'],
        [2, 'b'],
    ]);

    // Rectangular matrix
    expect(Arr.crossJoin([1, 2], ['a', 'b', 'c'])).toEqual([
        [1, 'a'],
        [1, 'b'],
        [1, 'c'],
        [2, 'a'],
        [2, 'b'],
        [2, 'c'],
    ]);

    // 3D matrix
    expect(Arr.crossJoin([1, 2], ['a', 'b'], ['I', 'II', 'III'])).toEqual([
        [1, 'a', 'I'],
        [1, 'a', 'II'],
        [1, 'a', 'III'],
        [1, 'b', 'I'],
        [1, 'b', 'II'],
        [1, 'b', 'III'],
        [2, 'a', 'I'],
        [2, 'a', 'II'],
        [2, 'a', 'III'],
        [2, 'b', 'I'],
        [2, 'b', 'II'],
        [2, 'b', 'III'],
    ]);

    // With 1 empty dimension
    expect(Arr.crossJoin([], ['a', 'b'], ['I', 'II', 'III'])).toEqual([]);
    expect(Arr.crossJoin([1, 2], [], ['I', 'II', 'III'])).toEqual([]);
    expect(Arr.crossJoin([1, 2], ['a', 'b'], [])).toEqual([]);

    // With empty arrays
    expect(Arr.crossJoin([], [], [])).toEqual([]);
    expect(Arr.crossJoin([], [])).toEqual([]);
    expect(Arr.crossJoin([])).toEqual([]);

    // Not really a proper usage, still, test for preserving BC
    expect(Arr.crossJoin()).toEqual([[]]);
});

test('testDivide', () => {
    // Test dividing an empty array
    let [keys, values]: any = Arr.divide([]);
    expect(keys).toEqual([]);
    expect(values).toEqual([]);

    // Test dividing an array with a single key-value pair
    [keys, values] = Arr.divide({ name: 'Desk' });
    expect(keys).toEqual(['name']);
    expect(values).toEqual(['Desk']);

    // Test dividing an array with multiple key-value pairs
    [keys, values] = Arr.divide({ name: 'Desk', price: 100, available: true });
    expect(keys).toEqual(['name', 'price', 'available']);
    expect(values).toEqual(['Desk', 100, true]);

    // Test dividing an array with numeric keys
    [keys, values] = Arr.divide(['first', 'second']);
    expect(keys).toEqual([0, 1]);
    expect(values).toEqual(['first', 'second']);

    // Test dividing an array with null key
    [keys, values] = Arr.divide({ null: 'Null', 1: 'one' });
    expect(keys).toEqual(['1', 'null']);
    expect(values).toEqual(['one', 'Null']);

    // Test dividing an array where the keys are arrays
    [keys, values] = Arr.divide([{ one: 1, 2: 'second' }, 'one']);
    expect(keys).toEqual([0, 1]);
    expect(values).toEqual([{ one: 1, 2: 'second' }, 'one']);

    // Test dividing an array where the values are arrays
    [keys, values] = Arr.divide({ null: { one: 1, 2: 'second' }, 1: 'one' });
    expect(keys).toEqual(['1', 'null']);
    expect(values).toEqual(['one', { one: 1, 2: 'second' }]);
});

test('testDot', () => {
    let array = Arr.dot({ foo: { bar: 'baz' } });
    expect(array).toEqual({ 'foo.bar': 'baz' });

    array = Arr.dot({ 10: 100 });
    expect(array).toEqual({ 10: 100 });

    array = Arr.dot({ foo: { 10: 100 } });
    expect(array).toEqual({ 'foo.10': 100 });

    array = Arr.dot({ foo: {} });
    expect(array).toEqual({ foo: {} });

    array = Arr.dot({ foo: { bar: {} } });
    expect(array).toEqual({ 'foo.bar': {} });

    array = Arr.dot({ name: 'taylor', languages: { php: true } });
    expect(array).toEqual({ name: 'taylor', 'languages.php': true });

    array = Arr.dot({ user: { name: 'Taylor', age: 25, languages: ['PHP', 'C#'] } });
    expect(array).toEqual({
        'user.name': 'Taylor',
        'user.age': 25,
        'user.languages.0': 'PHP',
        'user.languages.1': 'C#',
    });

    array = Arr.dot({ 0: 'foo', 1: { foo: { bar: 'baz', baz: { a: 'b' } } } });
    expect(array).toEqual({ 0: 'foo', '1.foo.bar': 'baz', '1.foo.baz.a': 'b' });

    array = Arr.dot({ foo: 'bar', empty_array: [], user: { name: 'Taylor' }, key: 'value' });
    expect(array).toEqual({
        foo: 'bar',
        empty_array: [],
        'user.name': 'Taylor',
        key: 'value',
    });
});

test('testUndot', () => {
    let array = Arr.undot({
        'user.name': 'Taylor',
        'user.age': 25,
        'user.languages.0': 'PHP',
        'user.languages.1': 'C#',
    });
    expect(array).toEqual({ user: { name: 'Taylor', age: 25, languages: { 0: 'PHP', 1: 'C#' } } });

    array = Arr.undot({
        'pagination.previous': '<<',
        'pagination.next': '>>',
    });
    expect(array).toEqual({ pagination: { previous: '<<', next: '>>' } });

    array = Arr.undot({ 0: 'foo', 'foo.bar': 'baz', 'foo.baz': { a: 'b' } });
    expect(array).toEqual({ 0: 'foo', foo: { bar: 'baz', baz: { a: 'b' } } });
});

test('testExcept', () => {
    let array: any = { name: 'taylor', age: 26 };
    expect(Arr.except(array, ['name'])).toEqual({ age: 26 });
    expect(Arr.except(array, 'name')).toEqual({ age: 26 });

    array = { name: 'taylor', framework: { language: 'PHP', name: 'Laravel' } };
    expect(Arr.except(array, 'framework')).toEqual({ name: 'taylor' });
    expect(Arr.except(array, 'framework.language')).toEqual({ name: 'taylor', framework: { name: 'Laravel' } });
    expect(Arr.except(array, ['name', 'framework.name'])).toEqual({ framework: { language: 'PHP' } });

    array = { 1: 'hAz', 2: { 5: 'foo', 12: 'baz' } };
    expect(Arr.except(array, 2)).toEqual({ 1: 'hAz' });
    expect(Arr.except(array, '2.5')).toEqual({ 1: 'hAz', 2: { 12: 'baz' } });
});

test('testExists', () => {
    expect(Arr.exists([1], 0)).toEqual(true);
    expect(Arr.exists([null], 0)).toEqual(true);
    expect(Arr.exists({ a: 1 }, 'a')).toEqual(true);
    expect(Arr.exists({ a: null }, 'a')).toEqual(true);
    expect(Arr.exists([1], 1)).toEqual(false);
    expect(Arr.exists([null], 1)).toEqual(false);
    expect(Arr.exists({ a: 1 }, 0)).toEqual(false);
});

test('testWhereNotUndefined', () => {
    let array = array_values(Arr.whereNotUndefined([undefined, 0, false, '', undefined, []]));
    expect(array).toEqual([0, false, '', []]);

    array = array_values(Arr.whereNotUndefined([1, 2, 3]));
    expect(array).toEqual([1, 2, 3]);

    array = array_values(Arr.whereNotUndefined([undefined, undefined, undefined]));
    expect(array).toEqual([]);

    array = array_values(Arr.whereNotUndefined(['a', undefined, 'b', undefined, 'c']));
    expect(array).toEqual(['a', 'b', 'c']);

    const obj = {};
    const fun = () => undefined;
    array = array_values(Arr.whereNotUndefined([undefined, 1, 'string', 0.0, false, [], obj, fun]));
    expect(array).toEqual([1, 'string', 0.0, false, [], obj, fun]);
});

test('testFirst', () => {
    const array = [100, 200, 300];

    // Callback is undefined and array is empty
    expect(Arr.first([], undefined)).toEqual(undefined);
    expect(Arr.first([], undefined, 'foo')).toEqual('foo');
    expect(Arr.first([], undefined, () => 'bar')).toEqual('bar');

    // Callback is undefined and array is not empty
    expect(Arr.first(array)).toEqual(100);

    // Callback is not undefined and array is not empty
    const value = Arr.first(array, (value) => value >= 150);
    expect(value).toEqual(200);

    // Callback is not undefined, array is not empty but no satisfied item
    const value2 = Arr.first(array, (value) => value > 300);
    const value3 = Arr.first(array, (value) => value > 300, 'bar');
    const value4 = Arr.first(
        array,
        (value) => value > 300,
        () => 'baz',
    );
    const value5 = Arr.first(array, (_, key) => Number(key) < 2);
    expect(value2).toEqual(undefined);
    expect(value3).toEqual('bar');
    expect(value4).toEqual('baz');
    expect(value5).toEqual(100);
});

test('testJoin', () => {
    expect(Arr.join(['a', 'b', 'c'], ', ')).toEqual('a, b, c');
    expect(Arr.join(['a', 'b', 'c'], ', ', ' and ')).toEqual('a, b and c');
    expect(Arr.join(['a', 'b'], ', ', ' and ')).toEqual('a and b');
    expect(Arr.join(['a'], ', ', ' and ')).toEqual('a');
    expect(Arr.join([], ', ', ' and ')).toEqual('');
});

test('testLast', () => {
    const array = [100, 200, 300];

    // Callback is undefined and array is empty
    expect(Arr.last([], undefined)).toEqual(undefined);
    expect(Arr.last([], undefined, 'foo')).toEqual('foo');
    expect(Arr.last([], undefined, () => 'bar')).toEqual('bar');

    // // Callback is undefined and array is not empty
    expect(Arr.last(array)).toEqual(300);

    // // Callback is not undefined and array is not empty
    const value = Arr.last(array, (value) => value < 250);
    expect(value).toEqual(200);

    // Callback is not undefined, array is not empty but no satisfied item
    const value2 = Arr.last(array, (value) => value > 300);
    const value3 = Arr.last(array, (value) => value > 300, 'bar');
    const value4 = Arr.last(
        array,
        (value) => value > 300,
        () => 'baz',
    );
    const value5 = Arr.last(array, (_, key) => Number(key) < 2);
    expect(value2).toEqual(undefined);
    expect(value3).toEqual('bar');
    expect(value4).toEqual('baz');
    expect(value5).toEqual(300);
});

test('testFlatten', () => {
    // Flat arrays are unaffected
    let array: any = ['#foo', '#bar', '#baz'];
    expect(Arr.flatten(array)).toEqual(['#foo', '#bar', '#baz']);

    // Nested arrays are flattened with existing flat items
    array = [['#foo', '#bar'], '#baz'];
    expect(Arr.flatten(array)).toEqual(['#foo', '#bar', '#baz']);

    // Flattened array includes "null" items
    array = [['#foo', null], '#baz', null];
    expect(Arr.flatten(array)).toEqual(['#foo', null, '#baz', null]);

    // Sets of nested arrays are flattened
    array = [['#foo', '#bar'], ['#baz']];
    expect(Arr.flatten(array)).toEqual(['#foo', '#bar', '#baz']);

    // Deeply nested arrays are flattened
    array = [['#foo', ['#bar']], ['#baz']];
    expect(Arr.flatten(array)).toEqual(['#foo', '#bar', '#baz']);
});

test('testFlattenWithDepth', () => {
    // No depth flattens recursively
    let array = [['#foo', ['#bar', ['#baz']]], '#zap'];
    expect(Arr.flatten(array)).toEqual(['#foo', '#bar', '#baz', '#zap']);

    // Specifying a depth only flattens to that depth
    array = [['#foo', ['#bar', ['#baz']]], '#zap'];
    expect(Arr.flatten(array, 1)).toEqual(['#foo', ['#bar', ['#baz']], '#zap']);

    array = [['#foo', ['#bar', ['#baz']]], '#zap'];
    expect(Arr.flatten(array, 2)).toEqual(['#foo', '#bar', ['#baz'], '#zap']);
});

test('testGet', () => {
    let array: any = { 'products.desk': { price: 100 } };
    expect(Arr.get(array, 'products.desk')).toEqual({ price: 100 });

    array = {
        products: { desk: { price: 100 } },
    };
    let value = Arr.get(array, 'products.desk');
    expect(value).toEqual({ price: 100 });

    // Test null array values
    array = { foo: null, bar: { baz: null } };
    expect(Arr.get(array, 'foo', 'default')).toEqual(null);
    expect(Arr.get(array, 'bar.baz', 'default')).toEqual(null);

    // Test null key returns the whole array
    array = ['foo', 'bar'];
    expect(Arr.get(array, undefined)).toEqual(array);

    // Test array is empty and key is undefined
    expect(Arr.get([], undefined)).toEqual([]);
    expect(Arr.get([], undefined, 'default')).toEqual([]);

    // Test numeric keys
    array = {
        products: [{ name: 'desk' }, { name: 'chair' }],
    };
    expect(Arr.get(array, 'products.0.name')).toEqual('desk');
    expect(Arr.get(array, 'products.1.name')).toEqual('chair');

    // Test return default value for non-existing key.
    array = { names: { developer: 'taylor' } };
    expect(Arr.get(array, 'names.otherDeveloper', 'dayle')).toEqual('dayle');
    expect(Arr.get(array, 'names.otherDeveloper', () => 'dayle')).toEqual('dayle');

    // Test array has a null key
    expect(Arr.get({ '': 'bar' }, '')).toEqual('bar');
    expect(Arr.get({ '': { '': 'bar' } }, '.')).toEqual('bar');
});

// test("testItGetsAString", () => {
//     $test_array = {string: "foo bar", integer: 1234};

//     // Test string values are returned as strings
//     expect(Arr.string($test_array, "string")).toEqual("foo bar");

//     // Test that default string values are returned for missing keys
//     expect(Arr.string($test_array, "missing_key", "default")).toEqual("default");

//     // Test that an exception is raised if the value is not a string
//     expectException(InvalidArgumentException::class);
//     expectExceptionMessageMatches("#^Array value for key \[integer\] must be a string, (.*) found.#");
//     Arr.string($test_array, "integer");
// })

// test("testItGetsAnInteger", () => {
//     $test_array = {string: "foo bar", integer: 1234};

//     // Test integer values are returned as integers
//     expect(Arr.integer($test_array, "integer")).toEqual(1234);

//     // Test that default integer values are returned for missing keys
//     expect(Arr.integer($test_array, "missing_key", 999)).toEqual(999);

//     // Test that an exception is raised if the value is not an integer
//     expectException(InvalidArgumentException::class);
//     expectExceptionMessageMatches("#^Array value for key \[string\] must be an integer, (.*) found.#");
//     Arr.integer($test_array, "string");
// })

// test("testItGetsAFloat", () => {
//     $test_array = {string: "foo bar", float: 12.34};

//     // Test float values are returned as floats
//     expect(Arr.float($test_array, "float")).toEqual(12.34);

//     // Test that default float values are returned for missing keys
//     expect(Arr.float($test_array, "missing_key", 56.78)).toEqual(56.78);

//     // Test that an exception is raised if the value is not a float
//     expectException(InvalidArgumentException::class);
//     expectExceptionMessageMatches("#^Array value for key \[string\] must be a float, (.*) found.#");
//     Arr.float($test_array, "string");
// })

// test("testItGetsABoolean", () => {
//     $test_array = {string: "foo bar", boolean: true};

//     // Test boolean values are returned as booleans
//     expect(Arr.boolean($test_array, "boolean")).toEqual(true);

//     // Test that default boolean values are returned for missing keys
//     expect(Arr.boolean($test_array, "missing_key", true)).toEqual(true);

//     // Test that an exception is raised if the value is not a boolean
//     expectException(InvalidArgumentException::class);
//     expectExceptionMessageMatches("#^Array value for key \[string\] must be a boolean, (.*) found.#");
//     Arr.boolean($test_array, "string");
// })

// test("testItGetsAnArray", () => {
//     $test_array = {string: "foo bar", array: ["foo", "bar"}];

//     // Test array values are returned as arrays
//     expect("bar"], Arr.array($test_array, "array")).toEqual(["foo");

//     // Test that default array values are returned for missing keys
//     expect("two"], Arr.array($test_array, "missing_key", [1, "two"])).toEqual([1);

//     // Test that an exception is raised if the value is not an array
//     expectException(InvalidArgumentException::class);
//     expectExceptionMessageMatches("#^Array value for key \[string\] must be an array, (.*) found.#");
//     Arr.array($test_array, "string");
// })

// test("testHas", () => {
//     array = {products.desk: [price: 100}];
//     expect(Arr.has(array, "products.desk")).toEqual(true);

//     array = {products: [desk: [price: 100}]];
//     expect(Arr.has(array, "products.desk")).toEqual(true);
//     expect(Arr.has(array, "products.desk.price")).toEqual(true);
//     expect(Arr.has(array, "products.foo")).toEqual(false);
//     expect(Arr.has(array, "products.desk.foo")).toEqual(false);

//     array = {foo: null, bar: [baz: null}];
//     expect(Arr.has(array, "foo")).toEqual(true);
//     expect(Arr.has(array, "bar.baz")).toEqual(true);

//     array = new ArrayObject({foo: 10, bar: new ArrayObject([baz: 10})]);
//     expect(Arr.has(array, "foo")).toEqual(true);
//     expect(Arr.has(array, "bar")).toEqual(true);
//     expect(Arr.has(array, "bar.baz")).toEqual(true);
//     expect(Arr.has(array, "xxx")).toEqual(false);
//     expect(Arr.has(array, "xxx.yyy")).toEqual(false);
//     expect(Arr.has(array, "foo.xxx")).toEqual(false);
//     expect(Arr.has(array, "bar.xxx")).toEqual(false);

//     array = new ArrayObject({foo: null, bar: new ArrayObject([baz: null})]);
//     expect(Arr.has(array, "foo")).toEqual(true);
//     expect(Arr.has(array, "bar.baz")).toEqual(true);

//     array = ["foo", "bar"];
//     expect(Arr.has(array, null)).toEqual(false);

//     expect(Arr.has(null, "foo")).toEqual(false);
//     expect(Arr.has(false, "foo")).toEqual(false);

//     expect(Arr.has(null, null)).toEqual(false);
//     expect(Arr.has([], null)).toEqual(false);

//     array = {products: [desk: [price: 100}]];
//     expect(Arr.has(array, ["products.desk"])).toEqual(true);
//     expect(Arr.has(array, ["products.desk", "products.desk.price"])).toEqual(true);
//     expect(Arr.has(array, ["products", "products"])).toEqual(true);
//     expect(Arr.has(array, ["foo"])).toEqual(false);
//     expect(Arr.has(array, [])).toEqual(false);
//     expect(Arr.has(array, ["products.desk", "products.price"])).toEqual(false);

//     array = {
//         products: [[name: "desk"}],
//     ];
//     expect(Arr.has(array, "products.0.name")).toEqual(true);
//     expect(Arr.has(array, "products.0.price")).toEqual(false);

//     expect(Arr.has([], [null])).toEqual(false);
//     expect(Arr.has(null, [null])).toEqual(false);

//     expect(Arr.has(["" => "some"], "")).toEqual(true);
//     expect(Arr.has(["" => "some"], [""])).toEqual(true);
//     expect(Arr.has([""], "")).toEqual(false);
//     expect(Arr.has([], "")).toEqual(false);
//     expect(Arr.has([], [""])).toEqual(false);
// })

// test("testHasAllMethod", () => {
//     array = {name: "Taylor", age: "", city: null};
//     expect(Arr.hasAll(array, "name")).toEqual(true);
//     expect(Arr.hasAll(array, "age")).toEqual(true);
//     expect(Arr.hasAll(array, ["age", "car"])).toEqual(false);
//     expect(Arr.hasAll(array, "city")).toEqual(true);
//     expect(Arr.hasAll(array, ["city", "some"])).toEqual(false);
//     expect(Arr.hasAll(array, ["name", "age", "city"])).toEqual(true);
//     expect(Arr.hasAll(array, ["name", "age", "city", "country"])).toEqual(false);

//     array = {user: [name: "Taylor"}];
//     expect(Arr.hasAll(array, "user.name")).toEqual(true);
//     expect(Arr.hasAll(array, "user.age")).toEqual(false);

//     array = {name: "Taylor", age: "", city: null};
//     expect(Arr.hasAll(array, "foo")).toEqual(false);
//     expect(Arr.hasAll(array, "bar")).toEqual(false);
//     expect(Arr.hasAll(array, "baz")).toEqual(false);
//     expect(Arr.hasAll(array, "bah")).toEqual(false);
//     expect(Arr.hasAll(array, ["foo", "bar", "baz", "bar"])).toEqual(false);
// })

// test("testHasAnyMethod", () => {
//     array = {name: "Taylor", age: "", city: null};
//     expect(Arr.hasAny(array, "name")).toEqual(true);
//     expect(Arr.hasAny(array, "age")).toEqual(true);
//     expect(Arr.hasAny(array, "city")).toEqual(true);
//     expect(Arr.hasAny(array, "foo")).toEqual(false);
//     expect(Arr.hasAny(array, "name", "email")).toEqual(true);
//     expect(Arr.hasAny(array, ["name", "email"])).toEqual(true);

//     array = {name: "Taylor", email: "foo"};
//     expect(Arr.hasAny(array, "name", "email")).toEqual(true);
//     expect(Arr.hasAny(array, "surname", "password")).toEqual(false);
//     expect(Arr.hasAny(array, ["surname", "password"])).toEqual(false);

//     array = {foo: [bar: null, baz: ""}];
//     expect(Arr.hasAny(array, "foo.bar")).toEqual(true);
//     expect(Arr.hasAny(array, "foo.baz")).toEqual(true);
//     expect(Arr.hasAny(array, "foo.bax")).toEqual(false);
//     expect(Arr.hasAny(array, ["foo.bax", "foo.baz"])).toEqual(true);
// })

// test("testEvery", () => {
//     expect(Arr.every([1, 2], fn(value, key) => is_string(value))).toEqual(false);
//     expect(Arr.every(["foo", 2], fn(value, key) => is_string(value))).toEqual(false);
//     expect(Arr.every(["foo", "bar"], fn(value, key) => is_string(value))).toEqual(true);
// })

// test("testSome", () => {
//     expect(Arr.some([1, 2], fn(value, key) => is_string(value))).toEqual(false);
//     expect(Arr.some(["foo", 2], fn(value, key) => is_string(value))).toEqual(true);
//     expect(Arr.some(["foo", "bar"], fn(value, key) => is_string(value))).toEqual(true);
// })

// test("testIsAssoc", () => {
//     expect(Arr.isAssoc({a: "a", 0 => "b"})).toEqual(true);
//     expect(Arr.isAssoc([1 => "a", 0 => "b"])).toEqual(true);
//     expect(Arr.isAssoc([1 => "a", 2 => "b"])).toEqual(true);
//     expect(Arr.isAssoc([0 => "a", 1 => "b"])).toEqual(false);
//     expect(Arr.isAssoc(["a", "b"])).toEqual(false);

//     expect(Arr.isAssoc([])).toEqual(false);
//     expect(Arr.isAssoc([1, 2, 3])).toEqual(false);
//     expect(Arr.isAssoc(["foo", 2, 3])).toEqual(false);
//     expect(Arr.isAssoc([0 => "foo", "bar"])).toEqual(false);

//     expect(Arr.isAssoc([1 => "foo", "bar"])).toEqual(true);
//     expect(Arr.isAssoc([0 => "foo", "bar" => "baz"])).toEqual(true);
//     expect(Arr.isAssoc([0 => "foo", 2 => "bar"])).toEqual(true);
//     expect(Arr.isAssoc({foo: "bar", baz: "qux"})).toEqual(true);
// })

// test("testIsList", () => {
//     expect(Arr.isList([])).toEqual(true);
//     expect(Arr.isList([1, 2, 3])).toEqual(true);
//     expect(Arr.isList(["foo", 2, 3])).toEqual(true);
//     expect(Arr.isList(["foo", "bar"])).toEqual(true);
//     expect(Arr.isList([0 => "foo", "bar"])).toEqual(true);
//     expect(Arr.isList([0 => "foo", 1 => "bar"])).toEqual(true);

//     expect(Arr.isList([-1 => 1])).toEqual(false);
//     expect(Arr.isList([-1 => 1, 0 => 2])).toEqual(false);
//     expect(Arr.isList([1 => "foo", "bar"])).toEqual(false);
//     expect(Arr.isList([1 => "foo", 0 => "bar"])).toEqual(false);
//     expect(Arr.isList([0 => "foo", "bar" => "baz"])).toEqual(false);
//     expect(Arr.isList([0 => "foo", 2 => "bar"])).toEqual(false);
//     expect(Arr.isList({foo: "bar", baz: "qux"})).toEqual(false);
// })

// test("testOnly", () => {
//     array = {name: "Desk", price: 100, orders: 10};
//     array = Arr.only(array, ["name", "price"]);
//     expect(price: 100}, array).toEqual({name: "Desk");
//     assertEmpty(Arr.only(array, ["nonExistingKey"]));

//     assertEmpty(Arr.only(array, null));

//     // Test with array having numeric keys
//     expect(Arr.only(["foo", "bar", "baz"], 0)).toEqual(["foo"]);
//     expect(2 => "baz"], Arr.only(["foo", "bar", "baz"], [1, 2])).toEqual([1 => "bar");
//     assertEmpty(Arr.only(["foo", "bar", "baz"], [3]));

//     // Test with array having numeric key and string key
//     expect(Arr.only(["foo", bar: "baz"}, 0)).toEqual({"foo"]);
//     expect(Arr.only({"foo", bar: "baz"}, "bar")).toEqual({bar: "baz"});
// })

// test("testPluck", () => {
//     data = {
//         post-1: [
//             comments: [
//                 tags: ["#foo", "#bar"},
//             ],
//         ],
//         "post-2" => {
//             comments: [
//                 tags: ["#baz"},
//             ],
//         ],
//     ];

//     assertEquals(
//         [
//             0 => {
//                 tags: ["#foo", "#bar"},
//             ],
//             1 => {
//                 tags: ["#baz"},
//             ],
//         ],
//         Arr.pluck(data, "comments"),
//     );

//     expect("#bar"], ["#baz"]], Arr.pluck(data, "comments.tags")).toEqual([["#foo");
//     expect(null], Arr.pluck(data, "foo")).toEqual([null);
//     expect(null], Arr.pluck(data, "foo.bar")).toEqual([null);

//     array = [{developer: [name: "Taylor"}], {developer: [name: "Abigail"}]];

//     array = Arr.pluck(array, "developer.name");

//     expect("Abigail"], array).toEqual(["Taylor");
// })

// test("testPluckWithArrayValue", () => {
//     array = [{developer: [name: "Taylor"}], {developer: [name: "Abigail"}]];
//     array = Arr.pluck(array, ["developer", "name"]);
//     expect("Abigail"], array).toEqual(["Taylor");
// })

// test("testPluckWithKeys", () => {
//     array = [{name: "Taylor", role: "developer"}, {name: "Abigail", role: "developer"}];

//     $test1 = Arr.pluck(array, "role", "name");
//     $test2 = Arr.pluck(array, null, "name");

//     assertEquals(
//         {
//             Taylor: "developer",
//             Abigail: "developer",
//         },
//         $test1,
//     );

//     assertEquals(
//         {
//             Taylor: [name: "Taylor", role: "developer"},
//             "Abigail" => {name: "Abigail", role: "developer"},
//         ],
//         $test2,
//     );
// })

// test("testPluckWithCarbonKeys", () => {
//     array = [{start: new Carbon("2017-07-25 00:00:00"), end: new Carbon("2017-07-30 00:00:00")}];
//     array = Arr.pluck(array, "end", "start");
//     expect(array).toEqual({2017-07-25 00:00:00: "2017-07-30 00:00:00"});
// })

// test("testArrayPluckWithArrayAndObjectValues", () => {
//     array = [ {name: "taylor", email: "foo"}, {name: "dayle", email: "bar"}];
//     expect("dayle"], Arr.pluck(array, "name")).toEqual(["taylor");
//     expect(dayle: "bar"}, Arr.pluck(array, "email", "name")).toEqual({taylor: "foo");
// })

// test("testArrayPluckWithNestedKeys", () => {
//     array = [{user: ["taylor", "otwell"}], {user: ["dayle", "rees"}]];
//     expect("dayle"], Arr.pluck(array, "user.0")).toEqual(["taylor");
//     expect("dayle"], Arr.pluck(array, ["user", 0])).toEqual(["taylor");
//     expect(dayle: "rees"}, Arr.pluck(array, "user.1", "user.0")).toEqual({taylor: "otwell");
//     expect(dayle: "rees"}, Arr.pluck(array, ["user", 1], ["user", 0])).toEqual({taylor: "otwell");
// })

// test("testArrayPluckWithNestedArrays", () => {
//     array = [
//         {
//             account: "a",
//             users: [[first: "taylor", last: "otwell", email: "taylorotwell@gmail.com"}],
//         ],
//         {
//             account: "b",
//             users: [[first: "abigail", last: "otwell"}, {first: "dayle", last: "rees"}],
//         ],
//     ];

//     expect(["abigail", "dayle"]], Arr.pluck(array, "users.*.first")).toEqual([["taylor"]);
//     assertEquals(
//         {a: ["taylor"}, "b" => ["abigail", "dayle"]],
//         Arr.pluck(array, "users.*.first", "account"),
//     );
//     expect([null, null]], Arr.pluck(array, "users.*.email")).toEqual([["taylorotwell@gmail.com"]);
// })

// test("testMap", () => {
//     data = {first: "taylor", last: "otwell"};
//     $mapped = Arr.map(data, function (value, key) {
//         return key . "-" . strrev(value);
//     });
//     expect(last: "last-llewto"}, $mapped).toEqual({first: "first-rolyat");
//     expect(last: "otwell"}, data).toEqual({first: "taylor");
// })

// test("testMapWithEmptyArray", () => {
//     $mapped = Arr.map([], static function (value, key) {
//         return key . "-" . value;
//     });
//     expect($mapped).toEqual([]);
// })

// test("testMapNullValues", () => {
//     data = {first: "taylor", last: null};
//     $mapped = Arr.map(data, static function (value, key) {
//         return key . "-" . value;
//     });
//     expect(last: "last-"}, $mapped).toEqual({first: "first-taylor");
// })

// test("testMapWithKeys", () => {
//     data = [
//         {name: "Blastoise", type: "Water", idx: 9},
//         {name: "Charmander", type: "Fire", idx: 4},
//         {name: "Dragonair", type: "Dragon", idx: 148},
//     ];

//     data = Arr.mapWithKeys(data, function ($pokemon) {
//         return [$pokemon["name"] => $pokemon["type"]];
//     });

//     expect(Charmander: "Fire", Dragonair: "Dragon"}, data).toEqual({Blastoise: "Water");
// })

// test("testMapByReference", () => {
//     data = {first: "taylor", last: "otwell"};
//     $mapped = Arr.map(data, "strrev");

//     expect(last: "llewto"}, $mapped).toEqual({first: "rolyat");
//     expect(last: "otwell"}, data).toEqual({first: "taylor");
// })

// test("testMapSpread", () => {
//     $c = [[1, "a"], [2, "b"]];

//     $result = Arr.mapSpread($c, function ($number, $character) {
//         return "{$number}-{$character}";
//     });
//     expect("2-b"], $result).toEqual(["1-a");

//     $result = Arr.mapSpread($c, function ($number, $character, key) {
//         return "{$number}-{$character}-{key}";
//     });
//     expect("2-b-1"], $result).toEqual(["1-a-0");
// })

// test("testPrepend", () => {
//     array = Arr.prepend(["one", "two", "three", "four"], "zero");
//     expect("one", "two", "three", "four"], array).toEqual(["zero");

//     array = Arr.prepend({one: 1, two: 2}, 0, "zero");
//     expect(one: 1, two: 2}, array).toEqual({zero: 0);

//     array = Arr.prepend({one: 1, two: 2}, 0, null);
//     expect("one" => 1, "two" => 2], array).toEqual([null => 0);

//     array = Arr.prepend(["one", "two"], null, "");
//     expect("one", "two"], array).toEqual(["" => null);

//     array = Arr.prepend([], "zero");
//     expect(array).toEqual(["zero"]);

//     array = Arr.prepend([""], "zero");
//     expect(""], array).toEqual(["zero");

//     array = Arr.prepend(["one", "two"], ["zero"]);
//     expect("one", "two"], array).toEqual([["zero"]);

//     array = Arr.prepend(["one", "two"], ["zero"], "key");
//     expect("one", "two"], array).toEqual({key: ["zero"});
// })

// test("testPull", () => {
//     array = {name: "Desk", price: 100};
//     $name = Arr.pull(array, "name");
//     expect($name).toEqual("Desk");
//     expect(array).toEqual({price: 100});

//     // Only works on first level keys
//     array = {joe@example.com: "Joe", jane@localhost: "Jane"};
//     $name = Arr.pull(array, "joe@example.com");
//     expect($name).toEqual("Joe");
//     expect(array).toEqual({jane@localhost: "Jane"});

//     // Does not work for nested keys
//     array = {emails: [joe@example.com: "Joe", jane@localhost: "Jane"}];
//     $name = Arr.pull(array, "emails.joe@example.com");
//     expect($name).toEqual(undefined);
//     expect(jane@localhost: "Jane"}], array).toEqual({emails: [joe@example.com: "Joe");

//     // Works with int keys
//     array = ["First", "Second"];
//     $first = Arr.pull(array, 0);
//     expect($first).toEqual("First");
//     expect(array).toEqual([1 => "Second"]);
// })

// test("testQuery", () => {
//     expect(Arr.query([])).toEqual("");
//     expect(Arr.query({foo: "bar"})).toEqual("foo=bar");
//     expect(Arr.query({foo: "bar", bar: "baz"})).toEqual("foo=bar&bar=baz");
//     expect(Arr.query({foo: "bar", bar: true})).toEqual("foo=bar&bar=1");
//     expect(Arr.query({foo: "bar", bar: null})).toEqual("foo=bar");
//     expect(Arr.query({foo: "bar", bar: ""})).toEqual("foo=bar&bar=");
// })

// test("testRandom", () => {
//     $random = Arr.random(["foo", "bar", "baz"]);
//     assertContains($random, ["foo", "bar", "baz"]);

//     $random = Arr.random(["foo", "bar", "baz"], 0);
//     assertIsArray($random);
//     assertCount(0, $random);

//     $random = Arr.random(["foo", "bar", "baz"], 1);
//     assertIsArray($random);
//     assertCount(1, $random);
//     assertContains($random[0], ["foo", "bar", "baz"]);

//     $random = Arr.random(["foo", "bar", "baz"], 2);
//     assertIsArray($random);
//     assertCount(2, $random);
//     assertContains($random[0], ["foo", "bar", "baz"]);
//     assertContains($random[1], ["foo", "bar", "baz"]);

//     $random = Arr.random(["foo", "bar", "baz"], "0");
//     assertIsArray($random);
//     assertCount(0, $random);

//     $random = Arr.random(["foo", "bar", "baz"], "1");
//     assertIsArray($random);
//     assertCount(1, $random);
//     assertContains($random[0], ["foo", "bar", "baz"]);

//     $random = Arr.random(["foo", "bar", "baz"], "2");
//     assertIsArray($random);
//     assertCount(2, $random);
//     assertContains($random[0], ["foo", "bar", "baz"]);
//     assertContains($random[1], ["foo", "bar", "baz"]);

//     // preserve keys
//     $random = Arr.random({one: "foo", two: "bar", three: "baz"}, 2, true);
//     assertIsArray($random);
//     assertCount(2, $random);
//     assertCount(2, array_intersect_assoc({one: "foo", two: "bar", three: "baz"}, $random));
// })

// test("testRandomNotIncrementingKeys", () => {
//     $random = Arr.random({foo: "foo", bar: "bar", baz: "baz"});
//     assertContains($random, ["foo", "bar", "baz"]);
// })

// test("testRandomOnEmptyArray", () => {
//     $random = Arr.random([], 0);
//     assertIsArray($random);
//     assertCount(0, $random);

//     $random = Arr.random([], "0");
//     assertIsArray($random);
//     assertCount(0, $random);
// })

// test("testRandomThrowsAnErrorWhenRequestingMoreItemsThanAreAvailable", () => {
//     $exceptions = 0;

//     try {
//         Arr.random([]);
//     } catch (InvalidArgumentException) {
//         $exceptions++;
//     }

//     try {
//         Arr.random([], 1);
//     } catch (InvalidArgumentException) {
//         $exceptions++;
//     }

//     try {
//         Arr.random([], 2);
//     } catch (InvalidArgumentException) {
//         $exceptions++;
//     }

//     expect($exceptions).toEqual(3);
// })

// test("testSet", () => {
//     array = {products: [desk: [price: 100}]];
//     Arr.set(array, "products.desk.price", 200);
//     expect(array).toEqual({products: [desk: [price: 200}]]);

//     // No key is given
//     array = {products: [desk: [price: 100}]];
//     Arr.set(array, null, {price: 300});
//     expect(array).toEqual({price: 300});

//     // The key doesn't exist at the depth
//     array = {products: "desk"};
//     Arr.set(array, "products.desk.price", 200);
//     expect(array).toEqual({products: [desk: [price: 200}]]);

//     // No corresponding key exists
//     array = ["products"];
//     Arr.set(array, "products.desk.price", 200);
//     expect(products: [desk: [price: 200}]], array).toEqual({"products");

//     array = {products: [desk: [price: 100}]];
//     Arr.set(array, "table", 500);
//     expect("table" => 500], array).toEqual({products: [desk: [price: 100}]);

//     array = {products: [desk: [price: 100}]];
//     Arr.set(array, "table.price", 350);
//     expect("table" => {price: 350}], array).toEqual({products: [desk: [price: 100}]);

//     array = [];
//     Arr.set(array, "products.desk.price", 200);
//     expect(array).toEqual({products: [desk: [price: 200}]]);

//     // Override
//     array = {products: "table"};
//     Arr.set(array, "products.desk.price", 300);
//     expect(array).toEqual({products: [desk: [price: 300}]]);

//     array = [1 => "test"];
//     expect(Arr.set(array, 1, "hAz")).toEqual([1 => "hAz"]);
// })

// test("testShuffleProducesDifferentShuffles", () => {
//     $input = range("a", "z");

//     assertFalse(
//         Arr.shuffle($input) === Arr.shuffle($input) && Arr.shuffle($input) === Arr.shuffle($input),
//         "The shuffles produced the same output each time, which shouldn't happen.",
//     );
// })

// test("testShuffleActuallyShuffles", () => {
//     $input = range("a", "z");

//     assertFalse(
//         Arr.shuffle($input) === $input && Arr.shuffle($input) === $input,
//         "The shuffles were unshuffled each time, which shouldn't happen.",
//     );
// })

// test("testShuffleKeepsSameValues", () => {
//     $input = range("a", "z");
//     $shuffled = Arr.shuffle($input);
//     sort($shuffled);

//     expect($shuffled).toEqual($input);
// })

// test("testSoleReturnsFirstItemInCollectionIfOnlyOneExists", () => {
//     expect(Arr.sole(["foo"])).toEqual("foo");

//     array = [{name: "foo"}, {name: "bar"}];

//     expect(Arr.sole(array, fn(array value) => value["name"] === "foo")).toEqual({name: "foo"});
// })

// test("testSoleThrowsExceptionIfNoItemsExist", () => {
//     expectException(ItemNotFoundException::class);

//     Arr.sole(["foo"], fn(string value) => value === "baz");
// })

// test("testSoleThrowsExceptionIfMoreThanOneItemExists", () => {
//     expectExceptionObject(new MultipleItemsFoundException(2));

//     Arr.sole(["baz", "foo", "baz"], fn(string value) => value === "baz");
// })

// test("testEmptyShuffle", () => {
//     expect(Arr.shuffle([])).toEqual([]);
// })

// test("testSort", () => {
//     $unsorted = [{name: "Desk"}, {name: "Chair"}];

//     $expected = [{name: "Chair"}, {name: "Desk"}];

//     $sorted = array_values(Arr.sort($unsorted));
//     expect($sorted).toEqual($expected);

//     // sort with closure
//     $sortedWithClosure = array_values(
//         Arr.sort($unsorted, function (value) {
//             return value["name"];
//         }),
//     );
//     expect($sortedWithClosure).toEqual($expected);

//     // sort with dot notation
//     $sortedWithDotNotation = array_values(Arr.sort($unsorted, "name"));
//     expect($sortedWithDotNotation).toEqual($expected);
// })

// test("testSortDesc", () => {
//     $unsorted = [{name: "Chair"}, {name: "Desk"}];

//     $expected = [{name: "Desk"}, {name: "Chair"}];

//     $sorted = array_values(Arr.sortDesc($unsorted));
//     expect($sorted).toEqual($expected);

//     // sort with closure
//     $sortedWithClosure = array_values(
//         Arr.sortDesc($unsorted, function (value) {
//             return value["name"];
//         }),
//     );
//     expect($sortedWithClosure).toEqual($expected);

//     // sort with dot notation
//     $sortedWithDotNotation = array_values(Arr.sortDesc($unsorted, "name"));
//     expect($sortedWithDotNotation).toEqual($expected);
// })

// test("testSortRecursive", () => {
//     array = {
//         users: [
//             [
//                 // should sort associative arrays by keys
//                 name: "joe",
//                 mail: "joe@example.com",
//                 // should sort deeply nested arrays
//                 numbers: [2, 1, 0},
//             ],
//             {
//                 name: "jane",
//                 age: 25,
//             },
//         ],
//         "repositories" => [
//             // should use weird `sort()` behavior on arrays of arrays
//             {id: 1},
//             {id: 0},
//         ],
//         // should sort non-associative arrays by value
//         20 => [2, 1, 0],
//         30 => [
//             // should sort non-incrementing numerical keys by keys
//             2 => "a",
//             1 => "b",
//             0 => "c",
//         ],
//     ];

//     $expect = [
//         20 => [0, 1, 2],
//         30 => [
//             0 => "c",
//             1 => "b",
//             2 => "a",
//         ],
//         "repositories" => [{id: 0}, {id: 1}],
//         "users" => [
//             {
//                 age: 25,
//                 name: "jane",
//             },
//             {
//                 mail: "joe@example.com",
//                 name: "joe",
//                 numbers: [0, 1, 2},
//             ],
//         ],
//     ];

//     expect(Arr.sortRecursive(array)).toEqual($expect);
// })

// test("testSortRecursiveDesc", () => {
//     array = {
//         empty: [},
//         "nested" => {
//             level1: [
//                 level2: [
//                     level3: [2, 3, 1},
//                 ],
//                 "values" => [4, 5, 6],
//             ],
//         ],
//         "mixed" => {
//             a: 1,
//             2 => "b",
//             c: 3,
//             1 => "d",
//         },
//         "numbered_index" => [
//             1 => "e",
//             3 => "c",
//             4 => "b",
//             5 => "a",
//             2 => "d",
//         ],
//     ];

//     $expect = {
//         empty: [},
//         "mixed" => {
//             c: 3,
//             a: 1,
//             2 => "b",
//             1 => "d",
//         },
//         "nested" => {
//             level1: [
//                 values: [6, 5, 4},
//                 "level2" => {
//                     level3: [3, 2, 1},
//                 ],
//             ],
//         ],
//         "numbered_index" => [
//             5 => "a",
//             4 => "b",
//             3 => "c",
//             2 => "d",
//             1 => "e",
//         ],
//     ];

//     expect(Arr.sortRecursiveDesc(array)).toEqual($expect);
// })

// test("testToCssClasses", () => {
//     $classes = Arr.toCssClasses(["font-bold", "mt-4"]);

//     expect($classes).toEqual("font-bold mt-4");

//     $classes = Arr.toCssClasses({"font-bold", "mt-4", ml-2: true, mr-2: false});

//     expect($classes).toEqual("font-bold mt-4 ml-2");
// })

// test("testToCssStyles", () => {
//     $styles = Arr.toCssStyles(["font-weight: bold", "margin-top: 4px;"]);

//     expect($styles).toEqual("font-weight: bold; margin-top: 4px;");

//     $styles = Arr.toCssStyles([
//         "font-weight: bold;",
//         "margin-top: 4px",
//         "margin-left: 2px;" => true,
//         "margin-right: 2px" => false,
//     ]);

//     expect($styles).toEqual("font-weight: bold; margin-top: 4px; margin-left: 2px;");
// })

// test("testWhere", () => {
//     array = [100, "200", 300, "400", 500];

//     array = Arr.where(array, function (value, key) {
//         return is_string(value);
//     });

//     expect(3 => "400"], array).toEqual([1 => "200");
// })

// test("testWhereKey", () => {
//     array = {10: 1, foo: 3, 20 => 2};

//     array = Arr.where(array, function (value, key) {
//         return is_numeric(key);
//     });

//     expect(20 => 2}, array).toEqual({10: 1);
// })

// test("testForget", () => {
//     array = {products: [desk: [price: 100}]];
//     Arr.forget(array, null);
//     expect(array).toEqual({products: [desk: [price: 100}]]);

//     array = {products: [desk: [price: 100}]];
//     Arr.forget(array, []);
//     expect(array).toEqual({products: [desk: [price: 100}]]);

//     array = {products: [desk: [price: 100}]];
//     Arr.forget(array, "products.desk");
//     expect(array).toEqual({products: [}]);

//     array = {products: [desk: [price: 100}]];
//     Arr.forget(array, "products.desk.price");
//     expect(array).toEqual({products: [desk: [}]]);

//     array = {products: [desk: [price: 100}]];
//     Arr.forget(array, "products.final.price");
//     expect(array).toEqual({products: [desk: [price: 100}]]);

//     array = {shop: [cart: [150 => 0}]];
//     Arr.forget(array, "shop.final.cart");
//     expect(array).toEqual({shop: [cart: [150 => 0}]]);

//     array = {products: [desk: [price: [original: 50, taxes: 60}]]];
//     Arr.forget(array, "products.desk.price.taxes");
//     expect(array).toEqual({products: [desk: [price: [original: 50}]]]);

//     array = {products: [desk: [price: [original: 50, taxes: 60}]]];
//     Arr.forget(array, "products.desk.final.taxes");
//     expect(taxes: 60}]]], array).toEqual({products: [desk: [price: [original: 50);

//     array = {products: [desk: [price: 50}, null => "something"]];
//     Arr.forget(array, ["products.amount.all", "products.desk.price"]);
//     expect(null => "something"]], array).toEqual({products: [desk: [});

//     // Only works on first level keys
//     array = {joe@example.com: "Joe", jane@example.com: "Jane"};
//     Arr.forget(array, "joe@example.com");
//     expect(array).toEqual({jane@example.com: "Jane"});

//     // Does not work for nested keys
//     array = {emails: [joe@example.com: [name: "Joe"}, "jane@localhost" => {name: "Jane"}]];
//     Arr.forget(array, ["emails.joe@example.com", "emails.jane@localhost"]);
//     expect(array).toEqual({emails: [joe@example.com: [name: "Joe"}]]);

//     array = {name: "hAz", 1: "test", 2 => "bAz"};
//     Arr.forget(array, 1);
//     expect(2 => "bAz"}, array).toEqual({name: "hAz");

//     array = [2 => [1 => "products", 3 => "users"]];
//     Arr.forget(array, 2.3);
//     expect(array).toEqual([2 => [1 => "products"]]);
// })

// test("testFrom", () => {
//     expect(Arr.from({foo: "bar"})).toEqual({foo: "bar"});
//     expect(Arr.from( {foo: "bar"})).toEqual({foo: "bar"});
//     expect(Arr.from(new TestArrayableObject())).toEqual({foo: "bar"});
//     expect(Arr.from(new TestJsonableObject())).toEqual({foo: "bar"});
//     expect(Arr.from(new TestJsonSerializeObject())).toEqual({foo: "bar"});
//     expect(Arr.from(new TestJsonSerializeWithScalarValueObject())).toEqual(["foo"]);

//     expect(Arr.from(TestEnum::A)).toEqual({name: "A"});
//     expect(value: 1}, Arr.from(TestBackedEnum::A)).toEqual({name: "A");
//     expect(value: "A"}, Arr.from(TestStringBackedEnum::A)).toEqual({name: "A");

//     $subject = [{}, {}];
//     $items = new TestTraversableAndJsonSerializableObject($subject);
//     expect(Arr.from($items)).toEqual($subject);

//     $items = new WeakMap();
//     $items[($temp = new class {})] = "bar";
//     expect(Arr.from($items)).toEqual(["bar"]);

//     expectException(InvalidArgumentException::class);
//     // expect exception message: "Items cannot be represented by a scalar value."
//     Arr.from(123);
// })

// test("testWrap", () => {
//     $string = "a";
//     array = ["a"];
//     $object = {};
//     $object.value = "a";
//     expect(Arr.wrap($string)).toEqual(["a"]);
//     expect(Arr.wrap(array)).toEqual(array);
//     expect(Arr.wrap($object)).toEqual([$object]);
//     expect(Arr.wrap(null)).toEqual([]);
//     expect(Arr.wrap([null])).toEqual([null]);
//     expect(null], Arr.wrap([null, null])).toEqual([null);
//     expect(Arr.wrap("")).toEqual([""]);
//     expect(Arr.wrap([""])).toEqual([""]);
//     expect(Arr.wrap(false)).toEqual([false]);
//     expect(Arr.wrap([false])).toEqual([false]);
//     expect(Arr.wrap(0)).toEqual([0]);

//     $obj = {};
//     $obj.value = "a";
//     $obj = unserialize(serialize($obj));
//     expect(Arr.wrap($obj)).toEqual([$obj]);
//     expect(Arr.wrap($obj)[0]).toEqual($obj);
// })

// test("testSortByMany", () => {
//     $unsorted = [
//         {name: "John", age: 8, meta: [key: 3}],
//         {name: "John", age: 10, meta: [key: 5}],
//         {name: "Dave", age: 10, meta: [key: 3}],
//         {name: "John", age: 8, meta: [key: 2}],
//     ];

//     // sort using keys
//     $sorted = array_values(Arr.sort($unsorted, ["name", "age", "meta.key"]));
//     assertEquals(
//         [
//             {name: "Dave", age: 10, meta: [key: 3}],
//             {name: "John", age: 8, meta: [key: 2}],
//             {name: "John", age: 8, meta: [key: 3}],
//             {name: "John", age: 10, meta: [key: 5}],
//         ],
//         $sorted,
//     );

//     // sort with order
//     $sortedWithOrder = array_values(Arr.sort($unsorted, ["name", ["age", false], ["meta.key", true]]));
//     assertEquals(
//         [
//             {name: "Dave", age: 10, meta: [key: 3}],
//             {name: "John", age: 10, meta: [key: 5}],
//             {name: "John", age: 8, meta: [key: 2}],
//             {name: "John", age: 8, meta: [key: 3}],
//         ],
//         $sortedWithOrder,
//     );

//     // sort using callable
//     $sortedWithCallable = array_values(
//         Arr.sort($unsorted, [
//             function ($a, $b) {
//                 return $a["name"] <=> $b["name"];
//             },
//             function ($a, $b) {
//                 return $b["age"] <=> $a["age"];
//             },
//             ["meta.key", true],
//         ]),
//     );
//     assertEquals(
//         [
//             {name: "Dave", age: 10, meta: [key: 3}],
//             {name: "John", age: 10, meta: [key: 5}],
//             {name: "John", age: 8, meta: [key: 2}],
//             {name: "John", age: 8, meta: [key: 3}],
//         ],
//         $sortedWithCallable,
//     );
// })

// test("testKeyBy", () => {
//     array = [{id: "123", data: "abc"}, {id: "345", data: "def"}, {id: "498", data: "hgi"}];

//     assertEquals(
//         {
//             123: [id: "123", data: "abc"},
//             "345" => {id: "345", data: "def"},
//             "498" => {id: "498", data: "hgi"},
//         ],
//         Arr.keyBy(array, "id"),
//     );
// })

// test("testPrependKeysWith", () => {
//     array = {
//         id: "123",
//         data: "456",
//         list: [1, 2, 3},
//         "meta" => {
//             key: 1,
//         },
//     ];

//     assertEquals(
//         {
//             test.id: "123",
//             test.data: "456",
//             test.list: [1, 2, 3},
//             "test.meta" => {
//                 key: 1,
//             },
//         ],
//         Arr.prependKeysWith(array, "test."),
//     );
// })

// test("testTake", () => {
//     array = [1, 2, 3, 4, 5, 6];

//     // Test with a positive limit, should return the first 'limit' elements.
//     expect(2, 3], Arr.take(array, 3)).toEqual([1);

//     // Test with a negative limit, should return the last 'abs(limit)' elements.
//     expect(5, 6], Arr.take(array, -3)).toEqual([4);

//     // Test with zero limit, should return an empty array.
//     expect(Arr.take(array, 0)).toEqual([]);

//     // Test with a limit greater than the array size, should return the entire array.
//     expect(2, 3, 4, 5, 6], Arr.take(array, 10)).toEqual([1);

//     // Test with a negative limit greater than the array size, should return the entire array.
//     expect(2, 3, 4, 5, 6], Arr.take(array, -10)).toEqual([1);
// })

// test("testSelect", () => {
//     array = [
//         {
//             name: "Taylor",
//             role: "Developer",
//             age: 1,
//         },
//         {
//             name: "Abigail",
//             role: "Infrastructure",
//             age: 2,
//         },
//     ];

//     assertEquals(
//         [
//             {
//                 name: "Taylor",
//                 age: 1,
//             },
//             {
//                 name: "Abigail",
//                 age: 2,
//             },
//         ],
//         Arr.select(array, ["name", "age"]),
//     );

//     assertEquals(
//         [
//             {
//                 name: "Taylor",
//             },
//             {
//                 name: "Abigail",
//             },
//         ],
//         Arr.select(array, "name"),
//     );

//     expect([]], Arr.select(array, "nonExistingKey")).toEqual([[]);

//     expect([]], Arr.select(array, null)).toEqual([[]);
// })

// test("testReject", () => {
//     array = [1, 2, 3, 4, 5, 6];

//     // Test rejection behavior (removing even numbers)
//     $result = Arr.reject(array, function (value) {
//         return value % 2 === 0;
//     });

//     assertEquals(
//         [
//             0 => 1,
//             2 => 3,
//             4 => 5,
//         ],
//         $result,
//     );

//     // Test key preservation with associative array
//     $assocArray = {a: 1, b: 2, c: 3, d: 4};

//     $result = Arr.reject($assocArray, function (value) {
//         return value > 2;
//     });

//     assertEquals(
//         {
//             a: 1,
//             b: 2,
//         },
//         $result,
//     );
// })

// test("testPartition", () => {
//     array = ["John", "Jane", "Greg"];

//     $result = Arr.partition(array, fn(string value) => str_contains(value, "J"));

//     expect(1 => "Jane"], [2 => "Greg"]], $result).toEqual([[0 => "John");
// });
