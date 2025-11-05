import { Point } from '../core';
import { clamp } from '../utils';
import { Vector } from '../vector';
import { Circle } from './Circle';

type Shape = Rect | Circle;

export interface Size {
    width: number;
    height: number;
}

function isSize(value: unknown): value is Size {
    return typeof value === 'object' && value !== null && 'width' in value && 'height' in value;
}

export class Rect implements Size{
    x: number = 0;

    y: number = 0;

    width: number = 0;

    height: number = 0;

    constructor(x: number = 0, y: number = 0, width: number = 0, height: number = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    contains(point: Point): boolean {
        const insideX = point.x >= this.x && point.x < this.x + this.width;
        const insideY = point.y >= this.y && point.y < this.y + this.height;

        return insideX && insideY;
    }

    vertices(): Point[] {
        const vertices = [
            new Point(this.x, this.y),
            new Point(this.x + this.width, this.y),
            new Point(this.x + this.width, this.y + this.height),
            new Point(this.x, this.y + this.height),
        ];

        return vertices;
    }

    intersects(shape: Shape): boolean {
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
            const dist = new Vector(shape.x - closestX, shape.y - closestY);

            return dist.squaredLength() < shape.squaredRadius;
        }

        return false;
    }

    setPosition(x: number | Point, y?: number): this {
        if (x instanceof Point) {
            this.x = x.x;
            this.y = x.y;
            return this;
        }

        // We should always get both x and y if we get here.
        if (x !== undefined && y !== undefined) {
            this.x = x;
            this.y = y;
        }

        return this;
    }

    setSize(width: number | Size, height?: number): this {
        if (isSize(width)) {
            this.width = width.width;
            this.height = width.height;
            return this;
        }

        this.width = width;
        this.height = height ?? 0;

        return this;
    }
}
