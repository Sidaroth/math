/**
 * Represents a point in 2D space.
 *
 * Provides methods for geometric operations such as addition, subtraction, multiplication, division,
 * equality, distance, squared distance, angle, midpoint, and rotation.
 */
export class Point {
    private _x: number = 0;

    private _y: number = 0;

    /**
     * @param x - The x component of the point.
     * @param y - The y component of the point.
     */
    constructor(x: number = 0, y: number = 0) {
        this._x = x;
        this._y = y;
    }

    /** Gets the x component of the point. */
    get x() {
        return this._x;
    }

    /** Gets the y component of the point. */
    get y() {
        return this._y;
    }

    /** Sets the x component of the point. */
    set x(value: number) {
        this._x = value;
    }

    /** Sets the y component of the point. */
    set y(value: number) {
        this._y = value;
    }

    /**
     * Sets the x and y components of the point.
     * @param x - The x component of the point.
     * @param y - The y component of the point.
     * @returns The point instance.
     */
    set(x: number, y: number): this;

    /**
     * Sets the X and Y components of the point from another point.
     * @returns The point instance.
     */
    set(point: Point): this;

    // implementation
    set(x: number | Point, y?: number): this {
        if (x instanceof Point) {
            this.x = x.x;
            this.y = x.y;

            return this;
        }

        this.x = x;
        this.y = y ?? 0;

        return this;
    }

    /**
     * Copies the values of another point into this point.
     * @param point - The point to copy the values from.
     * @returns The point instance.
     */
    copyFrom(point: Point): this {
        this.x = point.x;
        this.y = point.y;

        return this;
    }

    /** @returns A clone of the point. */
    clone(): Point {
        return new Point(this.x, this.y);
    }

    isZero(): boolean {
        return this.x === 0 && this.y === 0;
    }

    /**
     * Adds the x and y components of the point to the point.
     * @param x - The x component to add.
     * @param y - The y component to add.
     * @returns The point instance.
     */
    add(x: number, y: number): this;

    /**
     * Adds the x and y components of another point to this point.
     * @param point - The point to add.
     * @returns The point instance.
     */
    add(point: Point): this;

    add(x: number | Point, y?: number): this {
        if (x instanceof Point) {
            this.x += x.x;
            this.y += x.y;

            return this;
        }

        this.x += x;
        this.y += y ?? 0;

        return this;
    }

    /**
     * Subtracts the x and y components of the point from the point.
     * @param x - The x component to subtract.
     * @param y - The y component to subtract.
     * @returns The point instance.
     */
    subtract(x: number, y: number): this;

    /**
     * Subtracts the x and y components of another point from this point.
     * @param point - The point to subtract.
     * @returns The point instance.
     */
    subtract(point: Point): this;

    // implementation
    subtract(x: number | Point, y?: number): this {
        if (x instanceof Point) {
            this.x -= x.x;
            this.y -= x.y;

            return this;
        }

        this.x -= x;
        this.y -= y ?? 0;

        return this;
    }

    /**
     * Multiplies the x and y components by a scalar.
     * @param scalar - The scalar to multiply the x and y components by.
     * @returns The point instance.
     */
    multiply(scalar: number): this {
        this.x *= scalar;
        this.y *= scalar;

        return this;
    }

    /**
     * Divides the x and y components by a scalar.
     * @param scalar - The scalar to divide the x and y components by.
     * @returns The point instance.
     */
    divide(scalar: number): this {
        if (!Number.isFinite(scalar) || scalar === 0) {
            return this;
        }

        this.x /= scalar;
        this.y /= scalar;

        return this;
    }

    /**
     * Checks if this point is equal to another point.
     * @param point - The point to compare to.
     * @returns True if the two points are equal, false otherwise.
     */
    equals(point: Point): boolean;

    /**
     * Checks if this point is equal to the given x and y components.
     * @param x - The x component to compare to.
     * @param y - The y component to compare to.
     * @returns True if the two points are equal, false otherwise.
     */
    equals(x: number, y: number): boolean;

    // implementation
    equals(x: number | Point, y?: number): boolean {
        if (x instanceof Point) {
            return this.x === x.x && this.y === x.y;
        }

        return this.x === x && this.y === y;
    }

    /**
     * Calculates the distance between this and another point.
     * @param point - The point to calculate the distance to.
     * @returns The distance between the two points.
     */
    distance(point: Point): number {
        const x = this.x - point.x;
        const y = this.y - point.y;

        return Math.hypot(x, y);
    }

    /**
     * Calculates the squared distance between this and another point.
     * @param point - The point to calculate the squared distance to.
     * @returns The squared distance between the two points.
     */
    squaredDistance(point: Point): number {
        const x = this.x - point.x;
        const y = this.y - point.y;

        return x * x + y * y;
    }

    /**
     * Calculates the angle between this and another point (in radians) in range (-π, π].
     * @note the angle is measured assuming a screen coordinate system (Y increases downwards - 0, 0 is top left).
     * @param point - The point to calculate the angle to.
     * @returns The angle between the two points in radians.
     */
    angle(point: Point): number {
        const x = point.x - this.x;
        const y = this.y - point.y; // Negate the Y axis - top left is 0,0 in canvas.

        return Math.atan2(y, x);
    }

    /**
     * Calculates the midpoint between this and another point.
     * @param point - The point to calculate the midpoint between.
     * @returns A new point with the midpoint between the two points.
     */
    midpoint(point: Point): Point {
        const x = (this.x + point.x) / 2;
        const y = (this.y + point.y) / 2;

        return new Point(x, y);
    }

    /**
     * Rotates this point by a given angle in radians around a pivot point.
     * @param radians - The rotation angle in radians.
     * @param pivot - The pivot point to rotate around (defaults to origin).
     * @returns The point instance.
     */
    rotateBy(radians: number, pivot = new Point()): this {
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

    /**
     * Negates the x and y components of the point.
     * @returns The point instance.
     */
    negate(): this {
        this.x = -this.x;
        this.y = -this.y;

        return this;
    }

    /**
     * Computes the multiplicative inverse of each component (x → 1/x, y → 1/y).
     * Components equal to zero are left unchanged to prevent division by zero.
     * @returns The point instance.
     */
    inverse(): this {
        if (this.x !== 0) this.x = 1 / this.x;
        if (this.y !== 0) this.y = 1 / this.y;

        return this;
    }

    /**
     * Subtracts the x and y components of two points.
     * @param point1 - The point to subtract from.
     * @param point2 - The point to subtract.
     * @returns A new point with the subtracted x and y components.
     */
    static subtract(point1: Point, point2: Point): Point {
        return new Point(point1.x - point2.x, point1.y - point2.y);
    }

    /**
     * Adds the x and y components of two points together.
     * @param point1 - The first point to add.
     * @param point2 - The second point to add.
     * @returns A new point with the added x and y components.
     */
    static add(point1: Point, point2: Point): Point {
        return new Point(point1.x + point2.x, point1.y + point2.y);
    }

    /**
     * Multiplies the point x and y components by a scalar.
     * @param point - The point to multiply.
     * @param scalar - The scalar to multiply the point by.
     * @returns A new point with the multiplied x and y components.
     */
    static multiply(point: Point, scalar: number): Point {
        return new Point(point.x * scalar, point.y * scalar);
    }

    /**
     * Divides the point x and y components by a scalar.
     * @param point - The point to divide.
     * @param scalar - The scalar to divide the point by.
     * @returns A new point with the divided x and y components.
     */
    static divide(point: Point, scalar: number): Point {
        return new Point(point.x / scalar, point.y / scalar);
    }

    /**
     * Rotates this point by a given angle in radians around a pivot point.
     * @param radians - The rotation angle in radians.
     * @param pivot - The pivot point to rotate around (defaults to origin).
     * @returns A new point with the rotated values.
     */
    static rotateBy(point: Point, radians: number, pivot = new Point()): Point {
        return point.clone().rotateBy(radians, pivot);
    }

    /** @returns A new point at the origin (0, 0). */
    static zero(): Point {
        return new Point(0, 0);
    }

    /** @returns The point as an array. For debugging or serializing. */
    toArray(): [number, number] {
        return [this.x, this.y];
    }

    /** @returns A string representation of the point. */
    toString() {
        return `Point(${this.x}, ${this.y})`;
    }
}
