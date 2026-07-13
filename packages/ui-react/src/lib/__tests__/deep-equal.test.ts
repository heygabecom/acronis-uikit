import { describe, expect, it } from 'vitest';

import { deepEqual } from '../deep-equal';

describe('deepEqual', () => {
  it('treats identical primitives as equal', () => {
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual('a', 'a')).toBe(true);
    expect(deepEqual(undefined, undefined)).toBe(true);
    expect(deepEqual(null, null)).toBe(true);
  });

  it('treats different primitives as unequal', () => {
    expect(deepEqual(1, 2)).toBe(false);
    expect(deepEqual('a', 'b')).toBe(false);
    expect(deepEqual(undefined, null)).toBe(false);
  });

  it('treats a primitive and an object as unequal', () => {
    expect(deepEqual(1, { valueOf: () => 1 })).toBe(false);
    expect(deepEqual(null, {})).toBe(false);
  });

  it('compares plain objects by value, regardless of key order', () => {
    expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
    expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
  });

  it('recurses into nested objects', () => {
    expect(deepEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
    expect(deepEqual({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
  });

  it('compares arrays by value and length, order-sensitively', () => {
    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(deepEqual([1, 2, 3], [3, 2, 1])).toBe(false);
    expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
  });

  it('treats an array and an object as unequal', () => {
    expect(deepEqual([], {})).toBe(false);
  });

  it('recurses into arrays of objects', () => {
    expect(deepEqual([{ a: 1 }], [{ a: 1 }])).toBe(true);
    expect(deepEqual([{ a: 1 }], [{ a: 2 }])).toBe(false);
  });
});
