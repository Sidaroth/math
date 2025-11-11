import { bench, describe } from 'vitest';
import { Rect } from '@geometry/rect';

describe('LazyCacheable performance', () => {
    const rect = new Rect(0, 0, 100, 100);
    // Ensure we have no stale cache at the start of the benchmark.
    rect['refresh']();

    bench('LazyCacheable.ensureRefreshed() (cached)', () => {
        // Access to trigger cache hit (no refresh) -- assuming no dirty state.
        void rect.x;
    });

    bench('LazyCacheable.ensureRefreshed() (dirty)', () => {
        // Force dirty state
        rect['markDirty']();
        // access to trigger refresh
        void rect.x;
    });
});
