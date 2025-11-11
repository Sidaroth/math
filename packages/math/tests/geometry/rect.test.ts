import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Rect } from '@geometry/rect';
import { Point } from '@core/point';
import { Circle } from '@geometry/circle';
import { logWarn } from '@utils/logMsg';

// Mock out logWarn so we can verify it's called
vi.mock('@utils/logMsg', () => ({
    logWarn: vi.fn(),
}));

describe('Rect', () => {
    let rect: Rect;

    beforeEach(() => {
        rect = new Rect(10, 20, 30, 40);
        vi.clearAllMocks();
    });

    it('constructs correctly and initializes size and position', () => {
        expect(rect.x).toBe(10);
        expect(rect.y).toBe(20);
        expect(rect.width).toBe(30);
        expect(rect.height).toBe(40);
    });

    it('creates an AABB on first refresh and reuses it on subsequent refreshes', () => {
        const aabb = rect.aabb; // triggers creation
        expect(aabb).toBeInstanceOf(Rect);
        expect(aabb.width).toBe(30);
        expect(aabb.height).toBe(40);

        // manually call refresh to ensure update path runs
        rect.setSize(100, 50);
        const updated = rect.aabb;
        expect(updated.width).toBe(100);
        expect(updated.height).toBe(50);
    });

    it('avoids infinite recursion when AABB references itself', () => {
        const aabb = rect.aabb;
        // Force recursion scenario
        (aabb as any)._aabb = aabb;
        expect(() => (aabb as any).calculateAABB()).not.toThrow();
    });

    it('calculates vertices correctly', () => {
        const vertices = rect.vertices;
        expect(vertices).toHaveLength(4);
        expect(vertices[0].x).toBe(10);
        expect(vertices[2].x).toBe(40);
        expect(vertices[2].y).toBe(60);
    });

    it('contains() correctly detects inside and outside points', () => {
        const inside = new Point(25, 35);
        const outside = new Point(100, 100);
        expect(rect.contains(inside)).toBe(true);
        expect(rect.contains(outside)).toBe(false);
    });

    it('contains() includes points on the edge', () => {
        const edge = new Point(10, 60);
        expect(rect.contains(edge)).toBe(true);
    });

    it('intersects() detects overlap between rectangles', () => {
        const other = new Rect(25, 30, 10, 10);
        expect(rect.intersects(other)).toBe(true);
    });

    it('intersects() detects non-overlap between rectangles', () => {
        const other = new Rect(200, 300, 10, 10);
        expect(rect.intersects(other)).toBe(false);
    });

    it('intersects() detects overlap with a circle', () => {
        const circle = new Circle(new Point(20, 30), 15);
        expect(rect.intersects(circle)).toBe(true);
    });

    it('intersects() detects non-overlap with a circle', () => {
        const circle = new Circle(new Point(500, 500), 15);
        expect(rect.intersects(circle)).toBe(false);
    });

    it('returns false for unsupported shapes', () => {
        expect(rect.intersects({} as any)).toBe(false);
    });

    it('setPosition(x, y) updates correctly', () => {
        rect.setPosition(50, 60);
        expect(rect.x).toBe(50);
        expect(rect.y).toBe(60);
        expect(rect.position.x).toBe(50);
        expect(rect.position.y).toBe(60);
    });

    it('setPosition(Point) updates correctly', () => {
        const p = new Point(123, 456);
        rect.setPosition(p);
        expect(rect.x).toBe(123);
        expect(rect.y).toBe(456);
        expect(rect.position.x).toBe(123);
        expect(rect.position.y).toBe(456);
    });

    it('setPosition warns and ignores invalid numbers', () => {
        rect.setPosition(Number.NaN as any, 10);
        expect(logWarn).toHaveBeenCalled();
        expect(rect.x).toBe(10);
    });

    it('setSize(width, height) updates correctly', () => {
        rect.setSize(80, 90);
        expect(rect.width).toBe(80);
        expect(rect.height).toBe(90);
        expect(rect.size.width).toBe(80);
        expect(rect.size.height).toBe(90);
    });

    it('setSize(Size) updates correctly', () => {
        rect.setSize({ width: 42, height: 84 });
        expect(rect.width).toBe(42);
        expect(rect.height).toBe(84);
    });

    it('setSize(width, height) warns and ignores invalid numbers', () => {
        rect.setSize(Number.NaN as any, 90);
        expect(logWarn).toHaveBeenCalled();
        expect(rect.width).toBe(30);

        rect.setSize(80, Number.NaN as any);
        expect(logWarn).toHaveBeenCalled();
        expect(rect.width).toBe(30);
        expect(rect.height).toBe(40);
    });

    it('toString() returns a readable format', () => {
        const str = rect.toString();
        expect(str).toContain('Rect(');
        expect(str).toContain('position:');
    });

    it('handles markDirty() triggering refresh correctly', () => {
        rect['markDirty']();
        expect(() => rect.x).not.toThrow();
    });
});
