import { Vector } from '../vector';
import { Point } from '../core';

export class Circle {
    x: number = 0;

    y: number = 0;

    radius: number = 0;

    squaredRadius: number = 0;

    constructor(x: number = 0, y: number = 0, radius: number = 0) {
        this.setPosition(x, y);
        this.setRadius(radius);
    }

    contains(point: Point): boolean {
        const length = new Vector(point.x - this.x, point.y - this.y).squaredLength();
        return length < this.squaredRadius;
    }

    position(): Point {
        return new Point(this.x, this.y);
    }

    setPosition(x: number, y: number): this {
        this.x = x;
        this.y = y;

        return this;
    }

    setRadius(radius: number): this {
        this.radius = radius;
        this.squaredRadius = radius * radius;

        return this;
    }
}
