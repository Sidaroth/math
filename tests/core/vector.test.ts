// vector.test.ts
import { describe, it, expect } from 'vitest';
import { Vector } from '@core/vector';
import { Point } from '@core/point';

describe('Vector', () => {
    it('constructs with x and y', () => {
        const v = new Vector(3, 4);
        expect(v.x).toBe(3);
        expect(v.y).toBe(4);
    });

    it('computes length and squaredLength correctly', () => {
        const v = new Vector(3, 4);
        expect(v.length).toBeCloseTo(5);
        expect(v.squaredLength).toBeCloseTo(25);
    });

    // SHOULD just log a warning in DEV mode - silently fails and sets a 0 magnitude length.
    it('handles non-finite values for x, y in length and squaredLength correctly', () => {
        const v = new Vector(3, 4);

        // @ts-expect-error - we are testing mangled values (should be impossible in TS - JS misuse)
        v._x = Number.NaN;
        // force recalculation
        v['refresh']();
        expect(v.length).toBe(0);
    });

    it('computes unit vector correctly', () => {
        const v = new Vector(3, 4);
        const unit = v.unit;
        expect(unit.length).toBeCloseTo(1);
        expect(unit.x).toBeCloseTo(3 / 5);
        expect(unit.y).toBeCloseTo(4 / 5);
    });

    it('zero() resets components', () => {
        const v = new Vector(3, 4);
        v.zero();
        expect(v.x).toBe(0);
        expect(v.y).toBe(0);
        expect(v.isZero()).toBe(true);
    });

    it('set() handles various input types', () => {
        const v = new Vector(3, 4);
        v.set([1, 2]);
        expect(v.x).toBe(1);
        expect(v.y).toBe(2);

        v.set(new Vector(5, 6));
        expect(v.x).toBe(5);
        expect(v.y).toBe(6);

        v.set(new Point(7, 8));
        expect(v.x).toBe(7);
        expect(v.y).toBe(8);

        v.set(9, 10);
        expect(v.x).toBe(9);
        expect(v.y).toBe(10);
    });

    it('add() works for all forms', () => {
        const v = new Vector(3, 4);

        // Vector
        v.add(new Vector(1, 1));
        expect(v.toArray()).toEqual([4, 5]);

        // Point
        v.add(new Point(2, 3));
        expect(v.toArray()).toEqual([6, 8]);

        // Number
        v.add(1, 1);
        expect(v.toArray()).toEqual([7, 9]);

        // Array
        v.add([3, 4]);
        expect(v.toArray()).toEqual([10, 13]);

        // Adds negative values correctly
        v.add(-1, -1);
        expect(v.toArray()).toEqual([9, 12]);
    });

    it('add() handles mangled input gracefully', () => {
        const v = new Vector(3, 4);
        v.add(3, Number.NaN);
        expect(v.toArray()).toEqual([3, 4]);

        v.add(3, Number.POSITIVE_INFINITY);
        expect(v.toArray()).toEqual([3, 4]);

        v.add(3, Number.NEGATIVE_INFINITY);
        expect(v.toArray()).toEqual([3, 4]);

        // @ts-expect-error - we are testing the fallback case where y is missing (JS misuse)
        v.add(3, null as number);
        expect(v.toArray()).toEqual([3, 4]);

        // @ts-expect-error - we are testing the fallback case where y is missing (JS misuse) - undefined is a 0 default value.
        v.add(3, undefined as number);
        expect(v.toArray()).toEqual([3, 4]);

        // intentionally bypassing type system to cover defensive branch
        (v as any).add(3);
        expect(v.toArray()).toEqual([3, 4]);
    });

    it('sub() handles mangled input gracefully', () => {
        const v = new Vector(3, 4);
        v.subtract(3, Number.NaN);
        expect(v.toArray()).toEqual([3, 4]);

        v.subtract(3, Number.POSITIVE_INFINITY);
        expect(v.toArray()).toEqual([3, 4]);

        v.subtract(3, Number.NEGATIVE_INFINITY);
        expect(v.toArray()).toEqual([3, 4]);

        // @ts-expect-error - we are testing the fallback case where y is missing (JS misuse)
        v.subtract(3, null as number);
        expect(v.toArray()).toEqual([3, 4]);

        // @ts-expect-error - we are testing the fallback case where y is missing (JS misuse) - undefined is a 0 default value.
        v.subtract(3, undefined as number);
        expect(v.toArray()).toEqual([3, 4]);

        // intentionally bypassing type system to cover defensive branch
        (v as any).subtract(3);
        expect(v.toArray()).toEqual([3, 4]);
    });

    it('works for all forms', () => {
        const v = new Vector(5, 6);

        v.subtract(new Vector(1, 1));
        expect(v.toArray()).toEqual([4, 5]);

        v.subtract(new Point(2, 3));
        expect(v.toArray()).toEqual([2, 2]);

        v.subtract(1, 1);
        expect(v.toArray()).toEqual([1, 1]);

        v.subtract([3, 4]);
        expect(v.toArray()).toEqual([-2, -3]);

        // Subtracts negative values correctly
        v.subtract(-1, -1);
        expect(v.toArray()).toEqual([-1, -2]);
    });

    it('multiplies by scalar', () => {
        const v = new Vector(3, 4);
        v.multiply(2);
        expect(v.toArray()).toEqual([6, 8]);
    });

    it('divides by scalar', () => {
        const v = new Vector(6, 8);
        v.divide(2);
        expect(v.toArray()).toEqual([3, 4]);
    });

    it('invert() flips both components', () => {
        const v = new Vector(3, 4);
        v.invert();
        expect(v.toArray()).toEqual([-3, -4]);
    });

    it('equals() works as expected', () => {
        const v = new Vector(3, 4);
        expect(v.equals(new Vector(3, 4))).toBe(true);
        expect(v.equals(new Vector(1, 1))).toBe(false);
    });

    it('dot() and cross() products', () => {
        const a = new Vector(1, 0);
        const b = new Vector(0, 1);
        expect(a.dot(b)).toBe(0);
        expect(a.cross(b)).toBe(1);
    });

    it('angleBetween() returns correct angle', () => {
        const a = new Vector(1, 0);
        const b = new Vector(0, 1);
        const c = new Vector();
        expect(a.angleBetween(b)).toBeCloseTo(Math.PI / 2);

        // angle between two vectors is the same in both directions.
        expect(a.angleBetween(b)).toBe(b.angleBetween(a));

        // angle between zero vector and any other vector is 0.
        expect(a.angleBetween(c)).toBe(0);

        // angle between two identical vectors is 0.
        expect(a.angleBetween(a)).toBe(0);
        expect(c.angleBetween(c)).toBe(0);
    });

    it('limit() clamps length properly', () => {
        const v = new Vector(10, 0);
        v.limit(5);
        expect(v.length).toBeCloseTo(5);
    });

    it('limit() does nothing if length <= max', () => {
        const v = new Vector(3, 4);
        v.limit(5);
        expect(v.length).toBeCloseTo(5);

        const v2 = new Vector(1, 1);
        v2.limit(5);
        expect(v2.length).toBeCloseTo(Math.sqrt(2));
    });

    it('normalize() makes vector unit length', () => {
        const v = new Vector(3, 4);
        v.normalize();
        expect(v.length).toBeCloseTo(1);
    });

    it('normalize() preserves direction even after multiple operations', () => {
        const v = new Vector(3, 4).multiply(2).normalize();
        expect(v.length).toBeCloseTo(1);
        expect(v.x / v.y).toBeCloseTo(3 / 4);
    });

    it('normalize() handles zero vector gracefully', () => {
        const v = new Vector(0, 0);
        v.normalize();
        expect(v.length).toBeCloseTo(0);
    });

    it('angle() returns correct angle in radians', () => {
        const v = new Vector(0, 1);
        expect(v.angle()).toBeCloseTo(Math.atan2(-1, 0));
    });

    it('project() returns correct projection', () => {
        const a = new Vector(2, 0);
        const b = new Vector(1, 0);
        const proj = a.project(b);
        expect(proj.toArray()).toEqual([2, 0]);
    });

    it('toString() and toArray() output correctly', () => {
        const v = new Vector(3, 4);
        expect(v.toArray()).toEqual([3, 4]);
        expect(v.toString()).toBe('Vector: [3, 4]');
    });

    it('static clone/fromPoint/add/sub/multiply/divide all work', () => {
        const p = new Point(1, 2);
        const v1 = Vector.fromPoint(p);
        expect(v1.toArray()).toEqual([1, 2]);

        const clone = Vector.clone(v1);
        expect(clone.equals(v1)).toBe(true);

        const sum = Vector.add(new Vector(1, 1), new Vector(2, 3));
        expect(sum.toArray()).toEqual([3, 4]);

        const sumPoint = Vector.add(new Point(1, 2), new Point(2, 3));
        expect(sumPoint.toArray()).toEqual([3, 5]);

        const sumPoint2 = Vector.add(v1, p);
        expect(sumPoint2.toArray()).toEqual([2, 4]);

        const sumPoint3 = Vector.add(p, v1);
        expect(sumPoint3.toArray()).toEqual([2, 4]);

        const diff = Vector.subtract(new Vector(5, 4), new Vector(1, 2));
        expect(diff.toArray()).toEqual([4, 2]);

        const diffPoint = Vector.subtract(new Point(5, 4), new Point(1, 2));
        expect(diffPoint.toArray()).toEqual([4, 2]);

        const diffPoint2 = Vector.subtract(p, v1);
        expect(diffPoint2.toArray()).toEqual([0, 0]);

        const diffPoint3 = Vector.subtract(v1, p);
        expect(diffPoint3.toArray()).toEqual([0, 0]);

        const scaled = Vector.multiply(new Vector(2, 3), 2);
        expect(scaled.toArray()).toEqual([4, 6]);

        const pointMultiply = Vector.multiply(new Point(2, 3), 2);
        expect(pointMultiply.toArray()).toEqual([4, 6]);

        const divided = Vector.divide(new Vector(6, 9), 3);
        expect(divided.toArray()).toEqual([2, 3]);

        const pointDivision = Vector.divide(new Point(6, 9), 3);
        expect(pointDivision.toArray()).toEqual([2, 3]);

        // Multiply by zero correctly.
        const mulZero = Vector.multiply(new Vector(3, 4), 0);
        expect(mulZero.toArray()).toEqual([0, 0]);

        // Multiply by non-finite number correctly.
        const mulNonFinite = Vector.multiply(new Vector(3, 4), Number.NaN);
        expect(mulNonFinite.toArray()).toEqual([3, 4]);

        // Multiply by negative number correctly.
        const mulNegative = Vector.multiply(new Vector(3, 4), -1);
        expect(mulNegative.toArray()).toEqual([-3, -4]);

        // Divide by zero correctly.
        const divZero = Vector.divide(new Vector(3, 4), 0);
        expect(divZero.toArray()).toEqual([3, 4]);

        // Divide by non-finite number gracefully returns the original vector.
        const nonFinite = Vector.divide(new Vector(3, 4), Number.NaN);
        expect(nonFinite.toArray()).toEqual([3, 4]);

        // Divide by negative number correctly.
        const negative = Vector.divide(new Vector(3, 4), -1);
        expect(negative.toArray()).toEqual([-3, -4]);
    });

    it('cross2dFromPoints() computes correct orientation', () => {
        const a = new Point(0, 0);
        const b = new Point(1, 0);
        const c = new Point(1, 1);
        const cross = Vector.cross2dFromPoints(a, b, c);
        expect(cross).toBeGreaterThan(0); // counterclockwise
    });

    it('handles setters correctly', () => {
        const v = new Vector(3, 4);
        v.x = 5;
        expect(v.isDirty).toBe(true);
        expect(v.x).toBe(5);
        expect(v.y).toBe(4);
        v.y = 6;
        expect(v.isDirty).toBe(true);
        expect(v.x).toBe(5);
        expect(v.y).toBe(6);
    });

    it('ignores setters if values are the same', () => {
        const v = new Vector(3, 4);
        // Access length to trigger the lazy cacheable refresh.
        expect(v.isDirty).toBe(true);
        expect(v.length).toBeDefined();

        v.x = 3;
        expect(v.isDirty).toBe(false);
        expect(v.x).toBe(3);
        expect(v.y).toBe(4);
        v.y = 4;
        expect(v.isDirty).toBe(false);
        expect(v.x).toBe(3);
        expect(v.y).toBe(4);
    });

    it('can be accessed as a point', () => {
        const v = new Vector(3, 4);
        const p = v.asPoint();
        expect(p.x).toBe(3);
        expect(p.y).toBe(4);
    });

    it('handles non-finite length gracefully (Infinity / NaN)', () => {
        const v1 = new Vector(Infinity, 1);
        // Access unit getter to trigger the lazy cacheable refresh.
        const u1 = v1.unit;
        expect(u1.isZero()).toBe(true); // because .zero() is called internally

        const v2 = new Vector(Number.NaN, 2);
        const u2 = v2.unit;
        expect(u2.isZero()).toBe(true);
    });

    it('handles zero vector correctly', () => {
        const v = new Vector(0, 0);
        expect(v.isZero()).toBe(true);
        expect(v.unit.isZero()).toBe(true);
        expect(v.length).toBe(0);
        expect(v.squaredLength).toBe(0);
    });

    it('setLength() sets the length correctly', () => {
        const v = new Vector(3, 4);
        v.setLength(5);
        expect(v.length).toBeCloseTo(5);
        expect(v.toArray()).toEqual([3, 4]);
    });

    it('setLength() handles non-finite lengths gracefully', () => {
        const v = new Vector(Infinity, 1);
        v.setLength(Number.NaN);

        // It silently fails and returns the zero vector.
        expect(v.length).toBe(0);
        expect(v.isZero()).toBe(true);
    });

    it('setLength() handles negative lengths gracefully', () => {
        const v = new Vector(3, 4);
        v.setLength(-5);
        expect(v.length).toBeCloseTo(5);
        expect(v.toArray()).toEqual([3, 4]);
    });

    it('calculates euclidean distance correctly', () => {
        const a = new Vector(3, 4);
        const b = new Vector(0, 0);
        expect(a.dist(b)).toBeCloseTo(5);
        expect(a.dist(b)).toBeCloseTo(b.dist(a));

        // Gracefully handles negative vectors.
        const c = new Vector(-3, -4);
        expect(b.dist(c)).toBeCloseTo(5);
        expect(c.dist(b)).toBeCloseTo(5);
        expect(a.dist(c)).toBeCloseTo(10);
        expect(c.dist(a)).toBeCloseTo(10);

        // Distance to self is 0.
        expect(a.dist(a)).toBeCloseTo(0);

        // handles non-finite vectors gracefully - ignores invalid vector values
        const d = new Vector(Infinity, 1);
        expect(a.dist(d)).toBeCloseTo(a.length);
        expect(d.dist(a)).toBeCloseTo(a.length);

        const e = new Vector(Number.NaN, 2);
        expect(a.dist(e)).toBeCloseTo(a.length);
        expect(e.dist(a)).toBeCloseTo(a.length);
    });

    it('handles getFixedUnit() correctly', () => {
        const v = new Vector(3, 4);

        // default precision is 2.
        expect(v.getFixedUnit().toArray()).toEqual([0.6, 0.8]);

        // precision is 3. - still the same result because it's just 1 decimal place of precision.
        expect(v.getFixedUnit(3).toArray()).toEqual([0.6, 0.8]);

        // More complex case sqrt(1/2) = 0.7071067811865476
        const v2 = new Vector(1, 1);
        expect(v2.getFixedUnit(2).toArray()).toEqual([0.71, 0.71]);

        // oxlint-disable-next-line approx-constant - it's meant to be an approximation for the 3 decimal places of precision.
        expect(v2.getFixedUnit(3).toArray()).toEqual([0.707, 0.707]);

        // Should handle non-finite vectors gracefully - mangled input returns zero vector.
        const v3 = new Vector(Infinity, 1);
        expect(v3.getFixedUnit().toArray()).toEqual([0, 0]);

        // Handle invalid input gracefully.
        expect(v.getFixedUnit(Number.NaN).toArray()).toEqual([0.6, 0.8]);
        expect(v.getFixedUnit(-1).toArray()).toEqual([0.6, 0.8]);
        expect(v.getFixedUnit(Infinity).toArray()).toEqual([0.6, 0.8]);

        // Handle zero precision gracefully - rounds to the nearest integer.
        expect(v.getFixedUnit(0).toArray()).toEqual([1, 1]);

        // Handles zero padding gracefully - zero pads up to the specified number of decimal places.
        // e.g in the case of 0.6, it will be padded to 0.60000 - as a string.
        // internally getFixedUnit() converts to a number again - which drops trailing zeros.
        expect(v.getFixedUnit(5).toArray()).toEqual([0.6, 0.8]);
    });

    it('handles rotateBy() correctly', () => {
        // Rotate (3,4) 90° CCW around origin (0,0)
        const v = new Vector(3, 4);
        const pivot = new Point(0, 0);
        const result = v.rotateBy(Math.PI / 2, pivot);

        // Verify coordinates - protect from float precision by using toBeCloseTo()
        expect(v.x).toBeCloseTo(-4);
        expect(v.y).toBeCloseTo(3);

        // Verify chaining works
        expect(result).toBe(v);

        // Rotate (3,4) 90° CCW around pivot (1,1)
        const v2 = new Vector(3, 4);
        const pivot2 = new Point(1, 1);
        v2.rotateBy(Math.PI / 2, pivot2);

        // Expected manual math:
        const cos = Math.cos(Math.PI / 2);
        const sin = Math.sin(Math.PI / 2);
        const x = 3 - 1;
        const y = 4 - 1;
        const rotated = [x * cos - y * sin + 1, x * sin + y * cos + 1];

        expect(v2.toArray()).toEqual(rotated);
    });

    it('computes a correct unit normal vector', () => {
        const v = new Vector(3, 4);
        const n = v.normal();

        expect(n.x).toBe(-0.8);
        expect(n.y).toBe(0.6);

        // Ensure result is actually unit length
        expect(n.length).toBe(1);

        // Ensure the original vector is not mutated
        expect(v.toArray()).toEqual([3, 4]);
    });

    it('perpendicular() and normal() produce orthogonal vectors', () => {
        const v = new Vector(3, 4);
        const p = v.perpendicular();
        const n = v.normal();

        expect(v.dot(p)).toBeCloseTo(0);
        expect(v.dot(n)).toBeCloseTo(0);
    });

    describe('static methods', () => {
        it('static rotateBy() rotates a vector by a given angle in radians around a pivot point', () => {
            const v = new Vector(3, 4);
            const pivot = new Point(0, 0);
            const result = Vector.rotateBy(v, Math.PI / 2, pivot);

            expect(result.x).toBeCloseTo(-4);
            expect(result.y).toBeCloseTo(3);
        });

        it('static angle() returns the correct angle in radians (Y inverted)', () => {
            // Right (0°)
            expect(Vector.angle(new Vector(1, 0))).toBeCloseTo(0);

            // Up (Y inverted → -π/2 - 90°)
            expect(Vector.angle(new Vector(0, 1))).toBeCloseTo(-Math.PI / 2);

            // Left (π or -π are equivalent - 180°) - atan2 returns -π for -0 and π for 0.
            expect(Math.abs(Vector.angle(new Vector(-1, 0)))).toBeCloseTo(
                Math.PI,
            );

            // Down (Y inverted → +π/2 - 90°)
            expect(Vector.angle(new Vector(0, -1))).toBeCloseTo(Math.PI / 2);

            // 45° down-right (π/4 - 45°)
            expect(Vector.angle(new Vector(1, -1))).toBeCloseTo(Math.PI / 4);

            // 45° up-left (-3π/4 - 135°)
            expect(Vector.angle(new Vector(-1, 1))).toBeCloseTo(
                (-3 * Math.PI) / 4,
            );
        });

        it('static dot() calculates the dot product correctly for vectors and points', () => {
            const right = new Vector(1, 0);
            const up = new Vector(0, 1);
            const diag = new Vector(1, 1);

            // Orthogonal (90°)
            expect(Vector.dot(right, up)).toBeCloseTo(0);

            // Same direction
            expect(Vector.dot(right, new Vector(2, 0))).toBeCloseTo(2);

            // Opposite direction
            expect(Vector.dot(right, new Vector(-2, 0))).toBeCloseTo(-2);

            // 45° angle (1,0) · (1,1) = 1
            expect(Vector.dot(right, diag)).toBeCloseTo(1);

            // Cross-type: vector vs point
            const p1 = new Point(3, 4);
            const p2 = new Point(2, -1);

            expect(Vector.dot(p1, p2)).toBeCloseTo(3 * 2 + 4 * -1); // 6 - 4 = 2
            expect(Vector.dot(new Vector(3, 4), p2)).toBeCloseTo(2);
            expect(Vector.dot(p1, new Vector(2, -1))).toBeCloseTo(2);
        });

        it('static asPoint() creates a point from a vector', () => {
            const v = new Vector(3, 4);
            const p = Vector.asPoint(v);
            expect(p.x).toBe(3);
            expect(p.y).toBe(4);
        });

        it('static unit() returns the unit vector of a vector', () => {
            const v = new Vector(3, 4);
            const u = Vector.unit(v);
            expect(u.x).toBeCloseTo(3 / 5);
            expect(u.y).toBeCloseTo(4 / 5);

            const p = new Point(3, 4);
            const u2 = Vector.unit(p);
            expect(u2.x).toBeCloseTo(3 / 5);
            expect(u2.y).toBeCloseTo(4 / 5);
        });

        it('static angleBetweenPoints() returns the angle between two points', () => {
            const a = new Point(0, 0);
            const b = new Point(1, 0);
            const angle = Vector.angleBetweenPoints(a, b);
            expect(angle).toBeCloseTo(0);
        });

        it('static angleBetween() returns the angle between two vectors or points', () => {
            const v1 = new Vector(0, 0);
            const v2 = new Vector(1, 0);
            const angle = Vector.angleBetween(v1, v2);
            expect(angle).toBeCloseTo(0);

            const p1 = new Point(0, 0);
            const p2 = new Point(1, 0);
            const angle2 = Vector.angleBetween(p1, p2);
            expect(angle2).toBeCloseTo(0);

            expect(Vector.angleBetween(v1, p2)).toBeCloseTo(0);
            expect(Vector.angleBetween(p1, v2)).toBeCloseTo(0);
        });

        it('static cross2dFromPoints() computes the correct orientation', () => {
            const a = new Point(0, 0);
            const b = new Point(1, 0);
            const c = new Point(1, 1);
            const cross = Vector.cross2dFromPoints(a, b, c);
            expect(cross).toBeGreaterThan(0); // counterclockwise
        });

        it('static add/sub/multiply/divide mirror instance methods', () => {
            const v1 = new Vector(2, 3);
            const v2 = new Vector(1, 1);
            const sum = v1.clone().add(v2);
            expect(sum.toArray()).toEqual(Vector.add(v1, v2).toArray());
            const diff = v1.clone().subtract(v2);
            expect(diff.toArray()).toEqual(Vector.subtract(v1, v2).toArray());
        });
    });

    it('supports chained arithmetic without losing cache correctness', () => {
        const v = new Vector(1, 1);
        v.add(1, 0).subtract(0, 1).multiply(2).divide(2);
        expect(v.toArray()).toEqual([2, 0]);
        expect(v.length).toBeCloseTo(2);
    });

    it('project() handles orthogonal and zero vectors', () => {
        const a = new Vector(1, 0);
        const b = new Vector(0, 1);
        const proj = a.project(b);
        expect(proj.isZero()).toBe(true);

        const zero = new Vector(0, 0);
        const proj2 = a.project(zero);
        expect(proj2.isZero()).toBe(true);
    });

    it('cross2dFromPoints() returns 0 for collinear points and negative for clockwise turns', () => {
        const a = new Point(0, 0);
        const b = new Point(1, 0);
        const c = new Point(2, 0);
        expect(Vector.cross2dFromPoints(a, b, c)).toBeCloseTo(0);

        const cw = new Point(1, -1);
        expect(Vector.cross2dFromPoints(a, b, cw)).toBeLessThan(0);
    });

    it('clone() creates an independent copy', () => {
        const v1 = new Vector(2, 3);
        const v2 = v1.clone();
        v2.add(1, 1);
        expect(v1.toArray()).toEqual([2, 3]);
        expect(v2.toArray()).toEqual([3, 4]);
    });
});
