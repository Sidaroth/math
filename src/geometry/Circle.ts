import { Point } from '@core/point';
import { LazyCacheable } from '@core/lazyCacheable';
import { Rect } from './rect';

/**
 * Represents a 2D circle defined by a center point and a radius.
 *
 * Provides methods for geometric operations such as AABB calculation,
 * point containment, translation, and scaling.
 */
export class Circle extends LazyCacheable {
    private readonly _position: Point = new Point();

    private _aabb: Rect = new Rect();

    private _radius: number = 0;

    private _area: number = 0;

    private _circumference: number = 0;

    private _squaredRadius: number = 0;

    /**
     * Creates a new Circle.
     * @param position - The center point of the circle.
     * @param radius - The radius of the circle.
     */
    constructor(position: Point, radius: number = 0) {
        super();

        this.setPosition(position);
        this.setRadius(radius);
        this.refresh();
    }

    /** @returns The circle's position. */
    get position() {
        this.ensureRefreshed();
        return this._position;
    }

    /** @returns The circle's X position. */
    get x() {
        this.ensureRefreshed();
        return this._position.x;
    }

    /** @returns The circle's Y position. */
    get y() {
        this.ensureRefreshed();
        return this._position.y;
    }

    /** @returns The circle's radius. */
    get radius() {
        this.ensureRefreshed();
        return this._radius;
    }

    /** @returns The circle's squared radius. */
    get squaredRadius() {
        this.ensureRefreshed();
        return this._squaredRadius;
    }

    /** @returns The circle's circumference. */
    get circumference() {
        this.ensureRefreshed();
        return this._circumference;
    }

    /** @returns The circle's area. */
    get area() {
        this.ensureRefreshed();
        return this._area;
    }

    /** @returns The circle's Axis-Aligned Bounding Box (AABB). */
    get aabb() {
        this.ensureRefreshed();
        return this._aabb;
    }

    /** Calculates the Axis-Aligned Bounding Box (AABB) of the circle. */
    private calculateAABB() {
        this._aabb = new Rect(
            this._position.x - this._radius,
            this._position.y - this._radius,
            this._radius * 2,
            this._radius * 2,
        );
    }

    /** Calculates the area of the circle. */
    private calculateArea() {
        this._area = Math.PI * this._radius * this._radius;
    }

    /** Calculates the circumference of the circle. */
    private calculateCircumference() {
        this._circumference = 2 * Math.PI * this._radius;
    }

    /** Calculates the squared radius of the circle. */
    private calculateSquaredRadius() {
        this._squaredRadius = this._radius * this._radius;
    }

    protected refresh() {
        this.calculateAABB();
        this.calculateArea();
        this.calculateCircumference();
        this.calculateSquaredRadius();
    }

    /**
     * Checks if a point is contained within the circle.
     * @param point - The point to check.
     * @returns True if the point is contained within the circle, false otherwise.
     */
    containsPoint(point: Point) {
        const dx = point.x - this._position.x;
        const dy = point.y - this._position.y;
        return dx * dx + dy * dy <= this._squaredRadius;
    }

    /**
     * Sets the position of the circle.
     * @param position - The new position of the circle.
     * @returns The circle itself.
     */
    setPosition(position: Point) {
        this._position.copyFrom(position);
        return this.markDirty();
    }

    /**
     * Translates the circle by a given offset.
     * @param offset - The offset to translate the circle by.
     * @returns The circle itself.
     */
    translate(offset: Point) {
        this._position.add(offset);
        return this.markDirty();
    }

    /**
     * Sets the radius of the circle.
     * @param radius - The new radius of the circle.
     * @returns The circle itself.
     */
    setRadius(radius: number) {
        if (radius <= 0) {
            throw new Error('Circle radius must be greater than zero.');
        }

        this._radius = radius;
        this._squaredRadius = radius * radius;
        return this.markDirty();
    }

    /** @returns A deep copy of the circle. */
    clone() {
        return new Circle(this._position.clone(), this._radius);
    }

    /** @returns A string representation of the circle. */
    override toString() {
        return `Circle(center: ${this._position.toString()}, radius: ${this._radius.toFixed(2)})`;
    }
}
