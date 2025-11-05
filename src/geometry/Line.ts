import { Vector } from '../vector';
import { Point } from '../core';

// A line between two points.
export class Line {
    origin: Point;

    end: Point;

    constructor(p1: Point | Vector, p2: Point | Vector) {
        this.origin = p1 instanceof Vector ? p1.asPoint() : p1;
        this.end = p2 instanceof Vector ? p2.asPoint() : p2;
    }

    // Returns a vector representation from the origin to the end of the line.
    getVector(): Vector {
        const vector = new Vector(this.end.x, this.end.y);
        return vector.sub(this.origin);
    }

    getLength(): number {
        return this.origin.distance(this.end);
    }

    getMidpoint(): Point {
        return this.origin.midpoint(this.end);
    }

    getAngle(): number {
        return this.origin.angle(this.end);
    }
}
