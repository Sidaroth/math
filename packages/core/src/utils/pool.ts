export interface PoolOptions<T> {
    /**
     * Factory function used to create new instances when the pool is empty
     * or when preallocating items.
     *
     * @returns A new instance of T.
     */
    factory: () => T;
    /**
     * The number of items to preallocate when the pool is first created.
     * Defaults to `0`. If greater than zero, the pool immediately fills itself
     * by calling the factory the specified number of times.
     */
    intialSize?: number;

    /**
     * Optional reset function applied to an item before it’s returned to the pool.
     *
     * This function is used to restore the object to a known baseline state
     * before it's reused - for example, zeroing fields, clearing arrays, or resetting
     * flags. It will only be called when `release()` is called on the item.
     *
     * This is wasteful if the item does not need to be reset between uses - in which case leave the reset function empty.
     *
     * @example
     * // Example: reusable temporary point
     * const pool = new Pool({
     *   factory: () => ({ x: 0, y: 0 }),
     *  // Whenever an item is released back into the pool, the reset function will be called on it.
     *   reset: (p) => { p.x = 0; p.y = 0; },
     * });
     *
     * const item = pool.acquire();
     * // When using the item, you can modify it as you wish
     * item.x= 5;
     *
     * // item.x will be reset to 0 when it is released back into the pool.
     * pool.release(item);
     */
    reset?: (item: T) => void;
}

/**
 * A generic object pool for recycling and reusing instances of T.
 *
 * Useful for avoiding frequent heap allocations in performance-sensitive paths,
 * such as physics systems, particle updates, or geometry builders.
 *
 * @template T - The type of objects stored in the pool.
 *
 * @example
 * // Preallocate 100 ready-to-use objects
 * const pool = new Pool({
 *   factory: () => ({ x: 0, y: 0 }),
 *   intialSize: 100,
 *   reset: (item) => { item.x = 0; item.y = 0; },
 * });
 * console.log(pool.size); // 100 - preallocated.
 *
 * const a = pool.acquire();
 * const b = pool.acquire();
 * console.log(pool.size); // 98 left in pool
 *
 * pool.release(a);
 * console.log(pool.size); // 99
 *
 * pool.preallocate(200);  // ensure at least 200 items exist
 * console.log(pool.size); // 200
 *
 * pool.clear();
 * console.log(pool.size); // 0
 */
export class Pool<T> {
    private readonly items: T[] = [];
    private readonly factory: () => T;
    private readonly reset?: (item: T) => void;

    constructor(options: PoolOptions<T>) {
        this.factory = options.factory;
        this.reset = options.reset;
        if (options.intialSize && options.intialSize > 0) {
            this.preallocate(options.intialSize);
        }
    }

    /** @returns The current number of free items available in the pool. */
    get size(): number {
        return this.items.length;
    }

    /**
     * Acquires an item from the pool. If the pool is empty, a new item is created using the factory function.
     *
     * @returns An item from the pool.
     */
    acquire(): T {
        return this.items.pop() ?? this.factory();
    }

    /**
     * Releases an item back into the pool for future reuse.
     *
     * If a reset function is provided, it will be called on the item before it is released back into the pool.
     *
     * @param item - The item to release.
     */
    release(item: T): void {
        if (this.reset) {
            this.reset(item);
        }

        this.items.push(item);
    }

    /** Remove all stored items from the pool. */
    clear(): void {
        this.items.length = 0;
    }

    /**
     * Ensure that at least `count` items exist in the pool.
     * If the current pool already contains that many, nothing happens.
     *
     * @note This sets the minimum size, not an additive count.
     *
     * @example
     * const pool = new Pool({ factory: () => ({}) });
     * pool.preallocate(10); // fills 10 new
     * pool.preallocate(5);  // does nothing
     * console.log(pool.size); // 10
     *
     * pool.preallocate(20); // fills 10 more
     * console.log(pool.size); // 20
     *
     * @param count - The minimum number of items to ensure in the pool.
     */
    preallocate(count: number): void {
        const missing = count - this.items.length;
        for (let i = 0; i < missing; i += 1) {
            this.items.push(this.factory());
        }
    }
}
