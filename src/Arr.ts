// prettier-ignore
import {
    abs, array_all, array_any, array_filter, array_find_key, array_first, array_flip, array_intersect_key, array_keys, array_last, array_map, array_merge, array_pop, array_push, array_reverse, array_shift, array_slice, array_unshift, array_values, count, empty, explode, http_build_query, implode, isset, PHP_QUERY_RFC3986, rsort, sort, SORT_FLAG_CASE, SORT_NATURAL, SORT_NUMERIC, SORT_REGULAR, SORT_STRING, str_contains,
    unset
} from '@balboacodes/php-utils';
import { data_get, value } from './helpers';
import { Str } from '@balboacodes/stringable';

export class Arr {
    /**
     * Determine whether the given value is array accessible.
     */
    public static accessible(value: any): boolean {
        return Array.isArray(value) || (typeof value === 'object' && value !== null);
    }

    /**
     * Add an element to an array using "dot" notation if it doesn't exist.
     */
    public static add<T>(array: T[], key: number | string, value: any): T[];
    public static add<T>(array: Record<string, T>, key: number | string, value: any): Record<string, T>;
    public static add<T>(array: T[] | Record<string, T>, key: number | string, value: any): T[] | Record<string, T> {
        if (Arr.get(array, key) === undefined) {
            Arr.set(array, key, value);
        }

        return array;
    }

    /**
     * Get an array item from an array using "dot" notation.
     *
     * @throws {TypeError} if value at key is not an array.
     */
    public static array<T>(array: T[] | Record<string, T>, key?: number | string, defaultValue?: any): any[] {
        const value = Arr.get(array, key, defaultValue);

        if (!Array.isArray(value)) {
            throw new TypeError(`Array value for key [${key}] must be an array, ${typeof value} found.`);
        }

        return value;
    }

    /**
     * Get a boolean item from an array using "dot" notation.
     *
     * @throws {TypeError} if value at key is not a boolean.
     */
    public static boolean<T>(array: T[] | Record<string, T>, key?: number | string, defaultValue?: boolean): boolean {
        const value = Arr.get(array, key, defaultValue);

        if (typeof value !== 'boolean') {
            throw new TypeError(`Array value for key [${key}] must be a boolean, ${typeof value} found.`);
        }

        return value;
    }

    /**
     * Collapse an array of arrays into a single array.
     */
    public static collapse<T>(array: T[]): T[];
    public static collapse<T>(array: Record<string, T>): Record<string, T>;
    public static collapse<T>(array: T[] | Record<string, T>): T[] | Record<string, T> {
        const results = Array.isArray(array) ? [] : {};
        let key = 0;

        for (const values of Object.values(array)) {
            if (Arr.accessible(values)) {
                (results as any)[key] = values;
                key++;
            }
        }

        return array_merge(Array.isArray(results) ? [] : {}, ...(results as any));
    }

    /**
     * Cross join the given arrays, returning all possible permutations.
     */
    public static crossJoin(...arrays: (any[] | Record<string, any>)[]): any[][] {
        let results: any[][] = [[]];

        arrays.forEach((array, index) => {
            let append = [];

            for (let product of results) {
                for (let item of Object.values(array)) {
                    const p = product.slice();
                    p[index] = item;

                    append.push(p);
                }
            }

            results = append;
        });

        return results;
    }

    /**
     * Divide an array into two arrays. One with keys and the other with values.
     */
    public static divide<T>(array: T[]): [number[], T[]];
    public static divide<T>(array: Record<string, T>): [string[], T[]];
    public static divide<T>(array: T[] | Record<string, T>): [(number | string)[], T[]] {
        return [array_keys(array as any), array_values(array)];
    }

    /**
     * Determine if all items pass the given truth test.
     */
    public static every<T>(
        array: T[] | Record<string, T>,
        callback: (value: T, key: number | string) => boolean,
    ): boolean {
        return array_all(array, callback);
    }

    /**
     * Get all of the given array except for a specified array of keys.
     */
    public static except<T>(array: T[], keys: (number | string)[] | number | string): T[];
    public static except<T>(array: Record<string, T>, keys: (number | string)[] | number | string): Record<string, T>;
    public static except<T>(
        array: T[] | Record<string, T>,
        keys: (number | string)[] | number | string,
    ): T[] | Record<string, T> {
        Arr.forget(array, keys);

        return array;
    }

    /**
     * Determine if the given key exists in the provided array.
     */
    public static exists<T>(array: T[] | Record<string, T>, key: number | string | null): boolean {
        if (key === null) {
            key = String(key);
        }

        return key in array;
    }

    /**
     * Return the first element in an array passing a given truth test.
     */
    public static first<TValue, TFirstDefault>(
        array: TValue[] | Record<string, TValue>,
        callback?: (value: TValue, key: number | string) => boolean,
        defaultValue?: TFirstDefault | (() => TFirstDefault),
    ): TValue | TFirstDefault | undefined {
        if (callback === undefined) {
            if (empty(array)) {
                return value(defaultValue);
            }

            return array_first(array) as any;
        }

        const key = array_find_key(array as any, callback);

        return key !== null ? (array as any)[key] : value(defaultValue);
    }

    /**
     * Flatten a multi-dimensional array into a single level.
     */
    public static flatten<T>(array: T[], depth?: number): T[];
    public static flatten<T>(array: Record<string, T>, depth?: number): Record<string, T>;
    public static flatten<T>(
        array: T[] | Record<string, T>,
        depth: number = Number.MAX_SAFE_INTEGER,
    ): T[] | Record<string, T> {
        const result: T[] | Record<string, T> = Array.isArray(array) ? [] : {};
        let key = 0;

        for (let item of Object.values(array)) {
            if (Arr.accessible(item)) {
                const values = depth === 1 ? array_values(item as any) : Arr.flatten(item as any, depth - 1);

                for (const value of values) {
                    (result as any)[key] = value;
                    key++;
                }
            } else {
                (result as any)[key] = item;
                key++;
            }
        }

        return result;
    }

    /**
     * Remove one or many array items from a given array using "dot" notation.
     */
    public static forget<T>(array: T[] | Record<string, T>, keys: (number | string)[] | number | string): void {
        const original = Array.isArray(array) ? array.slice() : structuredClone(array);
        keys = Array.isArray(keys) ? keys : [keys];

        if (count(keys) === 0) {
            return;
        }

        keys: for (const key of keys) {
            // if the exact key exists in the top-level, remove it
            if (Arr.exists(array, key) && !str_contains(String(key), '.')) {
                unset(array, key);

                continue;
            }

            const parts = explode('.', String(key));

            // clean up before each pass
            array = original;

            while (count(parts) > 1) {
                const part = array_shift(parts) as string;

                if (isset((array as any)[part]) && Arr.accessible((array as any)[part])) {
                    array = (array as any)[part];
                } else {
                    continue keys;
                }
            }

            const shift = array_shift(parts);

            if (shift) {
                unset(array, shift);
            }
        }
    }

    /**
     * Get the underlying array of items from the given argument.
     *
     * @throws {TypeError} if array cannot be created from items.
     */
    public static from(items: any): any[] {
        try {
            if (Arr.accessible(items)) {
                return Array.from(Object.values(items));
            }

            return Array.from(items);
        } catch {
            throw new TypeError('Items cannot be represented by a scalar value.');
        }
    }

    /**
     * Get an item from an array using "dot" notation.
     */
    public static get<T>(array: T[] | Record<string, T>, key?: number | string, defaultValue?: any): any {
        if (!Arr.accessible(array)) {
            return value(defaultValue);
        }

        if (key === undefined) {
            return array;
        }

        if (Arr.exists(array, key)) {
            return (array as any)[key];
        }

        if (!str_contains(String(key), '.')) {
            return value(defaultValue);
        }

        for (const segment of explode('.', String(key))) {
            if (Arr.accessible(array) && Arr.exists(array, segment)) {
                array = (array as any)[segment];
            } else {
                return value(defaultValue);
            }
        }

        return array;
    }

    /**
     * Check if an item or items exist in an array using "dot" notation.
     */
    public static has<T>(array: T[] | Record<string, T>, keys: (number | string)[] | number | string): boolean {
        keys = Array.isArray(keys) ? keys : [keys];

        if (array.length === 0 || keys.length === 0) {
            return false;
        }

        for (const key of keys) {
            let subKeyArray = array;

            if (Arr.exists(array, key)) {
                continue;
            }

            for (const segment of explode('.', String(key))) {
                if (Arr.accessible(subKeyArray) && Arr.exists(subKeyArray, segment)) {
                    subKeyArray = (subKeyArray as any)[segment];
                } else {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Determine if all keys exist in an array using "dot" notation.
     */
    public static hasAll<T>(array: T[] | Record<string, T>, keys: (number | string)[] | number | string): boolean {
        keys = Array.isArray(keys) ? keys : [keys];

        if (array.length === 0 || keys.length === 0) {
            return false;
        }

        for (const key of keys) {
            if (!Arr.has(array, key)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Determine if any of the keys exist in an array using "dot" notation.
     */
    public static hasAny<T>(array: T[] | Record<string, T>, keys: (number | string)[] | number | string): boolean {
        keys = Array.isArray(keys) ? keys : [keys];

        if (array.length === 0 || keys.length === 0) {
            return false;
        }

        for (const key of keys) {
            if (Arr.has(array, key)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get an integer item from an array using "dot" notation.
     *
     * @throws {TypeError} if value at key is not an integer.
     */
    public static integer<T>(array: T[] | Record<string, T>, key?: number | string, defaultValue?: number): number {
        const value = Arr.get(array, key, defaultValue);

        if (!Number.isInteger(value)) {
            throw new TypeError(`Array value for key [${key}] must be an integer, ${typeof value} found.`);
        }

        return value;
    }

    /**
     * Join all items using a string. The final items can use a separate glue string.
     */
    public static join<T>(array: T[] | Record<string, T>, glue: string, finalGlue: string = ''): T | string {
        if (finalGlue === '') {
            return implode(glue, array);
        }

        if (count(array) === 0) {
            return '';
        }

        if (count(array) === 1) {
            return array_last(array) as T;
        }

        const finalItem = array_pop(array);

        return implode(glue, array) + finalGlue + (finalItem ?? '');
    }

    /**
     * Return the last element in an array passing a given truth test.
     */
    public static last<TValue, TLastDefault>(
        array: TValue[] | Record<string, TValue>,
        callback?: (value: TValue, key: number | string) => boolean,
        defaultValue?: TLastDefault | (() => TLastDefault),
    ): TValue | TLastDefault | undefined {
        if (callback === undefined) {
            return empty(array) ? value(defaultValue) : (array_last(array) as any);
        }

        return Arr.first(array_reverse(array as any) as any, callback, defaultValue);
    }

    /**
     * Run a map over each of the items in the array.
     */
    public static map<T>(
        array: T[] | Record<string, T>,
        callback: (value: T, key?: number | string) => any,
    ): any[] | Record<string, any> {
        const keys = array_keys(array as any);
        let items: any[] | Record<string, any>;

        try {
            items = array_map(callback, array as any, keys);
        } catch {
            items = array_map(callback, array as any);
        }

        return items;
    }

    /**
     * Run a map over each nested chunk of items.
     */
    public static mapSpread<T, TValue>(
        array: T[] | Record<string, T>,
        callback: (...chunk: any[]) => TValue,
    ): TValue[] | Record<string, TValue> {
        return Arr.map(array as any, function (chunk: any[] | Record<string, any>, key?: number | string) {
            if (Array.isArray(chunk)) {
                chunk.push(key);

                return callback(...chunk);
            }

            return callback(chunk, key);
        });
    }

    /**
     * Run an associative map over each of the items.
     *
     * The callback should return an object with a single key: value pair.
     */
    public static mapWithKeys<TValue, TMapWithKeysValue>(
        array: TValue[] | Record<string, TValue>,
        callback: (value: TValue, key?: number | string) => Record<string, TMapWithKeysValue>,
    ): Record<string, any> {
        const result: Record<string, any> = {};

        for (const [key, value] of Object.entries(array)) {
            const assoc = callback(value, key);

            for (const [mapKey, mapValue] of Object.entries(assoc)) {
                result[mapKey] = mapValue;
            }
        }

        return result;
    }

    /**
     * Get a subset of the items from the given array.
     */
    public static only<T>(
        array: T[] | Record<string, T>,
        keys: (number | string)[] | number | string,
    ): T[] | Record<string, T> {
        return array_intersect_key(array as any, array_flip(Array.isArray(keys) ? keys : [keys])) as any;
    }

    /**
     * Partition the array into two arrays using the given callback.
     */
    public static partition<TValue>(
        array: TValue[] | Record<string, TValue>,
        callback: (value: TValue, key: number | string) => boolean,
    ): (TValue[] | Record<string, TValue>)[] {
        const passed: TValue[] | Record<string, TValue> = Array.isArray(array) ? [] : {};
        const failed: TValue[] | Record<string, TValue> = Array.isArray(array) ? [] : {};

        Object.entries(array).forEach(([key, item]) => {
            const passedLength = Object.values(passed).length;
            const failedLength = Object.values(failed).length;

            if (callback(item, key)) {
                (passed as any)[passedLength === 0 ? 0 : passedLength] = item;
            } else {
                (failed as any)[failedLength === 0 ? 0 : failedLength] = item;
            }
        });

        return [passed, failed];
    }

    /**
     * Pluck an array of values from an array.
     */
    public static pluck<T>(
        array: T[] | Record<string, T>,
        valueToPluck?: (number | string)[] | number | string | ((item: any) => any),
        key?: (number | string)[] | number | string | ((item: any) => number),
    ): T[] | Record<string, T> {
        const results: T[] | Record<string, T> = key === undefined ? [] : {};
        [valueToPluck, key] = Arr.explodePluckParameters(valueToPluck, key);

        for (const item of Object.values(array)) {
            const itemValue =
                typeof valueToPluck === 'function' ? valueToPluck(item) : data_get(item as any, valueToPluck);

            // If the key is undefined, we will just append the value to the result and keep
            // looping. Otherwise we will key the result using the value of the key we
            // received from the developer. Then we'll return the final result form.
            if (Array.isArray(results)) {
                results.push(itemValue);
            } else {
                const itemKey = typeof key === 'function' ? key(item) : data_get(item as any, key);

                results[itemKey] = itemValue;
            }
        }

        return results;
    }

    /**
     * Push an item onto the beginning of an array.
     *
     * @param key is not used because it only accepts an array as the first parameter.
     */
    public static prepend<T>(array: T[], value: any, _key?: number | string): any[] {
        array_unshift(array, value);

        return array;
    }

    /**
     * Get a value from the array, and remove it.
     */
    public static pull<T>(array: T[] | Record<string, T>, key: number | string, defaultValue?: any): any {
        const value = Arr.get(array, key, defaultValue);

        Arr.forget(array, key);

        return value;
    }

    /**
     * Push an item into an array using "dot" notation.
     */
    public static push<T>(
        array: T[] | Record<string, T>,
        key?: number | string,
        ...values: any[]
    ): any[] | Record<string, any> {
        const target = Arr.array(array, key, []).slice();

        array_push(target, ...values);

        return Arr.set(array, key, target);
    }

    /**
     * Convert the array into a query string.
     */
    public static query<T>(array: T[] | Record<string, T>): string {
        return http_build_query(array, '', '&', PHP_QUERY_RFC3986);
    }

    /**
     * Filter the array using the negation of the given callback.
     */
    public static reject<T>(array: T[] | Record<string, T>, callback: (value: T) => boolean): T[] | Record<string, T> {
        return Arr.where(array, (value: T) => !callback(value));
    }

    /**
     * Select an array of values from an array.
     */
    public static select<T>(
        array: T[] | Record<string, T>,
        keys: (number | string)[] | number | string,
    ): T[] | Record<string, T> {
        keys = Arr.wrap(keys);

        return Arr.map(array, (item) => {
            let result: any[] | Record<string, any> = Array.isArray(array) ? [] : {};

            for (const key of keys) {
                if (Arr.accessible(item) && Arr.exists(item as any, key)) {
                    (result as any)[key] = (item as any)[key];
                    result = Arr.whereNotUndefined(result);
                }
            }

            return result;
        });
    }

    /**
     * Set an array item to a given value using "dot" notation.
     *
     * If no key is given to the method, the entire array will be replaced.
     */
    public static set<T>(
        array: T[] | Record<string, T>,
        key?: number | string,
        value?: any,
    ): any[] | Record<string, any> {
        if (key === undefined) {
            if (Array.isArray(array)) {
                array.length = 0;

                if (Array.isArray(value)) {
                    array.push(...value);
                } else {
                    array.push(value);
                }

                return array;
            } else {
                Object.keys(array).forEach((key) => delete array[key]);

                array[0] = value;
            }
        }

        const keys = explode('.', String(key));
        // Allows us to modify array in place like PHP does with &array. Setting a key on current also updates array.
        // Setting current to a new value does not.
        let current = array;

        for (let i = 0; i < keys.length - 1; i++) {
            if (count(keys) === 1) {
                break;
            }

            const key = keys[i];

            // If the key doesn't exist at this depth, we will just create an empty array
            // to hold the next value, allowing us to create the arrays to hold final
            // values at the correct depth. Then we'll keep digging into the array.
            if (!isset((current as any)[key]) || !Array.isArray((current as any)[key])) {
                (current as any)[key] = [];
            }

            current = (current as any)[key];
        }

        (current as any)[keys[keys.length - 1]] = value;

        return array;
    }

    /**
     * Get the first item in the array, but only if exactly one item exists. Otherwise, throw an exception.
     *
     * @throws {Error} if array is empty.
     * @throws {Error} if array has more than one item.
     */
    public static sole<T>(array: T[] | Record<string, T>, callback?: (value: any) => boolean): any {
        if (callback) {
            array = Arr.where(array, callback);
        }

        const length = count(array);

        if (length === 0) {
            throw new Error('Item not found');
        }

        if (length > 1) {
            throw new Error('Array has more than one item');
        }

        return Arr.first(array);
    }

    /**
     * Determine if some items pass the given truth test.
     */
    public static some<T>(
        array: T[] | Record<string, T>,
        callback: (value: any, key: number | string) => boolean,
    ): boolean {
        return array_any(array, callback);
    }

    /**
     * Recursively sort an array by keys and values.
     */
    public static sortRecursive<T>(
        array: T[] | Record<string, T>,
        options: (
            | typeof SORT_REGULAR
            | typeof SORT_NUMERIC
            | typeof SORT_STRING
            | typeof SORT_NATURAL
            | typeof SORT_FLAG_CASE
        )[] = [SORT_REGULAR],
        descending: boolean = false,
    ): T[] | Record<string, T> {
        for (let value of Object.values(array)) {
            if (Array.isArray(value)) {
                value = Arr.sortRecursive(value, options, descending) as any;
            }
        }

        descending ? rsort(array as any, options) : sort(array as any, options);

        return array;
    }

    /**
     * Recursively sort an array by keys and values in descending order.
     */
    public static sortRecursiveDesc<T>(
        array: T[] | Record<string, T>,
        options: (
            | typeof SORT_REGULAR
            | typeof SORT_NUMERIC
            | typeof SORT_STRING
            | typeof SORT_NATURAL
            | typeof SORT_FLAG_CASE
        )[] = [SORT_REGULAR],
    ): T[] | Record<string, T> {
        return Arr.sortRecursive(array, options, true);
    }

    /**
     * Get a string item from an array using "dot" notation.
     *
     * @throws {TypeError} if array value at key is not a string.
     */
    public static string<T>(array: T[] | Record<string, T>, key?: number | string, defaultValue?: string): string {
        const value = Arr.get(array, key, defaultValue);

        if (typeof value !== 'string') {
            throw new TypeError(`Array value for key [${key}] must be a string, ${typeof value} found.`);
        }

        return value;
    }

    /**
     * Take the first or last {limit} items from an array.
     */
    public static take<T>(array: T[] | Record<string, T>, limit: number): T[] | Record<string, T> {
        if (limit < 0) {
            return array_slice(array as any, limit, abs(limit));
        }

        return array_slice(array as any, 0, limit);
    }

    /**
     * Compile classes from an array into a CSS class list.
     */
    public static toCssClasses(array: any[] | string): string {
        const classList = Arr.wrap(array);

        return implode(' ', classList);
    }

    /**
     * Compile styles from an array into a style list.
     */
    public static toCssStyles(array: any[] | string): string {
        const styleList = Arr.wrap(array);
        const styles = [];

        for (const style of styleList) {
            styles.push(Str.finish(style, ';'));
        }

        return implode(' ', styles);
    }

    /**
     * Filter the array using the given callback.
     */
    public static where<T>(array: T[] | Record<string, T>, callback: (value: any) => boolean): T[] | Record<string, T> {
        return array_filter(array as any, callback);
    }

    /**
     * Filter items where the value is not undefined.
     */
    public static whereNotUndefined<T>(array: T[] | Record<string, T>): T[] | Record<string, T> {
        return Arr.where(array, (value) => value !== undefined);
    }

    /**
     * If the given value is not an array and not undefined, wrap it in one.
     */
    public static wrap(value: any): any[] {
        if (value === undefined) {
            return [];
        }

        return Array.isArray(value) ? value : [value];
    }

    /**
     * Explode the "value" and "key" arguments passed to "pluck".
     */
    protected static explodePluckParameters(
        value?: (number | string)[] | number | string | ((item: any) => any),
        key?: (number | string)[] | number | string | ((item: any) => number),
    ): [
        (number | string)[] | number | ((item: any) => any) | undefined,
        (number | string)[] | ((item: any) => any) | undefined,
    ] {
        value = typeof value === 'string' ? explode('.', value) : value;
        key = key === undefined || Array.isArray(key) || typeof key === 'function' ? key : explode('.', String(key));

        return [value, key];
    }
}
