// Point class represents a point in 2D space - supports most common operations.

export interface Position {
    x: number;
    y: number;
}

// Self-operating methods return self to allow chaining.
export class Point implements Position {
    x: number;

    y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    set(x: number, y: number): this {
        this.x = x;
        this.y = y;

        return this;
    }

    copyFrom(point: Point): this {
        this.x = point.x;
        this.y = point.y;

        return this;
    }

    clone(): Point {
        return new Point(this.x, this.y);
    }

    add(point: Point): this {
        this.x += point.x;
        this.y += point.y;

        return this;
    }

    subtract(point: Point): this {
        this.x -= point.x;
        this.y -= point.y;

        return this;
    }

    multiply(scalar: number): this {
        this.x *= scalar;
        this.y *= scalar;

        return this;
    }

    divide(scalar: number): this {
        this.x /= scalar;
        this.y /= scalar;

        return this;
    }

    equals(point: Point): boolean {
        return this.x === point.x && this.y === point.y;
    }

    // Returns the distance between two points.
    distance(point: Point): number {
        const x = this.x - point.x;
        const y = this.y - point.y;

        return Math.sqrt(x * x + y * y);
    }

    // Returns the squared distance between two points.
    // Useful for comparing distances without the need for the square root.
    squaredDistance(point: Point): number {
        const x = this.x - point.x;
        const y = this.y - point.y;

        return x * x + y * y;
    }

    // Returns the angle between two points (in radians) in range (-π, π].
    angle(point: Point): number {
        const x = point.x - this.x;
        const y = this.y - point.y; // Negate the Y axis - top left is 0,0 in canvas.

        return Math.atan2(y, x);
    }

    // Returns the midpoint between this and another point.
    midpoint(point: Point): Point {
        const x = (this.x + point.x) / 2;
        const y = (this.y + point.y) / 2;

        return new Point(x, y);
    }

    rotate(radians: number, pivot = new Point()): this {
        // Calculate and cache the sine and cosine of the rotation angle
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);

        // Shift the point by the pivot point
        const shifted = this.clone().subtract(pivot);

        // Use the rotation matrix to rotate the point around the pivot shifted origin
        this.x = shifted.x * cos - shifted.y * sin;
        this.y = shifted.x * sin + shifted.y * cos;

        // Shift the point back by the pivot point
        this.x += pivot.x;
        this.y += pivot.y;

        return this;
    }

    toString() {
        return `Point(x: ${this.x}, y: ${this.y})`;
    }

    static rotate(point: Point, radians: number, pivot = new Point()): Point {
        return point.clone().rotate(radians, pivot);
    }

    static subtract(point1: Point, point2: Point): Point {
        return new Point(point1.x - point2.x, point1.y - point2.y);
    }
}
