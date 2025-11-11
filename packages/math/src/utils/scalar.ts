/**
 * Clamps a numeric value between a minimum and maximum range.
 * @param value - The input value to constrain.
 * @param min - The lower bound.
 * @param max - The upper bound.
 * @returns The clamped value.
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

/**
 * Linearly interpolates between two values.
 * @param start - The start value.
 * @param end - The end value.
 * @param t - The interpolation factor, typically in the range [0, 1].
 * @returns The interpolated value.
 */
export function lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
}

/**
 * Linearly interpolates between two values, clamped to the range [0, 1].
 * @param start - The start value.
 * @param end - The end value.
 * @param t - The interpolation factor, typically in the range [0, 1].
 * @returns The interpolated value.
 */
export function lerpClamped(start: number, end: number, t: number): number {
    return lerp(start, end, clamp(t, 0, 1));
}

/**
 * Calculates the normalized interpolation factor `t` between two values within a range.
 * Essentially the inverse of {@link lerp}.
 * @param start - The start of the first range.
 * @param end - The end of the first range.
 * @param value - The value to normalize.
 * @returns The normalized interpolation factor `t`. May be outside the range [0, 1] if `value` is outside the range [start, end].
 */
export function inverseLerp(start: number, end: number, value: number): number {
    // Avoid division by zero if start and end are the same.
    if (start === end) return 0;

    return (value - start) / (end - start);
}

/**
 * Remaps a value from one range to another.
 * @param value - The value to remap.
 * @param inMin - The start of the input range.
 * @param inMax - The end of the input range.
 * @param outMin - The start of the output range.
 * @param outMax - The end of the output range.
 * @returns The remapped value.
 */
export function remap(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number,
): number {
    // apply the inverse lerp to the input value to get a normalized value
    const t = inverseLerp(inMin, inMax, value);

    // apply the lerp to the output range to get the remapped value
    return lerp(outMin, outMax, t);
}

/**
 * Smoothly interpolates between 0 and 1 using a cubic Hermite curve.
 * Produces an S-shaped transition that starts and ends gently.
 * Formula: f(t) = 3t^2 - 2t^3
 * @see {@link https://en.wikipedia.org/wiki/Smoothstep}
 * @see {@link https://en.wikipedia.org/wiki/Hermite_interpolation}
 *
 * @param t - The interpolation factor, typically in the range [0, 1].
 * @returns The smoothed interpolation factor.
 */
export function smoothstep(t: number): number {
    const x = clamp(t, 0, 1);
    return x * x * (3 - 2 * x);
}

/**
 * A smoother variant of {@link smoothstep} using a quintic Hermite curve.
 * Provides an even gentler transition with continuous first and second derivatives; starts and ends even more smoothly.
 * Formula: f(t) = 6t^5 - 15t^4 + 10t^3
 * @see {@link https://en.wikipedia.org/wiki/Smoothstep#Variations}
 * @see {@link https://en.wikipedia.org/wiki/Hermite_interpolation}
 *
 * @param t - The interpolation factor, typically in the range [0, 1].
 * @returns The smoothed interpolation factor.
 */
export function smootherstep(t: number): number {
    const x = clamp(t, 0, 1);
    return x * x * x * (x * (x * 6 - 15) + 10);
}

/**
 * Applies a quadratic ease-in function (accelerates from zero velocity).
 * Formula: f(t) = t^2
 * @see {@link https://easings.net/#easeInQuad}
 *
 * @param t - The interpolation factor, typically in [0, 1].
 * @returns The eased value.
 */
export function easeInQuad(t: number): number {
    const x = clamp(t, 0, 1);
    return x * x;
}

/**
 * Applies a quadratic ease-out function (decelerates to zero velocity).
 * Formula: f(t) = t(2 - t)
 * @see {@link https://easings.net/#easeOutQuad}
 * @note The formula here is algebraically simplified for performance (fewer operations).
 *
 * @param t - The interpolation factor, typically in [0, 1].
 * @returns The eased value.
 */
export function easeOutQuad(t: number): number {
    const x = clamp(t, 0, 1);
    return x * (2 - x);
}

/**
 * Applies a symmetric ease-in/ease-out quadratic function.
 * Accelerates halfway, then decelerates.
 *
 * Formula:
 * f(t) = 2t²          for t < 0.5
 * f(t) = -1 + (4 - 2t)t  for t ≥ 0.5
 *
 * @see {@link https://easings.net/#easeInOutQuad}
 * @note The formula here is algebraically simplified for performance (fewer operations).
 *
 * @param t - The interpolation factor, typically in [0, 1].
 * @returns The eased value.
 */
export function easeInOutQuad(t: number): number {
    const x = clamp(t, 0, 1);
    return x < 0.5 ? 2 * x * x : -1 + (4 - 2 * x) * x;
}
