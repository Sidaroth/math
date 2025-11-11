import { describe, it, expect, vi } from 'vitest';
import { LazyCacheable } from '@core/lazyCacheable';

/**
 * As LazyCacheable is an abstract class, we need to create a concrete subclass to test it.
 * The setup and overrides allow us to "observe" the internal behavior of the clas and test it.
 */
class TestCacheable extends LazyCacheable {
    public refresh = vi.fn(() => {
        this._refreshedValue = 42;
    });

    public override onRefreshed = vi.fn(() => {
        // Doesn't do anything, it's meant to be "abstract" - NoOp by default.
        // but for coverage correctness we must call super.
        super.onRefreshed();
    });

    _refreshedValue = 0;

    // Expose ensureRefreshed publicly for testing
    public testEnsureRefreshed() {
        this.ensureRefreshed();
    }

    public testMarkDirty() {
        this.markDirty();
    }

    override get isDirty(): boolean {
        return this._isDirty;
    }

    get value() {
        this.ensureRefreshed();
        return this._refreshedValue;
    }
}

describe('LazyCacheable', () => {
    it('calls refresh and onRefreshed only when dirty', () => {
        const obj = new TestCacheable();

        // First ensureRefreshed → should call refresh + onRefreshed
        obj.testEnsureRefreshed();
        expect(obj.refresh).toHaveBeenCalledTimes(1);
        expect(obj.onRefreshed).toHaveBeenCalledTimes(1);
        expect(obj.isDirty).toBe(false);

        // Second call should skip refresh/onRefreshed
        obj.testEnsureRefreshed();
        expect(obj.refresh).toHaveBeenCalledTimes(1);
        expect(obj.onRefreshed).toHaveBeenCalledTimes(1);
    });

    it('markDirty sets _isDirty to true again', () => {
        const obj = new TestCacheable();
        obj.testEnsureRefreshed();

        obj.testMarkDirty();
        expect(obj.isDirty).toBe(true);

        // Next ensureRefreshed should trigger refresh again
        obj.testEnsureRefreshed();
        expect(obj.refresh).toHaveBeenCalledTimes(2);
        expect(obj.onRefreshed).toHaveBeenCalledTimes(2);
    });

    it('updates internal cache lazily via getter', () => {
        const obj = new TestCacheable();

        expect(obj.value).toBe(42); // triggers refresh lazily
        expect(obj.refresh).toHaveBeenCalledTimes(1);

        // Should not refresh again when clean (using the value getter)
        expect(obj.value).toBeDefined();
        expect(obj.refresh).toHaveBeenCalledTimes(1);

        // Mark dirty and access again
        obj.testMarkDirty();
        expect(obj.value).toBe(42);
        expect(obj.refresh).toHaveBeenCalledTimes(2);
    });
});
