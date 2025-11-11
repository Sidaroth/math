import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Polygon } from '@geometry/polygon';
import { Point } from '@core/point';

describe('Polygon', () => {
    let triangle: Polygon;
    let square: Polygon;
    let concave: Polygon;

    beforeEach(() => {
        triangle = new Polygon([
            new Point(0, 0),
            new Point(1, 0),
            new Point(0, 1),
        ]);

        square = new Polygon([
            new Point(0, 0),
            new Point(2, 0),
            new Point(2, 2),
            new Point(0, 2),
        ]);

        concave = new Polygon([
            new Point(0, 0),
            new Point(4, 0),
            new Point(2, 1), // inward dent (concavity)
            new Point(4, 4),
            new Point(0, 4),
        ]);

        vi.clearAllMocks();
    });

    it('throws when less than 3 vertices are provided', () => {
        expect(() => new Polygon([new Point(0, 0), new Point(1, 1)])).toThrow();
    });

    it('creates a polygon and clones input vertices', () => {
        const pts = [new Point(1, 1), new Point(2, 1), new Point(1, 2)];
        const poly = new Polygon(pts);
        expect(poly.vertices).not.toBe(pts); // should clone
        expect(poly.vertices.length).toBe(3);
    });

    it('calculates AABB, centroid, area, perimeter, and edges correctly', () => {
        // Trigger full refresh
        square['refresh']();

        const aabb = square.aabb;
        expect(aabb.x).toBe(0);
        expect(aabb.y).toBe(0);
        expect(aabb.width).toBe(2);
        expect(aabb.height).toBe(2);

        expect(square.area).toBeCloseTo(4);
        expect(square.perimeter).toBeCloseTo(8);
        expect(square.centroid.x).toBeCloseTo(1);
        expect(square.centroid.y).toBeCloseTo(1);
        expect(square.edges.length).toBe(4);
    });

    it('detects concave polygons', () => {
        concave['refresh']();
        expect(concave.isConcave).toBe(true);
    });

    it('detects convex polygons (square)', () => {
        square['refresh']();
        expect(square.isConcave).toBe(false);
    });

    it('detects convex polygons (triangle)', () => {
        triangle['refresh']();
        expect(triangle.isConcave).toBe(false);
    });

    it('handles degenerate zero-area polygon in centroid calculation', () => {
        const flat = new Polygon([
            new Point(0, 0),
            new Point(1, 0),
            new Point(2, 0),
        ]);
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        flat['calculateCentroid']();
        expect(warn).toHaveBeenCalled();
        expect(flat['centroid'].x).toBe(0);
        warn.mockRestore();
    });

    it('returns cloned vertices from getter', () => {
        const verts = square.vertices;
        verts[0].set(999, 999);
        expect(square.vertices[0].x).not.toBe(999);
    });

    it('setPosition(Point) updates correctly', () => {
        const p = new Point(5, 5);
        square.setPosition(p);
        expect(square.position.x).toBe(5);
        expect(square.position.y).toBe(5);
    });

    it('setPosition(x, y) translates correctly', () => {
        square.setPosition(10, 10);
        expect(square.position.x).toBe(10);
        expect(square.position.y).toBe(10);
    });

    it('translate() moves all vertices', () => {
        square.translate(new Point(1, 1));
        expect(square.vertices[0].x).toBeCloseTo(1);
        expect(square.vertices[0].y).toBeCloseTo(1);
    });

    it('rotateBy() rotates vertices around centroid', () => {
        const before = square.vertices.map((v) => v.clone());
        square['refresh']();
        square.rotateBy(Math.PI / 2);
        const after = square.vertices;
        // Coordinates should differ after rotation
        expect(after[0].x).not.toBe(before[0].x);
    });

    it('scale() scales polygon around centroid', () => {
        square['refresh']();
        const before = square.aabb.width;
        square.scale(2);
        expect(square.aabb.width).toBeCloseTo(before * 2);
    });

    it('containsPoint() detects inside/outside points correctly', () => {
        square['refresh']();
        expect(square.containsPoint(new Point(1, 1))).toBe(true);
        expect(square.containsPoint(new Point(5, 5))).toBe(false);
    });

    it('addVertex() adds vertex and marks dirty', () => {
        const len = square.vertices.length;
        square.addVertex(new Point(3, 3));
        expect(square.vertices.length).toBe(len + 1);
    });

    it('removeVertex() removes vertex if > 3 vertices', () => {
        const len = square.vertices.length;
        square.removeVertex(0);
        expect(square.vertices.length).toBe(len - 1);
    });

    it('removeVertex() warns when trying to go below 3 vertices', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        triangle.removeVertex(0);
        expect(warn).toHaveBeenCalled();
        warn.mockRestore();
    });

    it('updateVertex() updates vertex correctly', () => {
        const newV = new Point(99, 99);
        square.updateVertex(0, newV);
        expect(square.vertices[0].x).toBe(99);
    });

    it('updateVertex() warns on invalid index', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        square.updateVertex(999, new Point(0, 0));
        expect(warn).toHaveBeenCalled();
        warn.mockRestore();
    });

    it('clone() creates a deep copy', () => {
        const clone = square.clone();
        expect(clone).not.toBe(square);
        expect(clone.vertices[0].x).toBe(square.vertices[0].x);
    });

    it('toString() returns readable string', () => {
        const str = square.toString();
        expect(str).toContain('Polygon(');
        expect(str).toContain('vertices:');
    });
});
