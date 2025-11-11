import { describe, it, expect } from 'vitest';
import { Point } from '@core/point';
import { Circle } from '@geometry/circle';
import { Rect } from '@geometry/rect';

describe('Circle', () => {
    it('creates a circle with position and radius', () => {
        const c = new Circle(new Point(10, 20), 5);

        expect(c.x).toBe(10);
        expect(c.y).toBe(20);
        expect(c.radius).toBe(5);
        expect(c.squaredRadius).toBe(25);
    });

    it('throws if radius is <= 0', () => {
        expect(() => new Circle(new Point(0, 0), 0)).toThrow();
        expect(() => new Circle(new Point(0, 0), -3)).toThrow();
    });

    it('calculates area and circumference correctly', () => {
        const c = new Circle(new Point(0, 0), 10);
        expect(c.area).toBeCloseTo(Math.PI * 100);
        expect(c.circumference).toBeCloseTo(2 * Math.PI * 10);
    });

    it('calculates a correct AABB', () => {
        const c = new Circle(new Point(10, 20), 5);
        const aabb = c.aabb;

        expect(aabb).toBeInstanceOf(Rect);
        expect(aabb.x).toBe(5);
        expect(aabb.y).toBe(15);
        expect(aabb.width).toBe(10);
        expect(aabb.height).toBe(10);
    });

    it('detects points inside and outside correctly', () => {
        const c = new Circle(new Point(0, 0), 10);

        // Inside (0,0)
        expect(c.containsPoint(new Point(0, 0))).toBe(true);

        // On the edge
        expect(c.containsPoint(new Point(10, 0))).toBe(true);

        // Outside
        expect(c.containsPoint(new Point(10.1, 0))).toBe(false);
    });

    it('translates correctly', () => {
        const c = new Circle(new Point(0, 0), 10);
        c.translate(new Point(5, 5));

        expect(c.x).toBe(5);
        expect(c.y).toBe(5);
    });

    it('updates position correctly with setPosition()', () => {
        const c = new Circle(new Point(0, 0), 10);
        const newPos = new Point(100, 200);
        c.setPosition(newPos);

        expect(c.position.x).toBe(100);
        expect(c.position.y).toBe(200);
    });

    it('clones deeply', () => {
        const c = new Circle(new Point(10, 10), 5);
        const clone = c.clone();

        expect(clone).not.toBe(c);
        expect(clone.position).not.toBe(c.position);
        expect(clone.position.x).toBe(10);
        expect(clone.radius).toBe(5);

        // Changing clone does not mutate original
        clone.translate(new Point(5, 0));
        expect(c.x).toBe(10);
        expect(clone.x).toBe(15);
    });

    it('toString returns a human readable format', () => {
        const c = new Circle(new Point(1, 2), 3);
        expect(c.toString()).toContain('Circle');
        expect(c.toString()).toContain('radius: 3.00');
    });

    // it('marks dirty and recalculates when radius or position changes', () => {
    //     const c = new Circle(new Point(0, 0), 10);
    //     const spy = vi.spyOn(c, 'refresh');

    //     c.setRadius(20);
    //     expect(spy).not.toHaveBeenCalled(); // lazy until accessed

    //     // Accessing a getter triggers refresh
    //     void c.area;
    //     expect(spy).toHaveBeenCalledOnce();
    // });

    it('handles multiple refresh-triggered getters consistently', () => {
        const c = new Circle(new Point(0, 0), 10);
        expect(c.area).toBeCloseTo(Math.PI * 100);
        expect(c.circumference).toBeCloseTo(2 * Math.PI * 10);
        expect(c.squaredRadius).toBe(100);
        expect(c.aabb.width).toBe(20);
    });
});
