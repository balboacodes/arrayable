// prettier-ignore
import {
    array_first, array_key_first, array_key_last, array_last, array_shift, empty, explode, in_array,
} from '@balboacodes/php-utils';
import { Arr } from './Arr';

/**
 * Fill in data where it's missing.
 */
export function data_fill<T>(
    target: T[] | Record<string, T>,
    key: (string | number)[] | string | number,
    value: any,
): any {
    return data_set(target, key, value, false);
}

/**
 * Remove / unset an item from an array or object using "dot" notation.
 */
export function data_forget<T>(
    target: T[] | Record<string, T>,
    key: (string | number)[] | string | number,
): T[] | Record<string, T> {
    const segments = Array.isArray(key) ? [...key] : explode('.', String(key));
    const segment = array_shift(segments);

    if (segment === '*' && Arr.accessible(target)) {
        if (segments.length > 0) {
            for (const inner in target) {
                data_forget((target as any)[inner], segments);
            }
        }
    } else if (Arr.accessible(target)) {
        if (segments.length > 0 && Arr.exists(target, segment)) {
            data_forget((target as any)[String(segment)], segments);
        } else {
            Arr.forget(target, String(segment));
        }
    }

    return target;
}

/**
 * Get an item from an array or object using "dot" notation.
 */
export function data_get<T>(
    target: T[] | Record<string, T>,
    key?: (string | number)[] | string | number,
    defaultValue?: any,
): any {
    if (key === undefined) {
        return target;
    }

    key = Array.isArray(key) ? [...key] : explode('.', String(key));

    for (let i = 0; i < key.length; i++) {
        let segment = key[i];
        const remaining = key.slice(i + 1);

        if (segment === undefined) {
            return target;
        }

        if (segment === '*') {
            if (!Arr.accessible(target)) {
                return value(defaultValue);
            }

            const result: any[] | Record<string, any> = Array.isArray(target) ? [] : {};
            let index = 0;

            for (const item of Object.values(target)) {
                (result as any)[index] = data_get(item as any, remaining.length > 0 ? remaining : undefined);
                index++;
            }

            return in_array('*', remaining) ? Arr.collapse(result) : result;
        }

        switch (segment) {
            case '\\*':
                segment = '*';
                break;
            case '\\{first}':
                segment = '{first}';
                break;
            case '{first}':
                segment = array_key_first(target) as string | number;
                break;
            case '\\{last}':
                segment = '{last}';
                break;
            case '{last}':
                segment = array_key_last(target) as string | number;
                break;
            default:
                segment = segment;
        }

        if (Arr.accessible(target) && Arr.exists(target, segment)) {
            target = (target as any)[segment];
        } else {
            return value(defaultValue);
        }
    }

    return target;
}

/**
 * Set an item on an array or object using dot notation.
 */
export function data_set<T>(
    target: T[] | Record<string, T>,
    key: (string | number)[] | string | number,
    value: any,
    overwrite: boolean = true,
): any[] | Record<string, any> {
    // Spreading the key into a new array creates a shallow copy of it, allowing us to modify the top-level properties
    // without affecting the reference passed in.
    const segments = Array.isArray(key) ? [...key] : explode('.', String(key));
    let segment = array_shift(segments);

    if (segment === '*') {
        if (!Arr.accessible(target)) {
            target = {};
        }

        if (segments.length > 0) {
            for (let i = 0; i < Object.values(target).length; i++) {
                (target as any)[i] = data_set((target as any)[i], segments, value, overwrite);
            }
        } else if (overwrite) {
            for (let i = 0; i < Object.values(target).length; i++) {
                (target as any)[i] = value;
            }
        }

        return target;
    }

    if (Arr.accessible(target)) {
        if (segments.length > 0) {
            if (!Arr.exists(target, segment)) {
                (target as any)[String(segment)] = Array.isArray(target) ? [] : {};
            }

            (target as any)[String(segment)] = data_set((target as any)[String(segment)], segments, value, overwrite);
        } else if (overwrite || !Arr.exists(target, segment)) {
            (target as any)[String(segment)] = value;
        }

        return target;
    }

    const newTarget: Record<string, any> = {};

    if (segments.length > 0) {
        newTarget[segment] = data_set(newTarget[segment], segments, value, overwrite);
    } else if (overwrite) {
        newTarget[segment] = value;
    }

    return newTarget;
}

/**
 * Get the first element of an array. Useful for method chaining.
 */
export function head<T>(array: T[] | Record<string, T>): any {
    return empty(array) ? false : array_first(array);
}

/**
 * Get the last element from an array.
 */
export function last<T>(array: T[] | Record<string, T>): any {
    return empty(array) ? false : array_last(array);
}

/**
 * Return the default value of the given value.
 */
export function value<TValue, TArgs extends any[]>(v: TValue | ((...args: TArgs) => TValue), ...args: TArgs): TValue {
    return typeof v === 'function' ? (v as (...args: TArgs) => TValue)(...args) : v;
}
