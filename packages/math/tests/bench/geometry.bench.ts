import { Point } from '@core/point';
import { bench, describe } from 'vitest';
import { Circle } from '@geometry/circle';
import { Rect } from '@geometry/rect';
import { Polygon } from '@geometry/polygon';

describe('Circle performance', () => {
    const circle = new Circle(new Point(0, 0), 100);
    const pInside = new Point(30, 40);
    const pOutside = new Point(130, 140);

    describe('Circle core', () => {
        bench('Circle.refresh()', () => {
            circle['refresh']();
        });

        bench('circle clone()', () => {
            circle.clone();
        });
    });

    describe('Circle math comparisons', () => {
        bench('containsPoint (inside)', () => {
            circle.containsPoint(pInside);
        });

        bench('containsPoint (outside)', () => {
            circle.containsPoint(pOutside);
        });
    });
});

describe('Rect performance', () => {
    const rect = new Rect(0, 0, 100, 100);
    const rectB = new Rect(50, 50, 100, 100);
    const pInside = new Point(30, 40);
    const pOutside = new Point(130, 140);
    const circle = new Circle(new Point(50, 50), 10);

    describe('Rect core', () => {
        bench('Rect.refresh()', () => {
            rect['refresh']();
        });
    });

    describe('Rect math comparisons', () => {
        bench('containsPoint (inside)', () => {
            rect.contains(pInside);
        });

        bench('containsPoint (outside)', () => {
            rect.contains(pOutside);
        });
    });

    bench('Rect.intersects(Rect)', () => {
        rect.intersects(rectB);
    });
    bench('Rect.intersects(Circle)', () => {
        rect.intersects(circle);
    });
});

describe('Polygon performance', () => {
    const p = new Point(50, 50);
    const polygon = new Polygon([
        new Point(0, 0),
        new Point(100, 0),
        new Point(100, 100),
        new Point(0, 100),
    ]);

    bench('Polygon.calculateAABB()', () => polygon['calculateAABB']());
    bench('Polygon.containsPoint()', () => {
        polygon.containsPoint(p);
    });
    bench('Polygon.rotateBy()', () => {
        polygon.rotateBy(Math.PI / 4);
    });
});
