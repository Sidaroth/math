import { LazyCacheable } from './lazyCacheable';
import { Point } from './point';

type VectorPolymorph = number | Vector | Point | [number, number];

/**
 * Represents a 2D vector.
 *
 * Provides methods for geometric operations such as addition, subtraction, multiplication, division,
 * equality, distance, squared distance, angle, midpoint, and rotation.
 */
export class Vector extends LazyCacheable {
    private _x: number = 0;
    private _y: number = 0;

    private _length: number = 0;
    private _squaredLength: number = 0;

    /** A unit vector is a vector with a magnitude of 1. Useful for representing direction/normals.     */
    private readonly _unit!: Vector;

    /**
     * @param x - The x component of the vector.
     * @param y - The y component of the vector.
     */
    constructor(x = 0, y = 0) {
        super();

        this._x = x;
        this._y = y;

        // This creates a new vector - without running the constructor (prevents recursive construction).
        this._unit = Object.create(Vector.prototype) as Vector;
        Object.seal(this._unit);
        this._unit.zero();
        this.markDirty();
    }

    /** @returns The length/magnitude of the vector. */
    get length(): number {
        this.ensureRefreshed();
        return this._length;
    }

    /** @returns The squared length/magnitude of the vector. Useful for comparing lengths without the square root operation. */
    get squaredLength(): number {
        this.ensureRefreshed();
        return this._squaredLength;
    }

    /** @returns The unit vector of the vector. */
    get unit(): Vector {
        this.ensureRefreshed();

        // If performance is a concern, we can avoid cloning by returning the unit vector directly.
        // However this opens up the possibility of mutating the unit vector - not great.
        return this._unit.clone();
    }

    /** @returns The x component of the vector. */
    get x(): number {
        return this._x;
    }

    /** Sets the x component of the vector. */
    set x(value: number) {
        if (this._x === value) {
            return;
        }

        this._x = value;
        this.markDirty();
    }

    /** @returns The y component of the vector. */
    get y(): number {
        return this._y;
    }

    /** Sets the y component of the vector. */
    set y(value: number) {
        if (this._y === value) {
            return;
        }

        this._y = value;
        this.markDirty();
    }

    /** @returns True if the vector has zero magnitude. */
    isZero(): boolean {
        return this._x === 0 && this._y === 0;
    }

    /** Sets the vector to the origin. */
    zero(): this {
        this._x = 0;
        this._y = 0;
        return this.markDirty();
    }

    /** @returns A point representation of the vector. */
    asPoint(): Point {
        return new Point(this._x, this._y);
    }

    /** Recomputes the cached internal state of the vector. */
    protected refresh(): void {
        this.calculateLength();
        this.calculateUnit();
    }

    /** Calculates the length and squared length of the vector. */
    private calculateLength(): void {
        const x = this._x;
        const y = this._y;

        // Calculating squared length first is more efficient than calculating the square root first.
        // this saves us from having to calculate the square root twice.
        this._squaredLength = x * x + y * y;
        this._length = Math.sqrt(this._squaredLength);
    }

    /** Calculates the unit vector of the vector. */
    private calculateUnit(): void {
        const length = this._length;
        // Don't allow NaN, Infinity, or negative lengths - prevents division by zero / NaN.
        if (!Number.isFinite(length) || length <= 0) {
            this._unit.zero();
            return;
        }

        this._unit.set(this._x / length, this._y / length);
    }

    /**
     * Sets the magnitude/length of the vector. Retains direction.
     * @param length - The new length/magnitude of the vector.
     * @returns The vector with the new length/magnitude.
     */
    setLength(length: number): this {
        return this.copyFrom(this.unit.multiply(length));
    }

    /** Limits the magnitude of the vector to the specified 'max' value.
     * @param max - The maximum length/magnitude of the vector.
     * @returns The vector with the limited length/magnitude.
     */
    limit(max: number): this {
        if (this._squaredLength > max * max) {
            this.divide(Math.sqrt(this._squaredLength)).multiply(max);
        }

        return this;
    }

    /** Inverts the direction of the vector. */
    invert(): this {
        // Cheaper than multiplying by -1.
        this._x = -this._x;
        this._y = -this._y;
        return this.markDirty();
    }

    /**
     * Calculates the Euclidean distance between two vectors.
     * @param vector - The vector to calculate the distance to.
     * @returns The distance between the two vectors.
     */
    dist(vector: Vector): number {
        return vector.clone().sub(this).length;
    }

    /**
     * @param places - The number of decimal places to round to.
     * @returns A new vector with the unit vector rounded to the specified number of decimal places.
     */
    getFixedUnit(places: number = 2): Vector {
        return new Vector(
            +this._unit._x.toFixed(places),
            +this._unit._y.toFixed(places),
        );
    }

    /**
     * Rotates the vector by the specified angle around the specified pivot point.
     * @param radians - The angle to rotate the vector by in radians.
     * @param pivot - The pivot point to rotate the vector around.
     * @returns The vector instance.
     */
    rotateBy(radians: number, pivot: Point): this {
        const point = new Point(this._x, this._y).rotateBy(radians, pivot);

        this._x = point.x;
        this._y = point.y;

        return this.markDirty();
    }

    /**
     * Projects this vector onto another vector.
     * @param other - The vector to project onto.
     * @returns The projected vector.
     */
    project(other: Vector): Vector {
        const d = this.dot(other) / other.squaredLength;
        return Vector.multiply(other, d);
    }

    /** @returns The normal vector of the vector. */
    normal(): Vector {
        return this.perpendicular().unit;
    }

    /** normalizes the vector to a unit vector. */
    normalize(): this {
        const len = this.length;
        if (Number.isFinite(len) && len > 0) {
            // note: Divide already sets dirty flag.
            this.divide(len);
        }

        return this;
    }

    /** @returns The perpendicular vector of the vector. */
    perpendicular(): Vector {
        // Effectively rotates the vector 90 degrees counter-clockwise.
        return new Vector(-this._y, this._x);
    }

    /**
     * Checks if the vector is equal to another vector.
     * @param vector - The vector to compare to.
     * @returns True if the vectors are equal, false otherwise.
     */
    equals(vector: Vector): boolean {
        return this._x === vector._x && this._y === vector._y;
    }

    /** @returns The angle of the vector in radians in respect to the positive x-axis. */
    angle(): number {
        return Math.atan2(-this._y, this._x);
    }

    /**
     * Copies the values of another vector into this vector.
     * @param vector - The vector to copy the values from.
     * @returns The vector instance.
     */
    copyFrom(vector: Vector): this {
        this._x = vector._x ?? 0;
        this._y = vector._y ?? 0;
        return this.markDirty();
    }

    /**
     * Sets the values of the vector from a point.
     * @param point - The point to set the values from.
     * @returns The vector instance.
     */
    fromPoint(point: Point): this {
        this._x = point.x;
        this._y = point.y;
        return this.markDirty();
    }

    /**
     * Sets the values of the vector.
     * @param x - The x component of the vector.
     * @param y - The y component of the vector.
     * Supports vector, array, and individual x, y values.
     * @returns The vector instance.
     */
    set(x: VectorPolymorph, y?: number): this {
        if (x instanceof Vector) {
            return this.copyFrom(x);
        }

        if (x instanceof Point) {
            return this.fromPoint(x);
        }

        if (Array.isArray(x)) {
            this._x = x[0] ?? 0;
            this._y = x[1] ?? 0;
            return this.markDirty();
        }

        this._x = x ?? 0;
        this._y = y ?? 0;
        return this.markDirty();
    }

    /** @returns A clone of the vector. */
    clone(): Vector {
        return new Vector().copyFrom(this);
    }

    /**
     * Adds another vector to this vector.
     * @param x - The vector to add.
     * @param y - The y component of the vector.
     * Supports vector, array, and individual x, y values.
     * @returns The vector instance.
     */
    add(x: VectorPolymorph, y?: number): this {
        if (x instanceof Vector) {
            this._x += x._x ?? 0;
            this._y += x._y ?? 0;
            return this.markDirty();
        }

        if (x instanceof Point) {
            this._x += x.x;
            this._y += x.y;
            return this.markDirty();
        }

        // Unsure how useful this one is.
        if (Array.isArray(x)) {
            this._x += x[0] ?? 0;
            this._y += x[1] ?? 0;
            return this.markDirty();
        }

        this._x += x ?? 0;
        this._y += y ?? 0;
        return this.markDirty();
    }

    /**
     * Subtracts another vector from this vector.
     * @param x - The vector to subtract.
     * @param y - The y component of the vector.
     * Supports vector, array, and individual x, y values.
     * @returns The vector instance.
     */
    sub(x: VectorPolymorph, y?: number): this {
        if (x instanceof Vector) {
            this._x -= x._x ?? 0;
            this._y -= x._y ?? 0;

            return this.markDirty();
        }

        if (x instanceof Point) {
            this._x -= x.x;
            this._y -= x.y;

            return this.markDirty();
        }

        // Unsure how useful this one is.
        if (Array.isArray(x)) {
            this._x -= x[0] ?? 0;
            this._y -= x[1] ?? 0;

            return this.markDirty();
        }

        this._x -= x ?? 0;
        this._y -= y ?? 0;

        return this.markDirty();
    }

    /**
     * Divides the vector by a scalar, retaining the direction.
     * @param scalar - The scalar to divide the vector by.
     * @returns The vector instance.
     */
    divide(scalar: number): this {
        if (!Number.isFinite(scalar) || scalar === 0) {
            return this;
        }

        this._x /= scalar;
        this._y /= scalar;

        return this.markDirty();
    }

    /**
     * Multiplies the vector by a scalar, retaining the direction.
     * @param scalar - The scalar to multiply the vector by.
     * @returns The vector instance.
     */
    multiply(scalar: number): this {
        if (!Number.isFinite(scalar)) {
            return this;
        }

        this._x *= scalar;
        this._y *= scalar;

        return this.markDirty();
    }

    /**
     * Calculates the angle between two vectors in radians.
     * @param vector - The vector to calculate the angle to.
     * @returns The angle between the two vectors in radians.
     */
    angleBetween(vector: Vector): number {
        // Prevent division by zero.
        if (this.length === 0 || vector.length === 0) {
            return 0;
        }

        return Math.acos(this.dot(vector) / (this.length * vector.length));
    }

    /**
     * Calculates the dot product of two vectors.
     * @param vector - The vector to calculate the dot product with.
     * @returns The dot product of the two vectors.
     */
    dot(vector: Vector): number {
        return this._x * vector._x + this._y * vector._y;
    }

    /**
     * Calculates the cross product of two vectors.
     * @param vector - The vector to calculate the cross product with.
     * @returns The cross product of the two vectors.
     */
    cross(vector: Vector): number {
        return this._x * vector._y - this._y * vector._x;
    }

    /// STATIC METHODS ///
    /**
     * Returns a new vector with the same values as the input vector.
     * @param vector - The vector to clone.
     * @returns A new vector with the same values as the input vector.
     */
    static clone(vector: Vector): Vector {
        return new Vector().copyFrom(vector);
    }

    /**
     * Creates a new vector from a point.
     * @param point - The point to create the vector from.
     * @returns A new vector with the same values as the input point.
     */
    static fromPoint(point: Point): Vector {
        return new Vector(point.x, point.y);
    }

    /**
     * Rotates a vector by a given angle in radians around a pivot point.
     * @param vector - The vector to rotate.
     * @param radians - The angle to rotate the vector by in radians.
     * @param pivot - The pivot point to rotate the vector around.
     * @returns A new vector with the rotated values.
     */
    static rotateBy(vector: Vector, radians: number, pivot: Point): Vector {
        return vector.clone().rotateBy(radians, pivot);
    }

    /**
     * Calculates the angle of a vector in radians.
     * @param vector - The vector to calculate the angle of.
     * @returns The angle of the vector in radians.
     */
    static angle(vector: Vector): number {
        // Invert Y because of downward positive Y.
        return Math.atan2(-vector._y, vector._x);
    }

    /**
     * Scales a vector by a scalar.
     * @param vector - The vector to scale.
     * @param scalar - The scalar to scale the vector by.
     * @returns A new vector with the scaled values.
     */
    static divide(vec: Vector | Point, scalar: number): Vector {
        const vector = vec instanceof Point ? Vector.fromPoint(vec) : vec;

        return vector.clone().divide(scalar);
    }

    /**
     * Scales a vector by a scalar.
     * @param vector - The vector to scale.
     * @param scalar - The scalar to scale the vector by.
     * @returns A new vector with the scaled values.
     */
    static multiply(vec: Vector | Point, scalar: number): Vector {
        const vector = vec instanceof Point ? Vector.fromPoint(vec) : vec;

        return vector.clone().multiply(scalar);
    }

    /**
     * Adds two vectors together.
     * @param vec1 - The first vector to add.
     * @param vec2 - The second vector to add.
     * @returns A new vector with the added values.
     */
    static add(vec1: Vector | Point, vec2: Vector | Point): Vector {
        const vector1 = vec1 instanceof Point ? Vector.fromPoint(vec1) : vec1;
        const vector2 = vec2 instanceof Point ? Vector.fromPoint(vec2) : vec2;

        return vector1.clone().add(vector2);
    }

    /**
     * Subtracts two vectors.
     * @param vec1 - The first vector to subtract.
     * @param vec2 - The second vector to subtract.
     * @returns A new vector with the subtracted values.
     */
    static sub(vec1: Vector | Point, vec2: Vector | Point): Vector {
        const vector1 = vec1 instanceof Point ? Vector.fromPoint(vec1) : vec1;
        const vector2 = vec2 instanceof Point ? Vector.fromPoint(vec2) : vec2;

        return vector1.clone().sub(vector2);
    }

    /**
     * Calculates the dot product of two vectors.
     * @param vec1 - The first vector to calculate the dot product with.
     * @param vec2 - The second vector to calculate the dot product with.
     * @returns The dot product of the two vectors.
     */
    static dot(vec1: Vector | Point, vec2: Vector | Point): number {
        const vector1 = vec1 instanceof Point ? Vector.fromPoint(vec1) : vec1;
        const vector2 = vec2 instanceof Point ? Vector.fromPoint(vec2) : vec2;

        return vector1._x * vector2._x + vector1._y * vector2._y;
    }

    /**
     * Converts a vector to a point.
     * @param vector - The vector to convert.
     * @returns A new point with the same values as the input vector.
     */
    static asPoint(vector: Vector): Point {
        return new Point(vector._x, vector._y);
    }

    /**
     * Returns the unit vector of a vector.
     * @param vector - The vector to return the unit vector of.
     * @returns The unit vector of the input vector.
     */
    static unit(vec: Vector | Point): Vector {
        const vector = vec instanceof Point ? Vector.fromPoint(vec) : vec;

        return vector.unit;
    }

    /**
     * Calculates the angle between two points.
     * @param point1 - The first point to calculate the angle to.
     * @param point2 - The second point to calculate the angle to.
     * @returns The angle between the two points in radians.
     */
    static angleBetweenPoints(point1: Point, point2: Point): number {
        const vector1 = Vector.fromPoint(point1);
        const vector2 = Vector.fromPoint(point2);

        const unit1 = vector1.unit;
        const unit2 = vector2.unit;

        return unit1.angleBetween(unit2);
    }

    /**
     * Calculates the angle between two vectors.
     * @param vec1 - The first vector to calculate the angle to.
     * @param vec2 - The second vector to calculate the angle to.
     * @returns The angle between the two vectors in radians.
     */
    static angleBetween(vec1: Vector | Point, vec2: Vector | Point): number {
        const vector1 = vec1 instanceof Point ? Vector.fromPoint(vec1) : vec1;
        const vector2 = vec2 instanceof Point ? Vector.fromPoint(vec2) : vec2;

        return vector1.angleBetween(vector2);
    }

    /**
     * Computes the Z-component of the 2D cross product formed by three points (a, b, c).
     *
     * Conceptually, this returns the signed area of the parallelogram spanned by
     * the vectors (b - a) and (c - b).
     *
     * - Positive → points make a left turn (counter-clockwise)
     * - Negative → points make a right turn (clockwise)
     * - Zero → points are collinear
     *
     * This value is also equivalent to the determinant of the 2×2 matrix
     * formed by the edge vectors.
     *
     * @param a - First point (previous vertex)
     * @param b - Second point (current vertex)
     * @param c - Third point (next vertex)
     * @returns The signed Z-component of the 2D cross product.
     */
    static cross2dFromPoints(a: Point, b: Point, c: Point): number {
        const abx = b.x - a.x;
        const aby = b.y - a.y;
        const bcx = c.x - b.x;
        const bcy = c.y - b.y;
        return abx * bcy - aby * bcx;
    }

    /** @returns The vector as an array. For debugging or serializing. */
    toArray(): [number, number] {
        return [this._x, this._y];
    }

    /** @returns A string representation of the vector. */
    override toString(): string {
        return `Vector: [${this._x}, ${this._y}]`;
    }
}
