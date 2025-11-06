export interface Size {
    width: number;
    height: number;
}

export function isSize(size: unknown): size is Size {
    if (!size) return false;

    return typeof size === 'object' && 'width' in size && 'height' in size;
}
