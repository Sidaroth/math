import { bench, describe } from 'vitest';
import { Pool } from '@utils/pool';

describe('Pool performance', () => {
    const pool = new Pool({
        factory: () => ({ x: 0, y: 0 }),
        intialSize: 1000,
    });

    bench('Pool.acquire()', () => {
        pool.acquire();
    });

    bench('Pool.release()', () => {
        const item = pool.acquire();
        pool.release(item);
    });

    bench('Pool.clear()', () => {
        pool.clear();
    });

    bench('Pool.preallocate()', () => {
        const freshPool = new Pool({ factory: () => ({ x: 0, y: 0 }) });
        freshPool.preallocate(100);
    });
});
