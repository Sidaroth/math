/**
 * Pre-calculated constants for angle conversion.
 * @constant TWO_PI - 2π.
 */
export const TWO_PI = 2 * Math.PI;

/**
 * Pre-calculated constant for degrees to radians conversion.
 * @constant DEG2RAD - π/180.
 */
export const DEG2RAD = Math.PI / 180;

/**
 * Pre-calculated constant for radians to degrees conversion.
 * @constant RAD2DEG - 180/π.
 */
export const RAD2DEG = 180 / Math.PI;

/**
 * Converts a value from degrees to radians.
 * @param degrees The value in degrees.
 * @returns The value in radians.
 */
export function degreesToRadians(degrees: number): number {
    return degrees * DEG2RAD;
}

/**
 * Converts a value from radians to degrees.
 * @param radians The value in radians.
 * @returns The value in degrees.
 */
export function radiansToDegrees(radians: number): number {
    return radians * RAD2DEG;
}

/**
 * Normalizes an angle (in radians) to the range [0, 2π).
 *
 * Handles both positive and negative inputs safely, ensuring the result always
 * lies within one full revolution. This implementation also corrects for
 * floating-point precision drift that can occur when the input angle is a
 * multiple of 2π.
 *
 * Why this matters:
 * In JavaScript (and most languages), Math.PI and 2 * Math.PI are stored as
 * finite-precision IEEE-754 floating point numbers. This means operations like
 * (100 * Math.PI) % (2 * Math.PI) may yield a result very slightly below 2π
 * (e.g., 6.283185307179572) instead of exactly 0, because the internal
 * representation of π isn’t exact. Over many revolutions, these rounding
 * errors accumulate.
 *
 * To prevent this, we clamp results that are within a small epsilon of 2π
 * back to 0, ensuring consistent wrapping behavior.
 *
 * @param angle - The angle to normalize, in radians.
 * @returns The normalized angle in the range [0, 2π).
 */
export function normalizeAngle(angle: number): number {
    // Ensure the angle is positive by adding 2π until it is.
    // Then take modulo 2π to get the angle in the range [0, 2π).
    // This ensures that the angle is always in the range [0, 2π) regardless of its sign.
    const normalized = ((angle % TWO_PI) + TWO_PI) % TWO_PI;

    // Correct for small floating-point drift at the upper boundary.
    // Example: (100 * Math.PI) % (2 * Math.PI) may yield 6.283185307179572
    // instead of 0 due to IEEE-754 precision limits.
    return Math.abs(normalized - TWO_PI) < 1e-12 ? 0 : normalized;
}
