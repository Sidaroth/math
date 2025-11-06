import { describe, it, expect } from 'vitest';
import { Point } from '../../src/core';

describe('Point', () => {
    describe('core operations', () => {
        it('creates a point with default values', () => {
            const p = new Point();
            expect(p.x).toBe(0);
            expect(p.y).toBe(0);
        });

        it('Sets values correctly in constructor', () => {
            const p = new Point(1, 2);
            expect(p.x).toBe(1);
            expect(p.y).toBe(2);
        });

        it('clones correctly', () => {
            const p = new Point(1, 2);
            const clone = p.clone();
            expect(clone.x).toBe(1);
            expect(clone.y).toBe(2);
            expect(clone).not.toBe(p);
        });

        it('copies from another point correctly', () => {
            const p1 = new Point(1, 2);
            const p2 = new Point(3, 4);
            p1.copyFrom(p2);
            expect(p1.x).toBe(3);
            expect(p1.y).toBe(4);
            expect(p1).not.toBe(p2);
        });

        it('sets values correctly', () => {
            const p = new Point();
            p.set(1, 2);
            expect(p.x).toBe(1);
            expect(p.y).toBe(2);
        });

        it('sets values correctly from another point', () => {
            const p1 = new Point(1, 2);
            const p2 = new Point(3, 4);
            p1.set(p2);
            expect(p1.x).toBe(3);
            expect(p1.y).toBe(4);
            expect(p1).not.toBe(p2);
        });

        it('is zero checks correctly', () => {
            const p = new Point(0, 0);
            expect(p.isZero()).toBe(true);
        });

        it('is not zero checks correctly', () => {
            const p = new Point(1, 2);
            expect(p.isZero()).toBe(false);
        });
    });

    describe('geometric operations', () => {
        it('adds numbers correctly', () => {
            const p = new Point(2, 3);
            p.add(1, -2);
            expect(p.x).toBe(3);
            expect(p.y).toBe(1);
        });

        it('subtracts another point correctly', () => {
            const p1 = new Point(5, 5);
            const p2 = new Point(2, 1);
            p1.subtract(p2);
            expect(p1.x).toBe(3);
            expect(p1.y).toBe(4);
        });

        it('multiplies by scalar', () => {
            const p = new Point(2, 3);
            p.multiply(2);
            expect(p.x).toBe(4);
            expect(p.y).toBe(6);
        });

        it('divides by scalar safely', () => {
            const p = new Point(10, 4);
            p.divide(2);
            expect(p.x).toBe(5);
            expect(p.y).toBe(2);
        });

        it('ignores division by zero', () => {
            const p = new Point(3, 4);
            p.divide(0);
            expect(p.x).toBe(3);
            expect(p.y).toBe(4);
        });
    });

    describe('Geometry and comparison operations', () => {
        it('equals correctly', () => {
            const p1 = new Point(1, 2);
            const p2 = new Point(1, 2);
            expect(p1.equals(p2)).toBe(true);
        });

        it('computes distance and squared distance', () => {
            const p1 = new Point(0, 0);
            const p2 = new Point(3, 4);
            expect(p1.distance(p2)).toBeCloseTo(5);
            expect(p1.squaredDistance(p2)).toBeCloseTo(25);
        });

        it('negates coordinates', () => {
            const p = new Point(3, -4);
            p.negate();
            expect(p.x).toBe(-3);
            expect(p.y).toBe(4);
        });

        it('inverses safely (skipping zero)', () => {
            const p = new Point(2, 0);
            p.inverse();
            expect(p.x).toBeCloseTo(0.5);
            expect(p.y).toBe(0);
        });
    });

    describe('rotation and angle operations', () => {
        it('rotates 90° clockwise (screen coordinates)', () => {
            const p = new Point(1, 0);
            p.rotateBy(Math.PI / 2);
            expect(p.x).toBeCloseTo(0);
            expect(p.y).toBeCloseTo(1);
        });

        it('calculates correct screen-space angle', () => {
            const p1 = new Point(0, 0);
            const p2 = new Point(3, 4);
            expect(p1.angle(p2)).toBeCloseTo(Math.atan2(-4, 3));
        });
    });

    describe('static operations', () => {
        it('adds two points statically', () => {
            const a = new Point(1, 2);
            const b = new Point(3, 4);
            const r = Point.add(a, b);
            expect(r.x).toBe(4);
            expect(r.y).toBe(6);
        });

        it('creates a zero point', () => {
            const z = Point.zero();
            expect(z.x).toBe(0);
            expect(z.y).toBe(0);
        });

        it('subtracts two points statically', () => {
            const a = new Point(1, 2);
            const b = new Point(3, 4);
            const r = Point.subtract(a, b);
            expect(r.x).toBe(-2);
            expect(r.y).toBe(-2);
        });

        it('multiplies a point by a scalar statically', () => {
            const p = new Point(2, 3);
            const r = Point.multiply(p, 2);
            expect(r.x).toBe(4);
            expect(r.y).toBe(6);
        });

        it('divides a point by a scalar statically', () => {
            const p = new Point(2, 3);
            const r = Point.divide(p, 2);
            expect(r.x).toBe(1);
            expect(r.y).toBe(1.5);
        });

        it('rotates a point by an angle statically', () => {
            const p = new Point(1, 0);
            const r = Point.rotateBy(p, Math.PI / 2);
            expect(r.x).toBeCloseTo(0);
            expect(r.y).toBeCloseTo(1);
        });
    });

    describe('meta/utility operations', () => {
        it('converts to array', () => {
            const p = new Point(1, 2);
            const a = p.toArray();
            expect(a).toEqual([1, 2]);
        });

        it('converts to string', () => {
            const p = new Point(1, 2);
            const s = p.toString();
            expect(s).toBe('Point(1, 2)');
        });
    });
});
