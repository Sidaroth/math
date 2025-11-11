import { Rect } from './rect';
import { Circle } from './circle';
import { Polygon } from './polygon';
import { Line } from './line';

export type Shape2d = Rect | Circle | Polygon | Line /* | Triangle | ... */;

/**
 * Checks if a given object is a shape2d.
 * @param shape - The object to check.
 * @returns True if the object is a shape2d, false otherwise.
 */
export function isShape2d(shape: unknown): shape is Shape2d {
    if (!shape) return false;

    return (
        shape instanceof Rect ||
        shape instanceof Circle ||
        shape instanceof Polygon ||
        shape instanceof Line
    );
}
