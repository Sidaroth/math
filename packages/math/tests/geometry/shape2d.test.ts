import { describe, it, expect } from 'vitest';
import { Rect } from '@geometry/rect';
import { Circle } from '@geometry/circle';
import { Polygon } from '@geometry/polygon';
import { Line } from '@geometry/line';
import { isShape2d } from '@geometry/shape2d';
import { Point } from '@core/point';

describe('Shape2d', () => {
    it('rects are shape2d', () => {
        const rect = new Rect(0, 0, 100, 100);
        expect(isShape2d(rect)).toBe(true);
    });

    it('circles are shape2d', () => {
        const circle = new Circle(new Point(0, 0), 100);
        expect(isShape2d(circle)).toBe(true);
    });

    it('polygons are shape2d', () => {
        const polygon = new Polygon([
            new Point(0, 0),
            new Point(100, 0),
            new Point(100, 100),
            new Point(0, 100),
        ]);
        expect(isShape2d(polygon)).toBe(true);
    });

    it('lines are shape2d', () => {
        const line = new Line(new Point(0, 0), new Point(100, 100));
        expect(isShape2d(line)).toBe(true);
    });

    it('non-shape2d objects are not shape2d', () => {
        expect(isShape2d(null)).toBe(false);
        expect(isShape2d(undefined)).toBe(false);
        expect(isShape2d(123)).toBe(false);
        expect(isShape2d('hello')).toBe(false);
        expect(isShape2d(true)).toBe(false);
        expect(isShape2d([])).toBe(false);
        expect(isShape2d({})).toBe(false);
        expect(isShape2d({ x: 100, y: 100, width: 100, height: 100 })).toBe(
            false,
        );
        expect(isShape2d({ x: 100, y: 100, radius: 100 })).toBe(false);
    });
});
