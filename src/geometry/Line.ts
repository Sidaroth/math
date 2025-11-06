import { Point, Vector } from '../core';
import { LazyCacheable } from '../core/LazyCacheable';

/**
 * Represents a 2D line defined by an origin point and an end point.
 *
 * Provides methods for geometric operations such as length calculation,
 * midpoint calculation, angle calculation, and vector calculation.
 */
export class Line extends LazyCacheable {
    private readonly _origin: Point = new Point();

    private readonly _end: Point = new Point();

    private readonly _midpoint: Point = new Point();

    private readonly _vector: Vector = new Vector();

    private _length: number = 0;

    private _angle: number = 0;

    /**
     * @param origin - The origin point.
     * @param end - The end point.
     */
    constructor(origin: Point, end: Point);

    /**
     * @param origin - The origin vector.
     * @param end - The end vector.
     */
    constructor(origin: Vector, end: Vector);
    constructor(origin: Point | Vector, end: Point | Vector) {
        super();

        this._origin.copyFrom(
            origin instanceof Vector ? origin.asPoint() : origin,
        );
        this._end.copyFrom(end instanceof Vector ? end.asPoint() : end);
        this.refresh();
    }

    /** @returns The origin point of the line. */
    get origin() {
        this.ensureRefreshed();
        return this._origin;
    }

    /** @returns The end point of the line. */
    get end() {
        this.ensureRefreshed();
        return this._end;
    }

    /** @returns A vector representation from the origin to the end of the line. */
    get vector(): Vector {
        this.ensureRefreshed();
        return this._vector;
    }

    /** @returns The length of the line. */
    get length(): number {
        this.ensureRefreshed();
        return this._length;
    }

    /** @returns The midpoint of the line. */
    get midpoint(): Point {
        this.ensureRefreshed();
        return this._midpoint;
    }

    /** @returns The angle of the line. */
    get angle(): number {
        this.ensureRefreshed();
        return this._angle;
    }

    /** Calculates the length of the line. */
    private calculateLength() {
        this._length = this._origin.distance(this._end);
    }

    /** Calculates the midpoint of the line. */
    private calculateMidpoint() {
        this._midpoint.copyFrom(this._origin.midpoint(this._end));
    }

    /** Calculates the angle of the line. */
    private calculateAngle() {
        this._angle = this._origin.angle(this._end);
    }

    /** Calculates the vector of the line. */
    private calculateVector() {
        this._vector.set(this._end).sub(this._origin);
    }

    /** Refreshes the line's properties. */
    protected refresh() {
        this.calculateLength();
        this.calculateMidpoint();
        this.calculateAngle();
        this.calculateVector();
    }

    /** @returns A string representation of the line. */
    override toString() {
        return `Line(origin: ${this._origin.toString()}, end: ${this._end.toString()})`;
    }

    /** @returns A deep copy of the line. */
    clone() {
        return new Line(this._origin.clone(), this._end.clone());
    }
}
