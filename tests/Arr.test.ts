import { expect, test } from 'vitest';
import { Arr } from '../src/Arr';
import { mb_strtoupper, str_contains } from '@balboacodes/php-utils';

test('accessible', () => {
    expect(Arr.accessible([])).toBe(true);
    expect(Arr.accessible([1, 2])).toBe(true);
    expect(Arr.accessible({ a: 1, b: 2 })).toBe(true);
    expect(Arr.accessible(null)).toBe(false);
    expect(Arr.accessible('abc')).toBe(false);
    expect(Arr.accessible({})).toBe(true);
    expect(Arr.accessible(123)).toBe(false);
    expect(Arr.accessible(12.34)).toBe(false);
    expect(Arr.accessible(true)).toBe(false);
    expect(Arr.accessible(new Date())).toBe(true);
    expect(Arr.accessible(() => null)).toBe(false);
});

test('add', () => {
    const array = Arr.add(['Desk'], 1, 100);

    expect(array).toEqual(['Desk', 100]);
    expect(Arr.add([], 0, 'Mövsümov')).toEqual(['Mövsümov']);
    expect(Arr.add([], '0.0', 'Ferid')).toEqual([['Ferid']]);
    expect(Arr.add([], 1, 'hAz')).toEqual([undefined, 'hAz']);
    expect(Arr.add([], '1.1', 'hAz')).toEqual([undefined, [undefined, 'hAz']]);

    // Case where the key already exists
    expect(Arr.add(['Table'], 0, 'Chair')).toEqual(['Table']);
    expect(Arr.add([['Table']], '0.0', 'Chair')).toEqual([['Table']]);
});

test('array', () => {
    const testArray = ['foo bar', ['foo', 'bar']];

    // Test array values are returned as arrays
    expect(Arr.array(testArray, 1)).toEqual(['foo', 'bar']);

    // Test that default array values are returned for missing keys
    expect(Arr.array(testArray, 2, [1, 'two'])).toEqual([1, 'two']);

    // Test that an exception is raised if the value is not an array
    expect(() => Arr.array(testArray, 0)).toThrow('Array value for key [0] must be an array, string found.');
});

test('boolean', () => {
    const testArray = ['foo bar', true];

    // Test boolean values are returned as booleans
    expect(Arr.boolean(testArray, 1)).toBe(true);

    // Test that default boolean values are returned for missing keys
    expect(Arr.boolean(testArray, 2, true)).toBe(true);

    // Test that an exception is raised if the value is not a boolean
    expect(() => Arr.boolean(testArray, 0)).toThrow('Array value for key [0] must be a boolean, string found.');
});

test('collapse', () => {
    // Normal case: a two-dimensional array with different elements
    const data = [['foo', 'bar'], ['baz']];
    expect(Arr.collapse(data)).toEqual(['foo', 'bar', 'baz']);

    // Case including numeric and string elements
    const array = [[1], [2], [3], ['foo', 'bar']];
    expect(Arr.collapse(array)).toEqual([1, 2, 3, 'foo', 'bar']);

    // Case with empty two-dimensional arrays
    const emptyArray = [[], [], []];
    expect(Arr.collapse(emptyArray)).toEqual([]);

    // Case with both empty arrays and arrays with elements
    let mixedArray = [[], [1, 2], [], ['foo', 'bar']];
    expect(Arr.collapse(mixedArray)).toEqual([1, 2, 'foo', 'bar']);

    // Case including collections and arrays
    const collection = ['baz', 'boom'];
    mixedArray = [[1], [2], [3], ['foo', 'bar'], collection];
    expect(Arr.collapse(mixedArray)).toEqual([1, 2, 3, 'foo', 'bar', 'baz', 'boom']);
});

test('crossJoin', () => {
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

test('divide', () => {
    // Test dividing an empty array
    let [keys, values] = Arr.divide([]);
    expect(keys).toEqual([]);
    expect(values).toEqual([]);

    // Test dividing an array with a single key-value pair
    [keys, values] = Arr.divide(['Desk']);
    expect(keys).toEqual([0]);
    expect(values).toEqual(['Desk']);

    // Test dividing an array with multiple key-value pairs
    [keys, values] = Arr.divide(['Desk', 100, true]);
    expect(keys).toEqual([0, 1, 2]);
    expect(values).toEqual(['Desk', 100, true]);

    // Test dividing an array where the values are arrays
    [keys, values] = Arr.divide([[1, 'second'], 'one']);
    expect(keys).toEqual([0, 1]);
    expect(values).toEqual([[1, 'second'], 'one']);
});

test('every', () => {
    expect(Arr.every([1, 2], (value) => typeof value === 'string')).toBe(false);
    expect(Arr.every(['foo', 2], (value) => typeof value === 'string')).toBe(false);
    expect(Arr.every(['foo', 'bar'], (value) => typeof value === 'string')).toBe(true);
});

test('except', () => {
    expect(Arr.except(['taylor', 26], [0])).toEqual([26]);
    expect(Arr.except(['taylor', 26], 0)).toEqual([26]);
    expect(Arr.except(['taylor', ['PHP', 'Laravel']], 1)).toEqual(['taylor']);
    expect(Arr.except(['taylor', ['PHP', 'Laravel']], '1.0')).toEqual(['taylor', ['Laravel']]);
    expect(Arr.except(['taylor', ['PHP', 'Laravel']], [0, '1.1'])).toEqual([['PHP']]);
    expect(Arr.except([0, 'hAz', [0, 'foo', 2, 'baz']], 2)).toEqual([0, 'hAz']);
    expect(Arr.except([0, 'hAz', [0, 'foo', 2, 'baz']], '2.2')).toEqual([0, 'hAz', [0, 'foo', 'baz']]);
});

test('exists', () => {
    expect(Arr.exists([1], 0)).toBe(true);
    expect(Arr.exists([null], 0)).toBe(true);

    expect(Arr.exists([1], 1)).toBe(false);
    expect(Arr.exists([null], 1)).toBe(false);
});

test('first', () => {
    const array = [100, 200, 300];

    // Callback is undefined and array is empty
    expect(Arr.first([])).toBe(undefined);
    expect(Arr.first([], undefined, 'foo')).toBe('foo');
    expect(Arr.first([], undefined, () => 'bar')).toBe('bar');

    // Callback is undefined and array is not empty
    expect(Arr.first(array)).toBe(100);

    // Callback is not undefined and array is not empty
    const value = Arr.first(array, (value) => value >= 150);
    expect(value).toBe(200);

    // Callback is not undefined, array is not empty but no satisfied item
    const value2 = Arr.first(array, (value) => value > 300);
    const value3 = Arr.first(array, (value) => value > 300, 'bar');
    const value4 = Arr.first(
        array,
        (value) => value > 300,
        () => 'baz',
    );
    const value5 = Arr.first(array, (_value, key) => Number(key) < 2);

    expect(value2).toBe(undefined);
    expect(value3).toBe('bar');
    expect(value4).toBe('baz');
    expect(value5).toBe(100);
});

test('flatten', () => {
    // Flat arrays are unaffected
    let array: any[] = ['#foo', '#bar', '#baz'];
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

    // Nested arrays are flattened alongside arrays
    array = [['#foo', '#bar'], ['#baz']];
    expect(Arr.flatten(array)).toEqual(['#foo', '#bar', '#baz']);

    // Nested arrays containing plain arrays are flattened
    array = [['#foo', ['#bar']], ['#baz']];
    expect(Arr.flatten(array)).toEqual(['#foo', '#bar', '#baz']);

    // Nested arrays containing arrays are flattened
    array = [['#foo', ['#bar']], ['#baz']];
    expect(Arr.flatten(array)).toEqual(['#foo', '#bar', '#baz']);

    // Nested arrays containing arrays containing arrays are flattened
    array = [['#foo', ['#bar', ['#zap']]], ['#baz']];
    expect(Arr.flatten(array)).toEqual(['#foo', '#bar', '#zap', '#baz']);

    // No depth flattens recursively
    array = [['#foo', ['#bar', ['#baz']]], '#zap'];
    expect(Arr.flatten(array)).toEqual(['#foo', '#bar', '#baz', '#zap']);

    // Specifying a depth only flattens to that depth
    array = [['#foo', ['#bar', ['#baz']]], '#zap'];
    expect(Arr.flatten(array, 1)).toEqual(['#foo', ['#bar', ['#baz']], '#zap']);

    array = [['#foo', ['#bar', ['#baz']]], '#zap'];
    expect(Arr.flatten(array, 2)).toEqual(['#foo', '#bar', ['#baz'], '#zap']);
});

test('forget', () => {
    let array: any[] = [[[100]]];
    Arr.forget(array, 1);
    expect(array).toEqual([[[100]]]);

    array = [[[100]]];
    Arr.forget(array, []);
    expect(array).toEqual([[[100]]]);

    array = [[[100]]];
    Arr.forget(array, '0.0');
    expect(array).toEqual([[]]);

    array = [[[100]]];
    Arr.forget(array, '0.0.0');
    expect(array).toEqual([[[]]]);

    array = [[[100]]];
    Arr.forget(array, '0.1.0');
    expect(array).toEqual([[[100]]]);

    array = [[[0]]];
    Arr.forget(array, '0.1.0');
    expect(array).toEqual([[[0]]]);

    array = [[[[50, 60]]]];
    Arr.forget(array, '0.0.0.1');
    expect(array).toEqual([[[[50]]]]);

    array = [[[[50, 60]]]];
    Arr.forget(array, '0.0.1.0');
    expect(array).toEqual([[[[50, 60]]]]);

    array = [[[50], 'something']];
    Arr.forget(array, ['0.1.0', '0.0.0']);
    expect(array).toEqual([[[], 'something']]);

    // Only works on first level keys
    array = ['Joe', 'Jane'];
    Arr.forget(array, 0);
    expect(array).toEqual(['Jane']);

    // Does not work for nested keys
    array = [[['Joe'], ['Jane']]];
    Arr.forget(array, ['0.0', '0.1']);
    expect(array).toEqual([[['Jane']]]);

    array = ['hAz', 'test', 'bAz'];
    Arr.forget(array, 1);
    expect(array).toEqual(['hAz', 'bAz']);

    array = [undefined, undefined, [undefined, 'products', 'users']];
    Arr.forget(array, '2.2');
    expect(array).toEqual([undefined, undefined, [undefined, 'products']]);
});

test('from', () => {
    expect(Arr.from(['bar'])).toEqual(['bar']);
    expect(Arr.from({ foo: 'bar' })).toEqual([]);

    const subject = [{}, {}];

    expect(Arr.from(subject)).toEqual([{}, {}]);

    let items = new Map([[0, 'bar']]);

    expect(Arr.from(items)).toEqual([[0, 'bar']]);

    expect(Arr.from(123)).toEqual([]);
    expect(Arr.from('foo')).toEqual(['f', 'o', 'o']);
});

test('get', () => {
    let array: any[] = [[100]];
    expect(Arr.get(array, 0)).toEqual([100]);

    array = [[[100]]];
    let value = Arr.get(array, '0.0');
    expect(value).toEqual([100]);

    // Test null array values
    array = [null, [null]];
    expect(Arr.get(array, 0, 'default')).toBeNull();
    expect(Arr.get(array, '1.0', 'default')).toBeNull();

    // Test undefined key returns the whole array
    array = ['foo', 'bar'];
    expect(Arr.get(array, undefined)).toEqual(array);

    // Test array is empty and key is undefined
    expect(Arr.get([], undefined)).toEqual([]);
    expect(Arr.get([], undefined, 'default')).toEqual([]);

    // Test numeric keys
    array = [[['desk'], ['chair']]];
    expect(Arr.get(array, '0.0.0')).toBe('desk');
    expect(Arr.get(array, '0.1.0')).toBe('chair');

    // Test return default value for non-existing key.
    array = [['taylor']];
    expect(Arr.get(array, '0.1', 'dayle')).toBe('dayle');
    expect(Arr.get(array, '0.1', () => 'dayle')).toBe('dayle');

    // Test array has a null key
    expect(Arr.get({ '': 'bar' }, '')).toBe('bar');
    expect(Arr.get({ '': { '': 'bar' } }, '.')).toBe('bar');
});

test('has', () => {
    let array: any[] = [[100]];
    expect(Arr.has(array, 0)).toBe(true);

    array = [[[100]]];
    expect(Arr.has(array, '0.0')).toBe(true);
    expect(Arr.has(array, '0.0.0')).toBe(true);
    expect(Arr.has(array, '0.1')).toBe(false);
    expect(Arr.has(array, '0.0.1')).toBe(false);

    array = [null, [null]];
    expect(Arr.has(array, 0)).toBe(true);
    expect(Arr.has(array, '1.0')).toBe(true);

    array = [10, [10]];
    expect(Arr.has(array, 0)).toBe(true);
    expect(Arr.has(array, 1)).toBe(true);
    expect(Arr.has(array, '1.0')).toBe(true);
    expect(Arr.has(array, 2)).toBe(false);
    expect(Arr.has(array, '2.3')).toBe(false);
    expect(Arr.has(array, '0.2')).toBe(false);
    expect(Arr.has(array, '1.2')).toBe(false);

    array = [null, [null]];
    expect(Arr.has(array, 0)).toBe(true);
    expect(Arr.has(array, '1.0')).toBe(true);

    array = [[[100]]];
    expect(Arr.has(array, ['0.0'])).toBe(true);
    expect(Arr.has(array, ['0.0', '0.0.0'])).toBe(true);
    expect(Arr.has(array, ['0', '0'])).toBe(true);
    expect(Arr.has(array, [1])).toBe(false);
    expect(Arr.has(array, [])).toBe(false);
    expect(Arr.has(array, ['0.0', '0.1'])).toBe(false);

    array = [[['desk']]];
    expect(Arr.has(array, '0.0.0')).toBe(true);
    expect(Arr.has(array, '0.0.1')).toBe(false);
    expect(Arr.has(['some'], 0)).toBe(true);
    expect(Arr.has(['some'], [0])).toBe(true);
    expect(Arr.has([''], 1)).toBe(false);
    expect(Arr.has([], 0)).toBe(false);
    expect(Arr.has([], [0])).toBe(false);
});

test('hasAll', () => {
    let array: any[] = ['Taylor', '', null];
    expect(Arr.hasAll(array, 0)).toBe(true);
    expect(Arr.hasAll(array, 1)).toBe(true);
    expect(Arr.hasAll(array, [1, 3])).toBe(false);
    expect(Arr.hasAll(array, 2)).toBe(true);
    expect(Arr.hasAll(array, [2, 4])).toBe(false);
    expect(Arr.hasAll(array, [0, 1, 2])).toBe(true);
    expect(Arr.hasAll(array, [0, 1, 2, 5])).toBe(false);

    array = [['Taylor']];
    expect(Arr.hasAll(array, '0.0')).toBe(true);
    expect(Arr.hasAll(array, '0.1')).toBe(false);

    array = ['Taylor', '', null];
    expect(Arr.hasAll(array, 3)).toBe(false);
    expect(Arr.hasAll(array, 4)).toBe(false);
    expect(Arr.hasAll(array, 5)).toBe(false);
    expect(Arr.hasAll(array, 6)).toBe(false);
    expect(Arr.hasAll(array, [3, 4, 5, 4])).toBe(false);
});

test('hasAny', () => {
    let array: any[] = ['Taylor', '', null];
    expect(Arr.hasAny(array, 0)).toBe(true);
    expect(Arr.hasAny(array, 1)).toBe(true);
    expect(Arr.hasAny(array, 2)).toBe(true);
    expect(Arr.hasAny(array, 4)).toBe(false);
    expect(Arr.hasAny(array, [0, 5])).toBe(true);

    array = ['Taylor', 'foo'];
    expect(Arr.hasAny(array, 0)).toBe(true);
    expect(Arr.hasAny(array, 2)).toBe(false);
    expect(Arr.hasAny(array, [2, 3])).toBe(false);

    array = [[null, '']];
    expect(Arr.hasAny(array, '0.0')).toBe(true);
    expect(Arr.hasAny(array, '0.1')).toBe(true);
    expect(Arr.hasAny(array, '0.2')).toBe(false);
    expect(Arr.hasAny(array, ['0.2', '0.1'])).toBe(true);
});

test('integer', () => {
    const testArray = ['foo bar', 1234];

    // Test integer values are returned as integers
    expect(Arr.integer(testArray, 1)).toBe(1234);

    // Test that default integer values are returned for missing keys
    expect(Arr.integer(testArray, 2, 999)).toBe(999);

    // Test that an exception is raised if the value is not an integer
    expect(() => Arr.integer(testArray, 0)).toThrow('Array value for key [0] must be an integer, string found.');
});

test('join', () => {
    expect(Arr.join(['a', 'b', 'c'], ', ')).toBe('a, b, c');
    expect(Arr.join(['a', 'b', 'c'], ', ', ' and ')).toBe('a, b and c');
    expect(Arr.join(['a', 'b'], ', ', ' and ')).toBe('a and b');
    expect(Arr.join(['a'], ', ', ' and ')).toBe('a');
    expect(Arr.join([], ', ', ' and ')).toBe('');
});

test('last', () => {
    const array = [100, 200, 300];

    // Callback is undefined and array is empty
    expect(Arr.last([], undefined)).toBe(undefined);
    expect(Arr.last([], undefined, 'foo')).toBe('foo');
    expect(Arr.last([], undefined, () => 'bar')).toBe('bar');

    // Callback is undefined and array is not empty
    expect(Arr.last(array)).toBe(300);

    // Callback is not undefined and array is not empty
    const value = Arr.last(array, (value) => value < 250);
    expect(value).toBe(200);

    // Callback is not undefined, array is not empty but no satisfied item
    const value2 = Arr.last(array, (value) => value > 300);
    const value3 = Arr.last(array, (value) => value > 300, 'bar');
    const value4 = Arr.last(
        array,
        (value) => value > 300,
        () => 'baz',
    );
    const value5 = Arr.last(array, (value) => value < 300);

    expect(value2).toBe(undefined);
    expect(value3).toBe('bar');
    expect(value4).toBe('baz');
    expect(value5).toBe(200);
});

test('map', () => {
    let data: any[] = ['taylor', 'otwell'];
    let mapped = Arr.map(data, (value: string, key) => key + '-' + value.split('').reverse().join(''));
    expect(mapped).toEqual(['0-rolyat', '1-llewto']);
    expect(data).toEqual(['taylor', 'otwell']);

    mapped = Arr.map([], (value, key) => key + '-' + value);
    expect(mapped).toEqual([]);

    data = ['taylor', null];
    mapped = Arr.map(data, (value, key) => key + '-' + value);
    expect(mapped).toEqual(['0-taylor', '1-null']);

    data = ['taylor', 'otwell'];

    mapped = Arr.map(data, mb_strtoupper as any);

    expect(mapped).toEqual(['TAYLOR', 'OTWELL']);
    expect(data).toEqual(['taylor', 'otwell']);
});

test('mapSpread', () => {
    const c = [
        [1, 'a'],
        [2, 'b'],
    ];

    let result = Arr.mapSpread(c, (number, character) => `${number}-${character}`);
    expect(result).toEqual(['1-a', '2-b']);

    result = Arr.mapSpread(c, (number, character, key) => `${number}-${character}-${key}`);
    expect(result).toEqual(['1-a-0', '2-b-1']);
});

test('mapWithKeys', () => {
    let data: any = [
        { name: 'Blastoise', type: 'Water', idx: 9 },
        { name: 'Charmander', type: 'Fire', idx: 4 },
        { name: 'Dragonair', type: 'Dragon', idx: 148 },
    ];

    data = Arr.mapWithKeys(data, (pokemon) => ({ [(pokemon as any)['name']]: (pokemon as any)['type'] }));

    expect(data).toEqual({ Blastoise: 'Water', Charmander: 'Fire', Dragonair: 'Dragon' });
});

test('only', () => {
    let array = ['Desk', 100, 10];
    array = Arr.only(array, [0, 1]);
    expect(array).toEqual(['Desk', 100]);
    expect(Arr.only(array, [5])).toEqual([]);

    // Test with array having numeric keys
    expect(Arr.only(['foo', 'bar', 'baz'], 0)).toEqual(['foo']);
    expect(Arr.only(['foo', 'bar', 'baz'], [1, 2])).toEqual(['bar', 'baz']);
    expect(Arr.only(['foo', 'bar', 'baz'], [3])).toEqual([]);

    // Test with array having numeric key and string key
    expect(Arr.only(['foo', 'baz'], 0)).toEqual(['foo']);
    expect(Arr.only(['foo', 'baz'], 1)).toEqual(['baz']);
});

test('partition', () => {
    const array = ['John', 'Jane', 'Greg'];
    const result = Arr.partition(array, (value) => str_contains(value, 'J'));

    expect(result).toEqual([['John', 'Jane'], ['Greg']]);
});

test('pluck', () => {
    const data: any[] = [[[['#foo', '#bar']]], [[['#baz']]]];

    expect(Arr.pluck(data, 0)).toEqual([[['#foo', '#bar']], [['#baz']]]);
    expect(Arr.pluck(data, '0.0')).toEqual([['#foo', '#bar'], ['#baz']]);
    expect(Arr.pluck(data, 100)).toEqual([undefined, undefined]);
    expect(Arr.pluck(data, '100.0')).toEqual([undefined, undefined]);

    let array: any[] = [[['Taylor']], [['Abigail']]];
    array = Arr.pluck(array, '0.0');
    expect(array).toEqual(['Taylor', 'Abigail']);

    array = [[['Taylor']], [['Abigail']]];
    array = Arr.pluck(array, [0, 0]);
    expect(array).toEqual(['Taylor', 'Abigail']);

    array = [
        ['taylor', 'foo'],
        ['dayle', 'bar'],
    ];
    expect(Arr.pluck(array, 0)).toEqual(['taylor', 'dayle']);

    array = [[['taylor', 'otwell']], [['dayle', 'rees']]];
    expect(Arr.pluck(array, '0.0')).toEqual(['taylor', 'dayle']);
    expect(Arr.pluck(array, [0, 0])).toEqual(['taylor', 'dayle']);

    array = [
        ['a', [['taylor', 'otwell', 'taylorotwell@gmail.com']]],
        [
            'b',
            [
                ['abigail', 'otwell'],
                ['dayle', 'rees'],
            ],
        ],
    ];
    expect(Arr.pluck(array, '1.*.0')).toEqual([['taylor'], ['abigail', 'dayle']]);
    expect(Arr.pluck(array, '1.*.2')).toEqual([['taylorotwell@gmail.com'], [undefined, undefined]]);
});

test('prepend', () => {
    let array = Arr.prepend(['one', 'two', 'three', 'four'], 'zero');
    expect(array).toEqual(['zero', 'one', 'two', 'three', 'four']);

    array = Arr.prepend([1, 2], 0, 'zero');
    expect(array).toEqual([0, 1, 2]);

    array = Arr.prepend([1, 2], 0, undefined);
    expect(array).toEqual([0, 1, 2]);

    array = Arr.prepend(['one', 'two'], null);
    expect(array).toEqual([null, 'one', 'two']);

    array = Arr.prepend([], 'zero');
    expect(array).toEqual(['zero']);

    array = Arr.prepend([''], 'zero');
    expect(array).toEqual(['zero', '']);

    array = Arr.prepend(['one', 'two'], ['zero']);
    expect(array).toEqual([['zero'], 'one', 'two']);

    array = Arr.prepend(['one', 'two'], ['zero']);
    expect(array).toEqual([['zero'], 'one', 'two']);
});

test('pull', () => {
    let array: any[] = ['Desk', 100];
    let name = Arr.pull(array, 0);
    expect(name).toBe('Desk');
    expect(array).toEqual([100]);

    // Works on first level keys
    array = ['Joe', 'Jane'];
    name = Arr.pull(array, 0);
    expect(name).toBe('Joe');
    expect(array).toEqual(['Jane']);

    // Works with nested arrays
    array = [['Joe', 'Jane']];
    name = Arr.pull(array, '0.0');
    expect(name).toBe('Joe');
    expect(array).toEqual([['Jane']]);

    // Works with int keys
    array = ['First', 'Second'];
    const first = Arr.pull(array, 0);
    expect(first).toBe('First');
    expect(array).toEqual(['Second']);
});

test('push', () => {
    let array: any[] = [];
    Arr.push(array, '0.0', 'Desk');
    expect(array[0][0]).toEqual(['Desk']);
    Arr.push(array, '0.0', 'Chair', 'Lamp');
    expect(array[0][0]).toEqual(['Desk', 'Chair', 'Lamp']);

    array = [];
    Arr.push(array, undefined, 'Chris', 'Nuno');
    expect(array).toEqual(['Chris', 'Nuno']);
    Arr.push(array, undefined, 'Taylor');
    expect(array).toEqual(['Chris', 'Nuno', 'Taylor']);

    array = [[false]];
    expect(() => Arr.push(array, '0.0', 'baz')).toThrow('Array value for key [0.0] must be an array, boolean found.');
});

test('query', () => {
    expect(Arr.query([])).toBe('');
    expect(Arr.query(['bar'])).toBe('0=bar');
    expect(Arr.query(['bar', 'baz'])).toBe('0=bar&1=baz');
    expect(Arr.query(['bar', true])).toBe('0=bar&1=1');
    expect(Arr.query(['bar', null])).toBe('0=bar');
    expect(Arr.query(['bar', ''])).toBe('0=bar&1=');
});

test('reject', () => {
    const array = [1, 2, 3, 4, 5, 6];

    // Test rejection behavior (removing even numbers)
    let result = Arr.reject(array, (value) => value % 2 === 0);

    expect(result).toEqual([1, 3, 5]);

    const assocArray = [1, 2, 3, 4];

    result = Arr.reject(assocArray, (value) => value > 2);

    expect(result).toEqual([1, 2]);
});

test('select', () => {
    const array = [
        ['Taylor', 'Developer', 1],
        ['Abigail', 'Infrastructure', 2],
    ];

    expect(Arr.select(array, [0, 2])).toEqual([
        ['Taylor', 1],
        ['Abigail', 2],
    ]);

    expect(Arr.select(array, 0)).toEqual([['Taylor'], ['Abigail']]);
    expect(Arr.select(array, 100)).toEqual([[], []]);
});

test('set', () => {
    let array: any[] = [[[100]]];
    Arr.set(array, '0.0.0', 200);
    expect(array).toEqual([[[200]]]);

    // No key is given
    array = [[[100]]];
    Arr.set(array, undefined, [300]);
    expect(array).toEqual([300]);

    array = [[[100]]];
    Arr.set(array, undefined, 300);
    expect(array).toEqual([300]);

    // The key doesn't exist at the depth
    array = ['desk'];
    Arr.set(array, '0.0.0', 200);
    expect(array).toEqual([[[200]]]);

    array = [[[100]]];
    Arr.set(array, 1, 500);
    expect(array).toEqual([[[100]], 500]);

    array = [[[100]]];
    Arr.set(array, '1.0', 350);
    expect(array).toEqual([[[100]], [350]]);

    array = [];
    Arr.set(array, '0.0.0', 200);
    expect(array).toEqual([[[200]]]);

    // Override
    array = ['table'];
    Arr.set(array, '0.0.0', 300);
    expect(array).toEqual([[[300]]]);

    array = [undefined, 'test'];
    expect(Arr.set(array, 1, 'hAz')).toEqual([undefined, 'hAz']);
});

test('sole', () => {
    expect(Arr.sole(['foo'])).toBe('foo');

    const array = [['foo'], ['bar']];

    expect(Arr.sole(array, (value) => value[0] === 'foo')).toEqual(['foo']);
    expect(() => Arr.sole(['foo'], (value) => value === 'baz')).toThrow('Item not found');
    expect(() => Arr.sole(['baz', 'foo', 'baz'], (value) => value === 'baz')).toThrow('Array has more than one item');
});

test('some', () => {
    expect(Arr.some([1, 2], (value) => typeof value === 'string')).toBe(false);
    expect(Arr.some(['foo', 2], (value) => typeof value === 'string')).toBe(true);
    expect(Arr.some(['foo', 'bar'], (value) => typeof value === 'string')).toBe(true);
});

test('sortRecursive', () => {
    const array = [
        [2, 1, 0],
        ['c', 'b', 'a'],
        [[1], [0]],
        [
            ['joe', 'joe@example.com', [2, 1, 0]],
            ['jane', 25],
        ],
    ];

    const expected = [
        [[0], [1]],
        [0, 1, 2],
        [
            [[0, 1, 2], 'joe', 'joe@example.com'],
            [25, 'jane'],
        ],
        ['a', 'b', 'c'],
    ];

    expect(Arr.sortRecursive(array)).toEqual(expected);
});

test('sortRecursiveDesc', () => {
    const array = [[], [[[[2, 3, 1]], [4, 5, 6]]], [1, 'b', 3, 'd'], ['e', 'c', 'b', 'a', 'd']];
    const expected = [['e', 'd', 'c', 'b', 'a'], [[[6, 5, 4], [[3, 2, 1]]]], [1, 'b', 3, 'd'], []];

    expect(Arr.sortRecursiveDesc(array)).toEqual(expected);
});

test('string', () => {
    const testArray = ['foo bar', 1234];

    // Test string values are returned as strings
    expect(Arr.string(testArray, 0)).toBe('foo bar');

    // Test that default string values are returned for missing keys
    expect(Arr.string(testArray, 2, 'default')).toBe('default');

    // Test that an exception is raised if the value is not a string
    expect(() => Arr.string(testArray, 1)).toThrow('Array value for key [1] must be a string, number found.');
});

test('take', () => {
    const array = [1, 2, 3, 4, 5, 6];

    // Test with a positive limit, should return the first 'limit' elements.
    expect(Arr.take(array, 3)).toEqual([1, 2, 3]);

    // Test with a negative limit, should return the last 'abs(limit)' elements.
    expect(Arr.take(array, -3)).toEqual([4, 5, 6]);

    // Test with zero limit, should return an empty array.
    expect(Arr.take(array, 0)).toEqual([]);

    // Test with a limit greater than the array size, should return the entire array.
    expect(Arr.take(array, 10)).toEqual([1, 2, 3, 4, 5, 6]);

    // Test with a negative limit greater than the array size, should return the entire array.
    expect(Arr.take(array, -10)).toEqual([1, 2, 3, 4, 5, 6]);
});

test('toCssClasses', () => {
    let classes = Arr.toCssClasses(['font-bold', 'mt-4']);

    expect(classes).toBe('font-bold mt-4');

    classes = Arr.toCssClasses(['font-bold', 'mt-4', 'ml-2']);

    expect(classes).toBe('font-bold mt-4 ml-2');
});

test('toCssStyles', () => {
    let styles = Arr.toCssStyles(['font-weight: bold', 'margin-top: 4px;']);

    expect(styles).toBe('font-weight: bold; margin-top: 4px;');

    styles = Arr.toCssStyles(['font-weight: bold;', 'margin-top: 4px', 'margin-left: 2px;']);

    expect(styles).toBe('font-weight: bold; margin-top: 4px; margin-left: 2px;');
});

test('where', () => {
    let array = [100, '200', 300, '400', 500];

    array = Arr.where(array, (value) => typeof value === 'string');

    expect(array).toEqual(['200', '400']);
});

test('whereNotUndefined', () => {
    let array = [100, undefined, undefined, '400', 500];

    array = Arr.whereNotUndefined(array);

    expect(array).toEqual([100, '400', 500]);
});

test('wrap', () => {
    const string = 'a';
    const array = ['a'];
    const object: any = { value: 'a' };

    expect(Arr.wrap(string)).toEqual(['a']);
    expect(Arr.wrap(array)).toEqual(array);
    expect(Arr.wrap(object)).toEqual([object]);
    expect(Arr.wrap(undefined)).toEqual([]);
    expect(Arr.wrap([undefined])).toEqual([undefined]);
    expect(Arr.wrap([undefined, undefined])).toEqual([undefined, undefined]);
    expect(Arr.wrap('')).toEqual(['']);
    expect(Arr.wrap([''])).toEqual(['']);
    expect(Arr.wrap(false)).toEqual([false]);
    expect(Arr.wrap([false])).toEqual([false]);
    expect(Arr.wrap(0)).toEqual([0]);
});
