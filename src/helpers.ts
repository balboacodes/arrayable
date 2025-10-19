// prettier-ignore
import {
    array_first, array_key_first, array_key_last, array_last, array_shift, empty, explode, in_array,
} from '@balboacodes/php-utils';
import { Arr } from './Arr';

/**
 * Fill in data where it's missing.
 */
export function data_fill(target: any, key: (string | number)[] | string | number, value: any): any {
    return data_set(target, key, value, false);
}

/**
 * Remove / unset an item from an array or object using "dot" notation.
 */
export function data_forget(target: any, key: (string | number)[] | string | number): any {
    const segments = Array.isArray(key) ? [...key] : explode('.', String(key));
    const segment = array_shift(segments);

    if (segment === null) {
        return;
    }

    if (segment === '*' && Arr.accessible(target)) {
        if (segments.length > 0) {
            for (const inner in target) {
                data_forget(target[inner], segments);
            }
        } else {
            target.length = 0;
        }
    } else if (Arr.accessible(target)) {
        if (segments.length > 0 && Arr.exists(target, segment)) {
            data_forget(target[segment], segments);
        } else {
            Arr.forget(target, segment);
        }
    }

    return target;
}

/**
 * Get an item from an array or object using "dot" notation.
 */
export function data_get(target: any, key?: (string | number)[] | string | number, defaultValue?: any): any {
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

            const result: any[] = [];

            for (const item of Object.values(target)) {
                result.push(data_get(item, remaining.length > 0 ? remaining : undefined));
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
                segment = array_key_first(Arr.from(target)) as string | number;
                break;
            case '\\{last}':
                segment = '{last}';
                break;
            case '{last}':
                segment = array_key_last(Arr.from(target)) as string | number;
                break;
            default:
                segment = segment;
        }

        if (Arr.accessible(target) && Arr.exists(target, segment)) {
            target = target[segment];
        } else {
            return value(defaultValue);
        }
    }

    return target;
}

/**
 * Set an item on an array or object using dot notation.
 */
export function data_set(
    target: any,
    key: (string | number)[] | string | number,
    value: any,
    overwrite: boolean = true,
): any {
    const segments = Array.isArray(key) ? [...key] : explode('.', String(key));
    let segment = array_shift(segments);

    if (segment === null) {
        return target;
    }

    if (segment === '*') {
        if (!Arr.accessible(target)) {
            target = [];
        }

        if (segments.length > 0) {
            for (let i = 0; i < target.length; i++) {
                target[i] = data_set(target[i], segments, value, overwrite);
            }
        } else if (overwrite) {
            for (let i = 0; i < target.length; i++) {
                target[i] = value;
            }
        }

        return target;
    }

    if (Arr.accessible(target)) {
        if (segments.length > 0) {
            if (!Arr.exists(target, segment)) {
                target[segment] = [];
            }

            target[segment] = data_set(target[segment], segments, value, overwrite);
        } else if (overwrite || !Arr.exists(target, segment)) {
            target[segment] = value;
        }

        return target;
    }

    const newTarget: any = [];

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
export function head(array: any[] | Record<string, any>): any {
    return empty(array) ? false : array_first(array);
}

/**
 * Get the last element from an array.
 */
export function last(array: any[] | Record<string, any>): any {
    return empty(array) ? false : array_last(array);
}

/**
 * Return the default value of the given value.
 */
export function value<TValue, TArgs extends any[]>(v: TValue | ((...args: TArgs) => TValue), ...args: TArgs): TValue {
    return typeof v === 'function' ? (v as (...args: TArgs) => TValue)(...args) : v;
}
