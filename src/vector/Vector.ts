import { Point, Position } from '../core/Point';

type VectorPolymorph = number | Vector | number[] | Point;

// A 2D vector class.
export class Vector implements Position {
    x: number;

    y: number;

    protected length: number = 0;

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.calculateLength(); // cache value.
    }

    toString() {
        return `Vector: [${this.x}, ${this.y}]`;
    }

    zero() {
        this.x = 0;
        this.y = 0;
        this.length = 0;
    }

    asPoint() {
        return new Point(this.x, this.y);
    }

    // Calculates and caches the length of the vector. Called after any operation that changes the vector.
    protected calculateLength() {
        this.length = Math.hypot(this.x, this.y);
    }

    // get length/magnitude.
    getLength() {
        return this.length;
    }

    // set the magnitude/length of the vector.
    setLength(length: number) {
        return this.copyFrom(this.getUnit().multiply(length));
    }

    // Useful when comparing length of two vectors together, saves a sqrt call.
    squaredLength() {
        return Math.hypot(this.x, this.y);
    }

    // Limit the magnitude to the specified 'max' value.
    limit(max: number): this {
        const squaredMag = this.squaredLength();
        if (squaredMag > max * max) {
            this.divide(Math.sqrt(squaredMag)).multiply(max);
        }

        return this;
    }

    inverse() {
        return this.multiply(-1);
    }

    // Calculates the Euclidean distance between two points (vectors)
    dist(vector: Vector) {
        return vector.clone().sub(this).getLength();
    }

    // A unit vector is a vector with a magnitude of 1. Useful for representing direction/normals.
    getUnit(): Vector {
        const length = this.getLength();
        if (length <= 0) return new Vector(0, 0);

        return new Vector(this.x / length, this.y / length);
    }

    // Keep in mind this function uses '+' to convert back from string as .toFixed() returns a string.
    getFixedUnit(places: number = 2) {
        const unit = this.getUnit();
        return new Vector(+unit.x.toFixed(places), +unit.y.toFixed(places));
    }

    rotateBy(radians: number, pivot: Point) {
        const point = new Point(this.x, this.y).rotate(radians, pivot);

        this.x = point.x;
        this.y = point.y;

        this.calculateLength();

        return this;
    }

    // Project this vector onto another vector.
    project(other: Vector) {
        const d = this.dot(other) / other.squaredLength();
        return Vector.multiply(other, d);
    }

    normal() {
        return this.perpendicular().getUnit();
    }

    perpendicular() {
        // Effectively rotates the vector 90 degrees counter-clockwise.
        return new Vector(-this.y, this.x);
    }

    equals(vector: Vector) {
        return this.x === vector.x && this.y === vector.y;
    }

    // Returns the angle of the vector in radians in respect to the positive x-axis.
    angle() {
        return Math.atan2(-this.y, this.x);
    }

    // Copy the values of another vector into this.
    copyFrom(vector: Vector) {
        this.x = vector.x ?? 0;
        this.y = vector.y ?? 0;
        this.calculateLength();

        return this;
    }

    fromPoint(point: Point) {
        this.x = point.x;
        this.y = point.y;
        this.calculateLength();

        return this;
    }

    // Set the values of the vector - supports vector, array, and individual x, y values.
    set(x: VectorPolymorph, y?: number) {
        if (x instanceof Vector) {
            return this.copyFrom(x);
        }

        if (x instanceof Point) {
            return this.fromPoint(x);
        }

        if (Array.isArray(x)) {
            this.x = x[0] ?? 0;
            this.y = x[1] ?? 0;
            this.calculateLength();

            return this;
        }

        this.x = x ?? 0;
        this.y = y ?? 0;
        this.calculateLength();

        return this;
    }

    // Return a clone of this vector.
    clone(): Vector {
        return new Vector().copyFrom(this);
    }

    // Add another vector to this vector. Supports vector, array, and individual x, y values.
    add(x: VectorPolymorph, y?: number) {
        if (x instanceof Vector) {
            this.x += x.x ?? 0;
            this.y += x.y ?? 0;
            this.calculateLength();
            return this;
        }

        if (x instanceof Point) {
            this.x += x.x;
            this.y += x.y;
            this.calculateLength();
            return this;
        }

        // Unsure how useful this one is.
        if (Array.isArray(x)) {
            this.x += x[0] ?? 0;
            this.y += x[1] ?? 0;
            this.calculateLength();
            return this;
        }

        this.x += x ?? 0;
        this.y += y ?? 0;
        this.calculateLength();
        return this;
    }

    // Subtract another vector from this vector. Supports vector, array, and individual x, y values.
    sub(x: VectorPolymorph, y?: number) {
        if (x instanceof Vector) {
            this.x -= x.x ?? 0;
            this.y -= x.y ?? 0;
            this.calculateLength();

            return this;
        }

        if (x instanceof Point) {
            this.x -= x.x;
            this.y -= x.y;
            this.calculateLength();

            return this;
        }

        // Unsure how useful this one is.
        if (Array.isArray(x)) {
            this.x -= x[0] ?? 0;
            this.y -= x[1] ?? 0;
            this.calculateLength();

            return this;
        }

        this.x -= x ?? 0;
        this.y -= y ?? 0;
        this.calculateLength();

        return this;
    }

    // Scale the vector by a scalar.
    divide(scalar: number) {
        if (!Number.isFinite(scalar) || scalar === 0) {
            return this;
        }

        this.x /= scalar;
        this.y /= scalar;
        this.calculateLength();

        return this;
    }

    // Scale the vector by a scalar.
    multiply(scalar: number) {
        if (!Number.isFinite(scalar)) {
            return this;
        }

        this.x *= scalar;
        this.y *= scalar;
        this.calculateLength();

        return this;
    }

    // Returns the angle between two vectors in radians.
    angleBetween2d(vector: Vector) {
        if (this.length === 0 || vector.length === 0) return 0; // Prevent division by zero.

        return Math.acos(this.dot(vector) / (this.length * vector.length));
    }

    // 2D dot product.
    dot(vector: Vector): number {
        return (this.x * vector.x) + (this.y * vector.y);
    }

    // 2D cross product - returns the Z component of the 3D cross product. Equivalent to the determinant of the 2x2 matrix
    // formed by the two vectors.
    cross(vector: Vector): number {
        return (this.x * vector.y) - (this.y * vector.x); 
    }

    /// STATIC METHODS ///
    // Return a new vector with the same values as the input vector.
    static clone(vector: Vector): Vector {
        return new Vector().copyFrom(vector);
    }

    static fromPoint(point: Point): Vector {
        return new Vector(point.x, point.y);
    }

    // Rotate a vector by a given angle in radians around a pivot point.
    static rotateBy(vector: Vector, radians: number, pivot: Point): Vector {
        return vector.clone().rotateBy(radians, pivot);
    }

    static angle(vector: Vector): number {
        // Invert Y because of downward positive Y.
        return Math.atan2(-vector.y, vector.x);
    }

    // Scale the vector by a scalar.
    static divide(vec: Vector | Point, scalar: number): Vector {
        const vector = vec instanceof Point ? Vector.fromPoint(vec) : vec;

        return vector.clone().divide(scalar);
    }

    // Scale the vector by a scalar.
    static multiply(vec: Vector | Point, scalar: number): Vector {
        const vector = vec instanceof Point ? Vector.fromPoint(vec) : vec;

        return vector.clone().multiply(scalar);
    }

    // Add two vectors together.
    static add(vec1: Vector | Point, vec2: Vector | Point): Vector {
        const vector1 = vec1 instanceof Point ? Vector.fromPoint(vec1) : vec1;
        const vector2 = vec2 instanceof Point ? Vector.fromPoint(vec2) : vec2;

        return vector1.clone().add(vector2);
    }

    // Subtract vec2 from vec1.
    static sub(vec1: Vector | Point, vec2: Vector | Point): Vector {
        const vector1 = vec1 instanceof Point ? Vector.fromPoint(vec1) : vec1;
        const vector2 = vec2 instanceof Point ? Vector.fromPoint(vec2) : vec2;

        return vector1.clone().sub(vector2);
    }

    // Returns the angle between two vectors in radians.
    static dot(vec1: Vector | Point, vec2: Vector | Point): number {
        const vector1 = vec1 instanceof Point ? Vector.fromPoint(vec1) : vec1;
        const vector2 = vec2 instanceof Point ? Vector.fromPoint(vec2) : vec2;

        return (vector1.x * vector2.x) + (vector1.y * vector2.y);
    }

    static asPoint(vector: Vector): Point {
        return new Point(vector.x, vector.y);
    }

    static unit(vec: Vector | Point): Vector {
        const vector = vec instanceof Point ? Vector.fromPoint(vec) : vec;

        return vector.getUnit();
    }

    static angleBetweenPoints(point1: Point, point2: Point) {
        const vector1 = Vector.fromPoint(point1);
        const vector2 = Vector.fromPoint(point2);

        const unit1 = vector1.getUnit();
        const unit2 = vector2.getUnit();

        return unit1.angleBetween2d(unit2);
    }

    static angleBetween(vec1: Vector | Point, vec2: Vector | Point) {
        const vector1 = vec1 instanceof Point ? Vector.fromPoint(vec1) : vec1;
        const vector2 = vec2 instanceof Point ? Vector.fromPoint(vec2) : vec2;

        return vector1.angleBetween2d(vector2);
    }
}
