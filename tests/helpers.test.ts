import { expect, test } from 'vitest';
import { data_fill, data_forget, data_get, data_set, head, last, value } from '../src/helpers';

test('data_fill', () => {
    let data: any[] = ['bar'];

    expect(data_fill(data, 1, 'boom')).toEqual(['bar', 'boom']);
    expect(data_fill(data, 1, 'noop')).toEqual(['bar', 'boom']);
    expect(data_fill(data, '0.*', 'noop')).toEqual([[], 'boom']);
    expect(data_fill(data, '0.0', 'kaboom')).toEqual([['kaboom'], 'boom']);

    data = ['bar'];

    expect(data_fill(data, '0.*.0', 'noop')).toEqual([[]]);
    expect(data_fill(data, 1, [['original'], []])).toEqual([[], [['original'], []]]);
    expect(data_fill(data, '1.*.0', 'boom')).toEqual([[], [['original'], ['boom']]]);

    expect(data_fill(data, '1.*', 'noop')).toEqual([[], [['original'], ['boom']]]);

    data = [[[[['First'], []]], [[[], ['Second']]]]];

    expect(data_fill(data, '0.*.0.*.0', 'Filled')).toEqual([[[[['First'], ['Filled']]], [[['Filled'], ['Second']]]]]);
});

test('data_forget', () => {
    let data: any[] = ['bar', 'world'];

    expect(data_forget(data, 0)).toEqual(['world']);

    data = ['bar', 'world'];

    expect(data_forget(data, 2)).toEqual(['bar', 'world']);

    data = [[['hello', ['five']]]];

    expect(data_forget(data, '0.0.0')).toEqual([[[['five']]]]);

    data = [
        [
            'Foo',
            [
                ['foo', 'First'],
                ['bar', 'Second'],
            ],
        ],
    ];

    expect(data_forget(data, '0.1.*.1')).toEqual([['Foo', [['foo'], ['bar']]]]);

    data = [
        [
            [
                [
                    ['First', 'foo'],
                    ['Second', 'bar'],
                ],
            ],
            [
                [
                    ['Third', 'hello'],
                    ['Fourth', 'world'],
                ],
            ],
        ],
    ];

    data_forget(data, '0.*.0.*.0');

    expect(data).toEqual([[[[['foo'], ['bar']]], [[['hello'], ['world']]]]]);
});

test('data_get', () => {
    const object = [[['Taylor', 'Otwell']]];
    expect(data_get(object, '0.0.0')).toBe('Taylor');

    let array: any[] = [[[['Taylor']]]];
    expect(data_get(array, '0.0.0.0')).toBe('Taylor');
    expect(data_get(array, '0.0.3')).toBe(undefined);
    expect(data_get(array, '0.0.3', 'Not found')).toBe('Not found');
    expect(data_get(array, '0.0.3', () => 'Not found')).toBe('Not found');

    const dottedArray = [['Taylor', undefined]];
    expect(data_get(dottedArray, [0, 0])).toBe('Taylor');
    expect(data_get(dottedArray, [0, 1])).toBe(undefined);
    expect(data_get(dottedArray, [0, 100], 'Not found')).toBe('Not found');

    array = [['taylor', 'taylorotwell@gmail.com'], ['abigail'], ['dayle']];
    expect(data_get(array, '*.0')).toEqual(['taylor', 'abigail', 'dayle']);
    expect(data_get(array, '*.1', 'irrelevant')).toEqual(['taylorotwell@gmail.com', undefined, undefined]);

    array = [
        [
            ['taylor', 'otwell', 'taylorotwell@gmail.com'],
            ['abigail', 'otwell'],
            ['dayle', 'rees'],
        ],
        null,
    ];
    expect(data_get(array, '0.*.0')).toEqual(['taylor', 'abigail', 'dayle']);
    expect(data_get(array, '0.*.2', 'irrelevant')).toEqual(['taylorotwell@gmail.com', undefined, undefined]);
    expect(data_get(array, '1.*.1', 'not found')).toBe('not found');
    expect(data_get(array, '1.*.1')).toBe(undefined);

    array = [
        [
            [
                [
                    ['taylor', 4],
                    ['abigail', 3],
                ],
            ],
            [[['abigail', 2], ['dayle']]],
            [[['dayle'], ['taylor', 1]]],
        ],
    ];
    expect(data_get(array, '0.*.0.*.0')).toEqual(['taylor', 'abigail', 'abigail', 'dayle', 'dayle', 'taylor']);
    expect(data_get(array, '0.*.0.*.1')).toEqual([4, 3, 2, undefined, undefined, 1]);
    expect(data_get(array, '0.*.100.*.100', 'irrelevant')).toEqual([]);
    expect(data_get(array, '0.*.100.*.100')).toEqual([]);

    array = [
        [
            [
                [
                    ['LHR', '9:00', 'IST', '15:00'],
                    ['IST', '16:00', 'PKX', '20:00'],
                ],
            ],
            [
                [
                    ['LGW', '8:00', 'SAW', '14:00'],
                    ['SAW', '15:00', 'PEK', '19:00'],
                ],
            ],
        ],
        [],
    ];
    expect(data_get(array, '0.0.0.{first}.0')).toBe('LHR');
    expect(data_get(array, '0.0.0.{last}.2')).toBe('PKX');
    expect(data_get(array, '0.{first}.0.{first}.0')).toBe('LHR');
    expect(data_get(array, '0.{last}.0.{last}.2')).toBe('PEK');
    expect(data_get(array, '0.{first}.0.{last}.2')).toBe('PKX');
    expect(data_get(array, '0.{last}.0.{first}.0')).toBe('LGW');
    expect(data_get(array, '0.{first}.0.*.0')).toEqual(['LHR', 'IST']);
    expect(data_get(array, '0.{last}.0.*.2')).toEqual(['SAW', 'PEK']);
    expect(data_get(array, '0.*.0.{first}.0')).toEqual(['LHR', 'LGW']);
    expect(data_get(array, '0.*.0.{last}.2')).toEqual(['PKX', 'PEK']);
    expect(data_get(array, '100.{first}', 'Not found')).toBe('Not found');
    expect(data_get(array, '100.{last}', 'Not found')).toBe('Not found');

    array = [
        ['second', 'last', 'first'],
        ['first', 'second', 'last'],
    ];
    expect(data_get(array, '0.0')).toBe('second');
    expect(data_get(array, '0.{first}')).toBe('second');
    expect(data_get(array, '0.{last}')).toBe('first');
    expect(data_get(array, '1.{first}')).toBe('first');
    expect(data_get(array, '1.{last}')).toBe('last');

    array = [[['dollar'], ['asterisk'], ['caret']]];
    expect(data_get(array, '0.2.0')).toBe('caret');
    expect(data_get(array, '0.1.0')).toBe('asterisk');
    expect(data_get(array, '0.0.0')).toBe('dollar');

    let data: any[] = ['bar'];
    expect(data_get(data, '*')).toEqual(['bar']);

    data = ['bar'];
    expect(data_get(data, undefined)).toEqual(['bar']);
    expect(data_get(data, undefined, '42')).toEqual(['bar']);
});

test('data_set', () => {
    let data: any[] = ['bar'];
    expect(data_set(data, 1, 'boom')).toEqual(['bar', 'boom']);
    expect(data_set(data, 1, 'kaboom')).toEqual(['bar', 'kaboom']);
    expect(data_set(data, '0.*', 'noop')).toEqual([[], 'kaboom']);
    expect(data_set(data, '0.0', 'boom')).toEqual([['boom'], 'kaboom']);
    expect(data_set(data, '1.0', 'boom')).toEqual([['boom'], ['boom']]);
    expect(data_set(data, '1.0.0.0', 'boom')).toEqual([['boom'], [[['boom']]]]);

    data = ['bar'];
    expect(data_set(data, '0.*.0', 'noop')).toEqual([[]]);
    expect(data_set(data, 1, [['original'], []])).toEqual([[], [['original'], []]]);
    expect(data_set(data, '1.*.0', 'boom')).toEqual([[], [['boom'], ['boom']]]);
    expect(data_set(data, '1.*', 'overwritten')).toEqual([[], ['overwritten', 'overwritten']]);

    data = [[[[['First'], []]], [[[], ['Second']]]]];
    data_set(data, '0.*.0.*.0', 'Filled');
    expect(data).toEqual([[[[['Filled'], ['Filled']]], [[['Filled'], ['Filled']]]]]);
});

test('head', () => {
    const array = ['a', 'b', 'c'];
    expect(head(array)).toBe('a');
});

test('last', () => {
    const array = ['a', 'b', 'c'];
    expect(last(array)).toBe('c');
});

test('value', () => {
    const callable = (args: any) => args;
    expect(value(callable, 'foo')).toBe('foo');
    expect(value('foo')).toBe('foo');
    expect(value(() => 'foo')).toBe('foo');
    expect(value((arg) => arg, 'foo')).toBe('foo');
});
