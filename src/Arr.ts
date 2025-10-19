// prettier-ignore
import {
    abs, array_all, array_any, array_combine, array_filter, array_find_key, array_first, array_flip, array_intersect_key, array_keys, array_last, array_map, array_merge, array_pop, array_push, array_reverse, array_shift, array_slice, array_unshift, array_values, count, empty, explode, http_build_query, implode, isset, PHP_QUERY_RFC3986, rsort, sort, SORT_FLAG_CASE, SORT_NATURAL, SORT_NUMERIC, SORT_REGULAR, SORT_STRING, str_contains,
    unset
} from '@balboacodes/php-utils';
import { data_get, value } from './helpers';
import { Str } from '@balboacodes/stringable';

export class Arr {
    /**
     * Determine whether the given value is array accessible.
     */
    public static accessible(value: any): boolean {
        return Array.isArray(value);
    }

    /**
     * Add an element to an array using "dot" notation if it doesn't exist.
     */
    public static add(array: any[], key: string | number, value: any): any[] {
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
    public static array(array: any[], key?: string | number, defaultValue?: any[]): any[] {
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
    public static boolean(array: any[], key?: string | number, defaultValue?: boolean): boolean {
        const value = Arr.get(array, key, defaultValue);

        if (typeof value !== 'boolean') {
            throw new TypeError(`Array value for key [${key}] must be a boolean, ${typeof value} found.`);
        }

        return value;
    }

    /**
     * Collapse an array of arrays into a single array.
     */
    public static collapse(array: any[]): any[] {
        const results = [];

        for (const values of array) {
            if (Array.isArray(values)) {
                results.push(values);
            }
        }

        return Object.values(array_merge([], ...results));
    }

    /**
     * Cross join the given arrays, returning all possible permutations.
     */
    public static crossJoin(...arrays: any[][]): any[][] {
        let results: any[][] = [[]];

        arrays.forEach((array, index) => {
            let append = [];

            for (let product of results) {
                for (let item of array) {
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
    public static divide(array: any[]): any[] {
        return [array_keys(array), array_values(array)];
    }

    /**
     * Determine if all items pass the given truth test.
     */
    public static every(array: any[], callback: (value: any, key: string | number) => boolean): boolean {
        return array_all(array, callback);
    }

    /**
     * Get all of the given array except for a specified array of keys.
     */
    public static except(array: any[], keys: (string | number)[] | string | number): any[] {
        Arr.forget(array, keys);

        return array;
    }

    /**
     * Determine if the given key exists in the provided array.
     */
    public static exists(array: any[], key: number): boolean {
        return key in array;
    }

    /**
     * Return the first element in an array passing a given truth test.
     */
    public static first<TValue, TFirstDefault>(
        array: TValue[],
        callback?: (value: TValue, key: string | number) => boolean,
        defaultValue?: TFirstDefault | (() => TFirstDefault),
    ): TValue | TFirstDefault | undefined {
        if (callback === undefined) {
            if (empty(array)) {
                return value(defaultValue);
            }

            return array_first(array) as any;
        }

        const key = array_find_key(array, callback);

        return key !== null ? array[Number(key)] : value(defaultValue);
    }

    /**
     * Flatten a multi-dimensional array into a single level.
     */
    public static flatten(array: any[], depth: number = Number.MAX_SAFE_INTEGER): any[] {
        const result = [];

        for (let item of array) {
            if (!Array.isArray(item)) {
                result.push(item);
            } else {
                const values = depth === 1 ? array_values(item) : Arr.flatten(item, depth - 1);

                for (const value of values) {
                    result.push(value);
                }
            }
        }

        return result;
    }

    /**
     * Remove one or many array items from a given array using "dot" notation.
     */
    public static forget(array: any[], keys: (string | number)[] | string | number): void {
        const original = array.slice();
        keys = Array.isArray(keys) ? keys : [keys];

        if (count(keys) === 0) {
            return;
        }

        keys: for (const key of keys) {
            // if the exact key exists in the top-level, remove it
            if (Arr.exists(array, Number(key)) && !str_contains(String(key), '.')) {
                unset(array, Number(key));

                continue;
            }

            const parts = explode('.', String(key));

            // clean up before each pass
            array = original;

            while (count(parts) > 1) {
                const part = Number(array_shift(parts));

                if (isset(array[part]) && Arr.accessible(array[part])) {
                    array = array[part];
                } else {
                    continue keys;
                }
            }

            const shift = array_shift(parts);

            if (shift) {
                unset(array, Number(shift));
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
            return Array.from(items);
        } catch {
            throw new TypeError('Items cannot be represented by a scalar value.');
        }
    }

    /**
     * Get an item from an array using "dot" notation.
     */
    public static get(array: any[], key?: string | number, defaultValue?: any): any {
        if (!Arr.accessible(array)) {
            return value(defaultValue);
        }

        if (key === undefined) {
            return array;
        }

        if (Arr.exists(array, Number(key)) && !str_contains(String(key), '.')) {
            return array[Number(key)];
        }

        if (!str_contains(String(key), '.')) {
            return value(defaultValue);
        }

        for (const segment of explode('.', String(key))) {
            if (Arr.accessible(array) && Arr.exists(array, Number(segment))) {
                array = array[Number(segment)];
            } else {
                return value(defaultValue);
            }
        }

        return array;
    }

    /**
     * Check if an item or items exist in an array using "dot" notation.
     */
    public static has(array: any[], keys: (string | number)[] | string | number): boolean {
        keys = Array.isArray(keys) ? keys : [keys];

        if (array.length === 0 || keys.length === 0) {
            return false;
        }

        for (const key of keys) {
            let subKeyArray = array;

            if (Arr.exists(array, Number(key))) {
                continue;
            }

            for (const segment of explode('.', String(key))) {
                if (Arr.accessible(subKeyArray) && Arr.exists(subKeyArray, Number(segment))) {
                    subKeyArray = subKeyArray[Number(segment)];
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
    public static hasAll(array: any[], keys: (string | number)[] | string | number): boolean {
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
    public static hasAny(array: any[], keys: (string | number)[] | string | number): boolean {
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
    public static integer(array: any[], key?: string | number, defaultValue?: number): number {
        const value = Arr.get(array, key, defaultValue);

        if (!Number.isInteger(value)) {
            throw new TypeError(`Array value for key [${key}] must be an integer, ${typeof value} found.`);
        }

        return value;
    }

    /**
     * Join all items using a string. The final items can use a separate glue string.
     */
    public static join(array: any[], glue: string, finalGlue: string = ''): string {
        if (finalGlue === '') {
            return implode(glue, array);
        }

        if (count(array) === 0) {
            return '';
        }

        if (count(array) === 1) {
            return array_last(array);
        }

        const finalItem = array_pop(array);

        return implode(glue, array) + finalGlue + finalItem;
    }

    /**
     * Return the last element in an array passing a given truth test.
     */
    public static last<TValue, TLastDefault>(
        array: TValue[],
        callback?: (value: TValue, key: string | number) => boolean,
        defaultValue?: TLastDefault | (() => TLastDefault),
    ): TValue | TLastDefault | undefined {
        if (callback === undefined) {
            return empty(array) ? value(defaultValue) : (array_last(array) as any);
        }

        return Arr.first(array_reverse(array), callback, defaultValue);
    }

    /**
     * Run a map over each of the items in the array.
     */
    public static map(array: any[], callback: (value: any, key?: number) => any): any[] {
        const keys = array_keys(array);
        let items: any[];

        try {
            items = array_map(callback, array, keys as (number | undefined)[]);
        } catch {
            items = array_map(callback, array);
        }

        return Object.values(array_combine(keys, items));
    }

    /**
     * Run a map over each nested chunk of items.
     */
    public static mapSpread<TValue>(array: any[], callback: (...chunk: any[]) => TValue): TValue[] {
        return Arr.map(array, function (chunk: any[], key?: number) {
            chunk.push(key);

            return callback(...chunk) as TValue[];
        });
    }

    /**
     * Run an associative map over each of the items.
     *
     * The callback should return an array with a single value.
     */
    public static mapWithKeys<TValue, TMapWithKeysValue>(
        array: TValue[],
        callback: (value: TValue, key: number) => TMapWithKeysValue[],
    ): any[] {
        const result: any[] = [];

        array.forEach((value, key) => {
            const assoc = callback(value, key);

            assoc.forEach((mapValue, _mapKey) => {
                result[key] = mapValue;
            });
        });

        return result;
    }

    /**
     * Get a subset of the items from the given array.
     */
    public static only(array: any[], keys: (string | number)[] | string | number): any[] {
        // @ts-ignore
        return array_intersect_key(array, array_flip(Array.isArray(keys) ? keys : [keys]));
    }

    /**
     * Partition the array into two arrays using the given callback.
     */
    public static partition<TValue>(array: TValue[], callback: (value: TValue, key: number) => boolean): TValue[][] {
        const passed: TValue[] = [];
        const failed: TValue[] = [];

        array.forEach((item, key) => {
            if (callback(item, key)) {
                passed[passed.length === 0 ? 0 : passed.length] = item;
            } else {
                failed[failed.length === 0 ? 0 : failed.length] = item;
            }
        });

        return [passed, failed];
    }

    /**
     * Pluck an array of values from an array.
     *
     * @param key not supported because arrays can only have numeric keys.
     */
    public static pluck(
        array: any[],
        valueToPluck?: (string | number)[] | string | number | ((item: any) => any),
        key?: (string | number)[] | string | number | ((item: any) => number),
    ): any[] {
        const results: any[] = [];
        [valueToPluck, key] = Arr.explodePluckParameters(valueToPluck, key);

        for (const item of array) {
            const itemValue = typeof valueToPluck === 'function' ? valueToPluck(item) : data_get(item, valueToPluck);

            // If the key is undefined, we will just append the value to the array and keep
            // looping. Otherwise we will key the array using the value of the key we
            // received from the developer. Then we'll return the final array form.
            if (key === undefined) {
                results.push(itemValue);
            } else {
                const itemKey = typeof key === 'function' ? key(item) : Number(data_get(item, key));

                results[itemKey] = itemValue;
            }
        }

        return results;
    }

    /**
     * Push an item onto the beginning of an array.
     */
    public static prepend(array: any[], value: any, _key?: any): any[] {
        if (arguments.length == 2) {
            array_unshift(array, value);
        } else {
            array = [value, ...array];
        }

        return array;
    }

    /**
     * Get a value from the array, and remove it.
     */
    public static pull(array: any[], key: string | number, defaultValue?: any): any {
        const value = Arr.get(array, key, defaultValue);

        Arr.forget(array, key);

        return value;
    }

    /**
     * Push an item into an array using "dot" notation.
     */
    public static push(array: any[], key?: string | number, ...values: any[]): any[] {
        const target = Arr.array(array, key, []).slice();

        array_push(target, ...values);

        return Arr.set(array, key, target);
    }

    /**
     * Convert the array into a query string.
     */
    public static query(array: any[]): string {
        return http_build_query(array, '', '&', PHP_QUERY_RFC3986);
    }

    /**
     * Filter the array using the negation of the given callback.
     */
    public static reject(array: any[], callback: (value: any) => boolean): any[] {
        return Arr.where(array, (value: any) => !callback(value));
    }

    /**
     * Select an array of values from an array.
     */
    public static select(array: any[], keys: (string | number)[] | string | number): any[] {
        keys = Arr.wrap(keys);

        return Arr.map(array, (item) => {
            let result: any[] = [];

            for (const key of keys) {
                if (Arr.accessible(item) && Arr.exists(item, Number(key))) {
                    result[Number(key)] = item[Number(key)];
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
    public static set(array: any[], key?: string | number, value?: any): any[] {
        if (key === undefined) {
            array.length = 0;
            array.push(...value);

            return array;
        }

        const keys = explode('.', String(key));
        // Allows us to modify array in place like PHP does with &array. Setting a key on current also updates array.
        // Setting current to a new value does not.
        let current = array;

        for (let i = 0; i < keys.length - 1; i++) {
            if (count(keys) === 1) {
                break;
            }

            const key = Number(keys[i]);

            // If the key doesn't exist at this depth, we will just create an empty array
            // to hold the next value, allowing us to create the arrays to hold final
            // values at the correct depth. Then we'll keep digging into the array.
            if (!isset(current[key]) || !Array.isArray(current[key])) {
                current[key] = [];
            }

            current = current[key];
        }

        current[Number(keys[keys.length - 1])] = value;

        return array;
    }

    /**
     * Get the first item in the array, but only if exactly one item exists. Otherwise, throw an exception.
     *
     * @throws {Error} if array is empty.
     * @throws {Error} if array has more than one item.
     */
    public static sole(array: any[], callback?: (value: any) => boolean): any {
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
    public static some(array: any[], callback: (value: any, key: string | number) => boolean): boolean {
        return array_any(array, callback);
    }

    /**
     * Recursively sort an array by keys and values.
     */
    public static sortRecursive(
        array: any[],
        options: (
            | typeof SORT_REGULAR
            | typeof SORT_NUMERIC
            | typeof SORT_STRING
            | typeof SORT_NATURAL
            | typeof SORT_FLAG_CASE
        )[] = [SORT_REGULAR],
        descending: boolean = false,
    ): any[] {
        for (let value of array) {
            if (Array.isArray(value)) {
                value = Arr.sortRecursive(value, options, descending);
            }
        }

        descending ? rsort(array, options) : sort(array, options);

        return array;
    }

    /**
     * Recursively sort an array by keys and values in descending order.
     */
    public static sortRecursiveDesc(
        array: any[],
        options: (
            | typeof SORT_REGULAR
            | typeof SORT_NUMERIC
            | typeof SORT_STRING
            | typeof SORT_NATURAL
            | typeof SORT_FLAG_CASE
        )[] = [SORT_REGULAR],
    ): any[] {
        return Arr.sortRecursive(array, options, true);
    }

    /**
     * Get a string item from an array using "dot" notation.
     *
     * @throws {TypeError} if array value at key is not a string.
     */
    public static string(array: any[], key?: string | number, defaultValue?: string): string {
        const value = Arr.get(array, key, defaultValue);

        if (typeof value !== 'string') {
            throw new TypeError(`Array value for key [${key}] must be a string, ${typeof value} found.`);
        }

        return value;
    }

    /**
     * Take the first or last {limit} items from an array.
     */
    public static take(array: any[], limit: number): any[] {
        if (limit < 0) {
            return array_slice(array, limit, abs(limit));
        }

        return array_slice(array, 0, limit);
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
    public static where(array: any[], callback: (value: any) => boolean): any[] {
        return array_filter(array, callback);
    }

    /**
     * Filter items where the value is not undefined.
     */
    public static whereNotUndefined(array: any[]): any[] {
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
        value?: (string | number)[] | string | number | ((item: any) => any),
        key?: (string | number)[] | string | number | ((item: any) => number),
    ): [
        (string | number)[] | number | ((item: any) => any) | undefined,
        (string | number)[] | ((item: any) => any) | undefined,
    ] {
        value = typeof value === 'string' ? explode('.', value) : value;
        key = key === undefined || Array.isArray(key) || key instanceof Function ? key : explode('.', String(key));

        return [value, key];
    }
}
