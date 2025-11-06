import { Point } from '../core';
import { Vector } from '../vector';
import { Rect } from './Rect';
import { Geometry } from './Geometry';

/**
 * Represents a 2D polygon defined by a set of ordered vertices.
 *
 * Provides methods for geometric operations such as centroid calculation,
 * area measurement, AABB generation, concavity detection, point containment,
 * translation, rotation, and scaling.
 *
 * Assumes vertices are defined in either clockwise or counter-clockwise order.
 * Does not support self-intersecting polygons or holes.
 */
export class Polygon extends Geometry {
    private _position: Point = new Point();

    private _edges: Vector[] = [];

    private _vertices: Point[] = [];

    private readonly _centroid: Point = new Point();

    private _aabb: Rect = new Rect();

    private _isConcave: boolean = false;

    private _area: number = 0;

    private _perimeter: number = 0;

    constructor(vertices: Point[]) {
        super();

        if (vertices.length < 3) {
            throw new Error('A polygon must have at least 3 vertices.');
        }

        this._position.copyFrom(vertices[0]);

        // To truly ensure immutability / cross-contamination, we need to clone the vertices.
        this._vertices = vertices.map((vertex) => vertex.clone());
        this.refresh();
    }

    /**
     * Returns the polygon's Axis-Aligned Bounding Box (AABB).
     *
     * @returns The polygon's AABB.
     */
    get aabb() {
        this.ensureRefreshed();
        return this._aabb;
    }

    /**
     * @returns The polygon's edges.
     */
    get edges() {
        this.ensureRefreshed();
        return this._edges;
    }

    /**
     * @returns The polygon's centroid.
     */
    get centroid() {
        this.ensureRefreshed();
        return this._centroid;
    }

    /**
     * @returns Whether the polygon is concave.
     */
    get isConcave() {
        this.ensureRefreshed();
        return this._isConcave;
    }

    /**
     * @returns The polygon's area.
     */
    get area() {
        this.ensureRefreshed();
        return this._area;
    }

    /**
     * @returns The polygon's perimeter.
     */
    get perimeter() {
        this.ensureRefreshed();
        return this._perimeter;
    }

    /**
     * @returns The polygon's position.
     */
    get position() {
        this.ensureRefreshed();
        return this._position;
    }

    /**
     * @returns The polygon's vertices.
     */
    get vertices() {
        this.ensureRefreshed();

        // Must return a clone to prevent external mutation of the polygon's vertices.
        return this._vertices.map((vertex) => vertex.clone());
    }

    /**
     * Technically this could just invalidate the prev. cache, so that
     * it only recalculates on actual get calls where cache is invalid.
     * We define it as next - current to ensure the edges points along the polygon's perimeter traversal direction.
     * This ensures that normals point outward from the polygon.
     */
    private updateEdges() {
        const edges: Vector[] = [];
        for (let index = 0; index < this._vertices.length; index += 1) {
            const current = this._vertices[index];
            // Next - wraps around to the first vertex if we're at the last.
            const next = this._vertices[(index + 1) % this._vertices.length];
            const edge = Vector.sub(next, current);
            edges.push(edge);
        }

        this._edges = edges;
    }

    /**
     * Refreshes the polygon's derived properties and caches them.
     * Must be called whenever the polygon's vertices are updated or the polygon's position is changed.
     *
     * This method is called internally by the polygon class when the polygon's vertices are updated or the polygon's position is changed.
     * It updates the polygon's derived properties and caches them in place.
     * @protected
     */
    protected refresh() {
        // We must first ensure the edges are updated before calculating the derived properties.
        this.updateEdges();

        // Calculate derived properties and cache them.
        this.calculateIsConcave();
        this.calculateCentroid();
        this.calculateAABB();
        this.calculateArea();
        this.calculatePerimeter();
    }

    /**
     * Determines whether the polygon is concave or convex using cross-product sign consistency.
     *
     * A polygon is **convex** if all of its internal angles are less than or equal to 180° —
     * equivalently, the cross product between each pair of consecutive edges must point
     * in the same general direction (have the same sign on the Z axis).
     *
     * This method checks the sign of each corner’s 2D cross product. If any vertex produces
     * a cross product with an opposite sign to the others, the polygon is concave.
     *
     * - Triangles (≤ 3 vertices) are always convex.
     * - Works for both clockwise and counter-clockwise vertex orderings.
     * - Does not handle self-intersecting (“complex”) polygons.
     *
     * @private
     * @returns Updates {@link this.isConcave} to `true` if the polygon has at least one concave angle.
     */
    private calculateIsConcave() {
        this._isConcave = false;
        const verticesCount = this._vertices.length;

        // Polygons with three or fewer vertices cannot be concave.
        if (verticesCount <= 3) {
            return;
        }

        let sign = 0;
        for (let i = 0; i < verticesCount; i += 1) {
            // Wrap around: previous → current → next.
            const prevVertex =
                this._vertices[(i + verticesCount - 1) % verticesCount];
            const currVertex = this._vertices[i];
            const nextVertex = this._vertices[(i + 1) % verticesCount];

            // Compute Z component of the 2D cross product formed by the two edges at the current vertex.
            const crossZ = Vector.cross2dFromPoints(
                prevVertex,
                currVertex,
                nextVertex,
            );

            // Determine the sign of the cross product.
            const currentSign = Math.sign(crossZ);

            // Store the sign from the first valid corner.
            if (sign === 0) {
                sign = currentSign;
                continue;
            }

            // If we find a corner with the opposite winding direction, it's concave.
            if (currentSign !== 0 && currentSign !== sign) {
                this._isConcave = true;
                return;
            }
        }
    }

    /**
     * Calculates the centroid (geometric center) of the polygon using
     * the centroid of a polygon (https://en.wikipedia.org/wiki/Centroid#Of_a_polygon)
     * formula.
     *
     * The centroid is effectively the polygon’s “center of mass,” assuming
     * uniform density. It’s the average position of all points within the shape.
     *
     * Note: The polygon must have non-zero area and valid vertex ordering
     * (clockwise or counter-clockwise) for this to be accurate.
     *
     * @returns Updates {@link this.centroid} in place.
     */
    private calculateCentroid() {
        let centerX = 0;
        let centerY = 0;
        let area = 0;

        for (let i = 0; i < this._vertices.length; i += 1) {
            const vertex = this._vertices[i];
            const nextVertex = this._vertices[(i + 1) % this._vertices.length];

            // Cross-product term between consecutive vertices. Used for signed area calculation.
            const a = vertex.x * nextVertex.y - nextVertex.x * vertex.y;

            // Weighted sum of vertex coordinates (x and y) for the centroid calculation.
            centerX += (vertex.x + nextVertex.x) * a;
            centerY += (vertex.y + nextVertex.y) * a;

            // Accumulate total signed area contribution.
            area += a;
        }

        // Shoelace formula normalization.
        area *= 0.5;

        if (area === 0) {
            console.warn(
                'Degenerate Polygon detected - Polygon has zero area - centroid cannot be calculated.',
            );
            this._centroid.set(0, 0);
            return;
        }

        // Centroid normalization factor = 6 × area.
        const factor = 6 * area;

        // Update the cached centroid point in place.
        this._centroid.set(centerX / factor, centerY / factor);
    }

    /**
     * Calculates the polygon’s Axis-Aligned Bounding Box (AABB).
     *
     * The AABB is the smallest rectangle, aligned with the coordinate axes,
     * that fully contains the polygon. It’s primarily used as a fast
     * preliminary check in collision detection systems (e.g., to skip
     * expensive SAT checks when bounding boxes don’t overlap).
     *
     * This implementation simply scans all vertices and finds the minimum
     * and maximum X/Y coordinates.
     *
     * @returns Updates {@link this.aabb} with the new bounding rectangle.
     */
    private calculateAABB() {
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        // Iterate over all vertices to find the outermost bounds.
        for (const vertex of this._vertices) {
            minX = Math.min(minX, vertex.x);
            maxX = Math.max(maxX, vertex.x);
            minY = Math.min(minY, vertex.y);
            maxY = Math.max(maxY, vertex.y);
        }

        // Construct a Rect representing the bounding box.
        // Width and height are derived from the min/max coordinate extents.
        this._aabb = new Rect(minX, minY, maxX - minX, maxY - minY);
    }

    /**
     * Computes the signed area of the polygon using the
     * shoelace formula (https://en.wikipedia.org/wiki/Shoelace_formula).
     *
     * A positive area indicates the vertices are ordered counter-clockwise,
     * while a negative value indicates a clockwise order.
     *
     * The absolute value of the result represents the polygon’s true area.
     *
     * @returns Updates {@link this.area} with the new signed area.
     */
    private calculateArea() {
        let area = 0;

        for (let i = 0; i < this._vertices.length; i += 1) {
            const vertex = this._vertices[i];
            const nextVertex = this._vertices[(i + 1) % this._vertices.length];

            // Add the cross-product term of the current and next vertex.
            area += vertex.x * nextVertex.y - nextVertex.x * vertex.y;
        }

        this._area = area * 0.5;
    }

    /**
     * Calculates the perimeter of the polygon.
     *
     * @returns Updates {@link this.perimeter} with the new perimeter.
     */
    private calculatePerimeter() {
        let perimeter = 0;
        const n = this._vertices.length;
        for (let i = 0; i < n; i += 1) {
            const a = this._vertices[i];
            const b = this._vertices[(i + 1) % n];
            perimeter += a.distance(b);
        }

        this._perimeter = perimeter;
    }

    /**
     * Sets the polygon’s position to a new point.
     *
     * @param posX - The new X position.
     * @param posY - The new Y position.
     * @returns Updates the polygon’s position and derived properties.
     */
    setPosition(posX: number, posY: number) {
        const pos = new Point(posX, posY);

        const currentPos = this._position;
        // We want to move each vertex in the polygon by the difference between the new position and the old position.
        const change = Point.subtract(pos, currentPos);
        this.translate(change);

        // Update the position of the polygon - defined as the first vertex.
        const newPosition = this._vertices[0];
        this._position = newPosition;
        return this.markDirty();
    }

    /**
     * Rotates the polygon around a given pivot point by the specified angle.
     *
     * @param angle - Rotation in radians.
     * @param pivot - Point to rotate around. Defaults to the polygon’s first vertex.
     * @returns Updates vertex positions and recalculates edges and derived properties.
     */
    rotateBy(angle: number, pivot = this._vertices[0]) {
        // Rotate each vertex around the pivot point.
        for (const vertex of this._vertices) {
            vertex.rotate(angle, pivot);
        }

        return this.markDirty();
    }

    /**
     * Determines whether a given point lies inside the polygon using the
     * ray-casting (even–odd) algorithm.
     *
     * A horizontal ray is projected to the right from the point, and each edge
     * of the polygon is tested for intersection with that ray. If the ray
     * crosses the polygon an odd number of times, the point is considered
     * inside; if even, it's outside.
     *
     * This method works for both convex and concave polygons but does not
     * handle polygons with holes or self-intersecting shapes.
     *
     * @param point - The point to test for containment.
     * @returns If the point lies inside the polygon.
     */
    containsPoint(point: Point) {
        let inside = false;
        const vertexCount = this._vertices.length;

        for (let current = 0; current < vertexCount; current += 1) {
            const next = (current + 1) % vertexCount;
            const currentVertex = this._vertices[current];
            const nextVertex = this._vertices[next];

            // check if the ray crosses the polygon's edge
            const crossesVerticalSpan =
                currentVertex.y > point.y !== nextVertex.y > point.y;

            if (!crossesVerticalSpan) {
                continue;
            }

            // Represent the edge as a vector from currentVertex to nextVertex.
            const edge = Vector.sub(nextVertex, currentVertex);

            // Find normalized intersection factor along the edge (0–1 range).
            const t = (point.y - currentVertex.y) / edge.y;

            // Compute the X coordinate where the ray would intersect this edge.
            const intersectX = currentVertex.x + edge.x * t;

            // If the intersection is to the right of the point, toggle the inside state.
            if (point.x < intersectX) {
                inside = !inside;
            }
        }

        return inside;
    }

    /**
     * Moves all vertices of the polygon by a specified offset vector.
     *
     * @param offset - The translation vector.
     * @returns Updates the polygon’s vertices and derived properties.
     */
    translate(offset: Point) {
        for (const vertex of this._vertices) {
            vertex.add(offset);
        }

        return this.markDirty();
    }

    /**
     * Scales the polygon uniformly around a pivot point.
     *
     * @param scale - The scaling factor (1 = no change, 2 = double size, etc.).
     * @param pivot - The pivot point to scale around. Defaults to the polygon’s centroid.
     * @returns Updates vertex positions and recalculates edges and derived properties.
     */
    scale(scale: number, pivot = this._centroid) {
        for (const vertex of this._vertices) {
            vertex.subtract(pivot).multiply(scale).add(pivot);
        }

        return this.markDirty();
    }

    addVertex(vertex: Point) {
        this._vertices.push(vertex);
        return this.markDirty();
    }

    removeVertex(index: number) {
        if (this._vertices.length === 3) {
            console.warn('A polygon must always have at least 3 vertices.');
            return;
        }

        this._vertices.splice(index, 1);
        return this.markDirty();
    }

    updateVertex(index: number, vertex: Point) {
        this._vertices[index] = vertex;
        return this.markDirty();
    }

    /**
     * Creates a deep copy of the polygon.
     *
     * @returns A new polygon instance with cloned vertices and identical properties.
     */
    clone() {
        const clone = new Polygon(
            this._vertices.map((vertex) => vertex.clone()),
        );
        clone.setPosition(this._position.x, this._position.y);
        return clone;
    }

    /**
     * Returns a string representation of the polygon for debugging.
     *
     * @returns A string listing vertex coordinates.
     */
    override toString() {
        return `Polygon(vertices: ${this._vertices.map((vertex) => vertex.toString()).join(', ')})`;
    }
}
