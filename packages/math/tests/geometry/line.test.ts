import { describe, it, expect } from 'vitest';
import { Point } from '@core/point';
import { Vector } from '@core/vector';
import { Line } from '@geometry/line';

describe('Line', () => {
    it('constructs correctly from points', () => {
        const a = new Point(0, 0);
        const b = new Point(3, 4);
        const line = new Line(a, b);

        expect(line.origin.toArray()).toEqual([0, 0]);
        expect(line.end.toArray()).toEqual([3, 4]);
        expect(line.length).toBeCloseTo(5);
        expect(line.midpoint.toArray()).toEqual([1.5, 2]);
        expect(line.angle).toBeCloseTo(a.angle(b));

        const vec = line.vector;
        expect(vec.toArray()).toEqual([3, 4]);
    });

    it('constructs correctly from vectors', () => {
        const a = new Vector(1, 1);
        const b = new Vector(4, 5);
        const line = new Line(a, b);

        expect(line.origin.toArray()).toEqual([1, 1]);
        expect(line.end.toArray()).toEqual([4, 5]);
        expect(line.length).toBeCloseTo(5);
        expect(line.midpoint.toArray()).toEqual([2.5, 3]);
        expect(line.vector.toArray()).toEqual([3, 4]);
    });

    it('calculates zero-length correctly when both points coincide', () => {
        const p = new Point(5, 5);
        const line = new Line(p, p.clone());
        expect(line.length).toBe(0);
        expect(line.vector.toArray()).toEqual([0, 0]);
        expect(line.midpoint.toArray()).toEqual([5, 5]);
    });

    it('clone() produces a deep copy', () => {
        const line1 = new Line(new Point(0, 0), new Point(1, 1));
        const line2 = line1.clone();

        expect(line2).not.toBe(line1);
        expect(line2.origin).not.toBe(line1.origin);
        expect(line2.end).not.toBe(line1.end);
        expect(line2.length).toBeCloseTo(line1.length);
    });

    it('toString() returns a formatted string', () => {
        const line = new Line(new Point(0, 0), new Point(1, 1));
        const str = line.toString();
        expect(str).toContain('Line(origin:');
        expect(str).toContain('end:');
    });

    it('handles non-finite points gracefully', () => {
        const a = new Point(Infinity, 0);
        const b = new Point(1, Number.NaN);
        const line = new Line(a, b);

        expect(Number.isFinite(line.length)).toBe(false);
        expect(line.vector.toArray()).toEqual([1 - Infinity, Number.NaN - 0]);
    });
});
