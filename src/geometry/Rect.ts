import { Point } from '@core/point';
import { isSize, type Size } from '@core/size';
import { clamp } from '@utils/scalar';
import { LazyCacheable } from '@core/lazyCacheable';
import { Circle } from './circle';
import { type Shape2d } from './shape2d';
import { logWarn } from '@utils/logMsg';

/**
 * Represents a 2D rectangle defined by a position, width, and height.
 *
 * Provides methods for geometric operations such as point containment,
 * vertex generation, intersection detection, and position setting.
 */
export class Rect extends LazyCacheable {
    private readonly _position: Point = new Point();
    private readonly _size: Size = { width: 0, height: 0 };

    private _vertices: Point[] = [];

    private _aabb!: Rect;

    /**
     * Creates a new Rect.
     * @param x - The x coordinate.
     * @param y - The y coordinate.
     * @param width - The width.
     * @param height - The height.
     */
    constructor(
        x: number = 0,
        y: number = 0,
        width: number = 0,
        height: number = 0,
    ) {
        super();

        this.setPosition(x, y);
        this.setSize(width, height);
    }

    /** @returns The rectangle's Axis-Aligned Bounding Box (AABB). */
    get aabb() {
        this.ensureRefreshed();
        return this._aabb;
    }

    /** @returns The rectangle's width. */
    get width() {
        this.ensureRefreshed();
        return this._size.width;
    }

    /** @returns The rectangle's height. */
    get height() {
        this.ensureRefreshed();
        return this._size.height;
    }

    /** @returns The rectangle's size. */
    get size(): Size {
        this.ensureRefreshed();
        return this._size;
    }

    /** @returns The rectangle's position. */
    get position(): Point {
        this.ensureRefreshed();
        return this._position;
    }

    /** @returns The rectangle's X position. */
    get x() {
        this.ensureRefreshed();
        return this._position.x;
    }

    /** @returns The rectangle's Y position. */
    get y() {
        this.ensureRefreshed();
        return this._position.y;
    }

    /** @returns The rectangle's vertices. */
    get vertices(): readonly Point[] {
        this.ensureRefreshed();
        return this._vertices;
    }

    /**
     * Refreshes the rectangle's derived properties and caches them.
     * Must be called whenever the rectangle's position or size is changed.
     * @protected
     */
    protected refresh(): void {
        this.calculateAABB();
        this.calculateVertices();
    }

    /** Calculates and caches the rectangle's vertices. */
    private calculateVertices() {
        this._vertices = [
            new Point(this._position.x, this._position.y),
            new Point(this._position.x + this._size.width, this._position.y),
            new Point(
                this._position.x + this._size.width,
                this._position.y + this._size.height,
            ),
            new Point(this._position.x, this._position.y + this._size.height),
        ];
    }

    /** Calculates and caches the rectangle's Axis-Aligned Bounding Box (AABB). */
    private calculateAABB() {
        // note: Since we want the external use of "get aabb" to be the same across all geometry - we need to return a rect within a rect.
        // this can cause infinite recursion if not handled correctly - as the AABB will also call calculateAABB() - which will call calculateAABB() - which will call calculateAABB() - etc.

        // If the AABB is the same as the rectangle, do nothing - AABB infinite recusion guard.
        if (this._aabb === this) return;

        // If the AABB is not set, create a new one.
        if (!this._aabb) {
            this._aabb = new Rect(
                this._position.x,
                this._position.y,
                this._size.width,
                this._size.height,
            );
            // Set the AABB to itself to prevent infinite recursion.
            this._aabb._aabb = this._aabb;
            return;
        }

        // Update the AABB to the same position and size as the rectangle.
        this._aabb._position.copyFrom(this._position);
        this._aabb._size.width = this._size.width;
        this._aabb._size.height = this._size.height;
    }

    /**
     * Checks if a point is contained within the rectangle.
     * @note The check is inclusive for the edges of the rectangle - a point on the edge is considered contained.
     * @param point - The point to check.
     * @returns True if the point is contained within the rectangle, false otherwise.
     */
    contains(point: Point): boolean {
        const insideX = point.x >= this.x && point.x <= this.x + this.width;
        const insideY = point.y >= this.y && point.y <= this.y + this.height;

        return insideX && insideY;
    }

    /**
     * Determines whether this rectangle intersects another rectangle or circle.
     * Uses AABB overlap for rectangles and closest-point test for circles.
     * @param shape - The shape to check for intersection.
     * @returns True if the rectangle intersects the shape, false otherwise.
     */
    intersects(shape: Shape2d): boolean {
        if (shape instanceof Rect) {
            const shapeRight = shape.x + shape.width;
            const shapeBottom = shape.y + shape.height;
            const thisRight = this.x + this.width;
            const thisBottom = this.y + this.height;

            const insideRight = shapeRight >= this.x && shape.x <= thisRight;
            const insideBottom = shapeBottom >= this.y && shape.y <= thisBottom;

            return insideRight && insideBottom;
        }

        if (shape instanceof Circle) {
            const closestX = clamp(shape.x, this.x, this.x + this.width);
            const closestY = clamp(shape.y, this.y, this.y + this.height);

            const dx = shape.x - closestX;
            const dy = shape.y - closestY;

            return dx * dx + dy * dy <= shape.squaredRadius;
        }

        return false;
    }

    /**
     * Sets the position of the rectangle.
     * @param position - The new position of the rectangle.
     * @returns The rectangle instance.
     */
    setPosition(position: Point): this;

    /**
     * Sets the position of the rectangle.
     * @param x - The x position.
     * @param y - The y position.
     * @returns The rectangle instance.
     */
    setPosition(x: number, y: number): this;

    // internal implementation
    setPosition(x: number | Point, y?: number): this {
        if (x instanceof Point) {
            this._position.copyFrom(x);
            return this.markDirty();
        }

        if (!Number.isFinite(x) || !Number.isFinite(y)) {
            logWarn(`Invalid x or y: ${x}, ${y}`);
            return this;
        }

        // note: y! is safe if we get here, because we have already checked that x and y are finite above
        // and handled point instance above. Sadly TS gets confused about the y?: number type and requires ?? null check
        // which again confuses v8 test runner - ugh.
        this._position.set(x, y!);
        return this.markDirty();
    }

    /**
     * Sets the size of the rectangle.
     * @param size - The size of the rectangle.
     * @returns The rectangle instance.
     */
    setSize(size: Size): this;

    /**
     * Sets the size of the rectangle.
     * @param width - The width of the rectangle.
     * @param height - The height of the rectangle.
     * @returns The rectangle instance.
     */
    setSize(width: number, height: number): this;

    // Implementation
    setSize(width: number | Size, height?: number): this {
        if (isSize(width)) {
            this._size.width = width.width;
            this._size.height = width.height;
        } else {
            if (!Number.isFinite(width) || !Number.isFinite(height)) {
                logWarn(`Invalid width or height: ${width}, ${height}`);
                return this;
            }

            this._size.width = width;

            // note: height! is safe if we get here, because we have already checked that width and height are finite above
            // and handled Size instance above. Sadly TS gets confused about the height?: number type and requires ?? null check
            // which again confuses v8 test runner - ugh.
            this._size.height = height!;

            return this.markDirty();
        }
        return this.markDirty();
    }

    /** @returns A string representation of the rectangle for debugging. */
    override toString() {
        return `Rect(position: ${this._position.toString()}, size: ${this._size.width}x${this._size.height})`;
    }
}
