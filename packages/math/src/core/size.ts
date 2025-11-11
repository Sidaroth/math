export interface Size {
    width: number;
    height: number;
}

/**
 * Checks if a given object is a Size object. Could theoretically limit it to positive numbers only.
 * But that would limits its usefulness in other math applications.
 * @param size - The size to check.
 * @returns True if the size is a valid Size object, false otherwise.
 */
export function isSize(size: unknown): size is Size {
    if (!size) return false;
    if (typeof size !== 'object') return false;

    return (
        Number.isFinite((size as Size).width) &&
        Number.isFinite((size as Size).height)
    );
}
