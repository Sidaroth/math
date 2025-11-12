import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Pool } from '@utils/pool';

describe('Pool', () => {
    // Whomever uses the pool needs some form of Item to pool - it must be defined outside the pool class itself.
    interface Item {
        x: number;
        y: number;
    }

    // The factory and reset functions are defined as types outside the pool class itself.
    type Factory = () => Item;
    type Reset = (item: Item) => void;

    // The factory and reset functions are spied on using the types defined above.
    let factorySpy: ReturnType<typeof vi.fn<Factory>>;
    let resetSpy: ReturnType<typeof vi.fn<Reset>>;

    beforeEach(() => {
        factorySpy = vi.fn<Factory>(() => ({ x: 0, y: 0 }));
        resetSpy = vi.fn<Reset>((item) => {
            item.x = 0;
            item.y = 0;
        });
    });

    it('creates an empty pool when no initial size is provided', () => {
        const pool = new Pool<Item>({ factory: factorySpy });
        expect(pool.size).toBe(0);
        expect(factorySpy).not.toHaveBeenCalled();
    });

    it('preallocates items when initialSize is provided', () => {
        const pool = new Pool<Item>({ factory: factorySpy, intialSize: 3 });
        // 3 items should be created and stored
        expect(factorySpy).toHaveBeenCalledTimes(3);
        expect(pool.size).toBe(3);
    });

    it('acquire() returns items from the pool when available', () => {
        const pool = new Pool<Item>({ factory: factorySpy });
        pool.preallocate(2);

        const item1 = pool.acquire();
        const item2 = pool.acquire();

        expect(factorySpy).toHaveBeenCalledTimes(2);
        expect(pool.size).toBe(0);
        // both came from preallocated list, not freshly created now
        expect(item1).toHaveProperty('x', 0);
        expect(item2).toHaveProperty('y', 0);
    });

    it('acquire() creates a new item if pool is empty', () => {
        const pool = new Pool<Item>({ factory: factorySpy });
        const item = pool.acquire();
        expect(item).toStrictEqual({ x: 0, y: 0 });
        expect(factorySpy).toHaveBeenCalledTimes(1);
    });

    it('release() pushes item back and calls reset() if provided', () => {
        const pool = new Pool<Item>({
            factory: factorySpy,
            reset: resetSpy,
        });

        const obj = { x: 5, y: 10 };
        pool.release(obj);

        expect(resetSpy).toHaveBeenCalledOnce();
        expect(resetSpy).toHaveBeenCalledWith(obj);
        expect(pool.size).toBe(1);
        // Verify it actually reset values
        expect(obj.x).toBe(0);
        expect(obj.y).toBe(0);
    });

    it('release() works correctly without a reset callback', () => {
        const pool = new Pool<Item>({ factory: factorySpy });
        const obj = { x: 5, y: 10 };
        pool.release(obj);
        expect(pool.size).toBe(1);
        expect(obj).toStrictEqual({ x: 5, y: 10 }); // unchanged
    });

    it('preallocate() adds missing items only', () => {
        const pool = new Pool<Item>({ factory: factorySpy });
        pool.preallocate(5);
        expect(factorySpy).toHaveBeenCalledTimes(5);
        expect(pool.size).toBe(5);

        // Add fewer than current size -> no new factory calls
        pool.preallocate(3);
        expect(factorySpy).toHaveBeenCalledTimes(5);
        expect(pool.size).toBe(5);
    });

    it('clear() empties all items from the pool', () => {
        const pool = new Pool<Item>({ factory: factorySpy, intialSize: 4 });
        expect(pool.size).toBe(4);
        pool.clear();
        expect(pool.size).toBe(0);
    });

    it('handles mixed acquire/release/preallocate sequence correctly', () => {
        const pool = new Pool<Item>({
            factory: factorySpy,
            reset: resetSpy,
            intialSize: 2,
        });

        const a = pool.acquire();
        const b = pool.acquire();
        expect(pool.size).toBe(0);

        // both used, pool empty
        pool.release(a);
        expect(pool.size).toBe(1);
        pool.preallocate(3); // should add 2 more
        expect(pool.size).toBe(3);

        pool.release(b);
        expect(pool.size).toBe(4);
        expect(resetSpy).toHaveBeenCalledTimes(2);
    });

    it('ignores zero or negative preallocation requests', () => {
        const pool = new Pool<Item>({ factory: factorySpy });
        pool.preallocate(0);
        expect(pool.size).toBe(0);
        pool.preallocate(-5);
        expect(pool.size).toBe(0);
        expect(factorySpy).not.toHaveBeenCalled();
    });

    it('calls factory only when pool is empty and item requested', () => {
        const pool = new Pool<Item>({ factory: factorySpy });
        pool.preallocate(2);

        expect(pool.size).toBe(2);

        pool.acquire(); // uses existing
        pool.acquire(); // uses existing
        pool.acquire(); // triggers factory

        expect(factorySpy).toHaveBeenCalledTimes(3);
        expect(pool.size).toBe(0);
    });
});
