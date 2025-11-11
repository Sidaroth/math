import { bench, describe } from 'vitest';
import { Point } from '@core/point';
import { Vector } from '@core/vector';

describe('Vector performance', () => {
    const vector = new Vector(0, 0);
    const v1 = new Vector(1, 2);
    const v2 = new Vector(3, 4);
    const pivot = new Point(0, 0);

    beforeEach(() => {
        vector.set(0, 0);
        v1.set(1, 2);
        v2.set(3, 4);
        pivot.set(0, 0);
    });

    describe('Vector core', () => {
        bench('Create vector', () => {
            const _ = new Vector(0, 0);
        });

        bench('Vector.refresh()', () => {
            vector['refresh']();
        });
    });

    describe('Vector hot paths', () => {
        bench('Vector.add()', () => {
            v1.add(v2);
        });
        bench('Vector.add() (numbers)', () => {
            v1.add(100, 100);
        });
        bench('Vector.limit()', () => {
            v1.limit(5);
        });
        bench('Vector.rotateBy()', () => {
            v1.rotateBy(Math.PI / 4, pivot);
        });
        bench('Vector.dist()', () => {
            v1.dist(v2);
        });
        bench('Vector.normalize()', () => {
            v1.normalize();
        });
        bench('Vector.set()', () => {
            v1.set(v2);
        });
        bench('Vector.set() (numbers)', () => {
            v1.set(100, 100);
        });
        bench('Vector.subtract()', () => {
            v1.subtract(v2);
        });
        bench('Vector.subtract() (numbers)', () => {
            v1.subtract(100, 100);
        });
        bench('Vector.multiply()', () => {
            v1.multiply(5);
        });
        bench('Vector.divide()', () => {
            v1.divide(5);
        });
        bench('Vector.angleBetween()', () => {
            v1.angleBetween(v2);
        });
        bench('Vector.dot()', () => {
            v1.dot(v2);
        });
        bench('Vector.cross()', () => {
            v1.cross(v2);
        });
        bench('Vector.clone()', () => {
            v1.clone();
        });
        bench('Vector.equals()', () => {
            v1.equals(v2);
        });
        bench('Vector.angle()', () => {
            v1.angle();
        });
        bench('Vector.copyFrom()', () => {
            v1.copyFrom(v2);
        });
        bench('Vector.fromPoint()', () => {
            v1.fromPoint(new Point(100, 100));
        });
        bench('Vector.asPoint()', () => {
            v1.asPoint();
        });
        bench('Vector.toArray()', () => {
            v1.toArray();
        });
        bench('Vector.toString()', () => {
            v1.toString();
        });
    });
});

describe('Point performance', () => {
    const point = new Point(0, 0);
    const pointB = new Point(100, 100);

    bench('Point.add()', () => {
        point.add(pointB);
    });
    bench('Point.add() (numbers)', () => {
        point.add(100, 100);
    });
    bench('Point.subtract()', () => {
        point.subtract(pointB);
    });
    bench('Point.subtract() (numbers)', () => {
        point.subtract(100, 100);
    });
    bench('Point.multiply()', () => {
        point.multiply(5);
    });
    bench('Point.divide()', () => {
        point.divide(5);
    });
    bench('Point.rotateBy()', () => {
        point.rotateBy(Math.PI / 4);
    });
    bench('Point.dist()', () => {
        point.distance(pointB);
    });
    bench('Point.set()', () => {
        point.set(pointB);
    });
    bench('Point.set() (numbers)', () => {
        point.set(100, 100);
    });
    bench('Point.clone()', () => {
        point.clone();
    });
    bench('Point.equals()', () => {
        point.equals(pointB);
    });
    bench('Point.equals() (numbers)', () => {
        point.equals(100, 100);
    });
    bench('Point.midpoint()', () => {
        point.midpoint(pointB);
    });
    bench('Point.squaredDistance()', () => {
        point.squaredDistance(pointB);
    });
    bench('Point.distance()', () => {
        point.distance(pointB);
    });
    bench('Point.angle()', () => {
        point.angle(pointB);
    });
    bench('Point.negate()', () => {
        point.negate();
    });
    bench('Point.inverse()', () => {
        point.inverse();
    });
});
