import { describe, it, expect } from 'vitest';
import { isSize, type Size } from '@core/size';

describe('isSize', () => {
    it('returns true for a valid Size object', () => {
        const obj: Size = { width: 100, height: 200 };
        expect(isSize(obj)).toBe(true);
    });

    it('returns false for missing width', () => {
        const obj = { height: 200 };
        expect(isSize(obj)).toBe(false);
    });

    it('returns false for missing height', () => {
        const obj = { width: 100 };
        expect(isSize(obj)).toBe(false);
    });

    it('returns false for null or undefined', () => {
        expect(isSize(null)).toBe(false);
        expect(isSize(undefined)).toBe(false);
    });

    it('returns false for non-object types', () => {
        expect(isSize(123)).toBe(false);
        expect(isSize('hello')).toBe(false);
        expect(isSize(true)).toBe(false);
        expect(isSize([])).toBe(false);
        expect(isSize(() => {})).toBe(false);
    });

    it('returns false when width or height are not numbers', () => {
        expect(isSize({ width: '100', height: 200 })).toBe(false);
        expect(isSize({ width: 100, height: '200' })).toBe(false);
    });

    it('returns true for width and height as finite numbers', () => {
        expect(isSize({ width: 0, height: 0 })).toBe(true);
        expect(isSize({ width: -5, height: 10 })).toBe(true);
    });

    it('returns false for NaN or Infinity', () => {
        expect(isSize({ width: Number.NaN, height: 10 })).toBe(false);
        expect(isSize({ width: 10, height: Infinity })).toBe(false);
    });

    it('returns true for zero and positive finite numbers', () => {
        expect(isSize({ width: 0, height: 0 })).toBe(true);
        expect(isSize({ width: 100, height: 50.5 })).toBe(true);
    });

    it('returns true for negative numbers', () => {
        expect(isSize({ width: -5, height: 10 })).toBe(true);
    });
});
