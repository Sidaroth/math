/**
 * Base class for all lazy cacheable objects.
 *
 * Provides dirty checking and lazy refreshing.
 * Subclasses must implement the refresh method to update internal cache.
 */
export abstract class LazyCacheable {
    protected _isDirty: boolean = true;

    /** Ensures all derived properties are up to date. @protected */
    protected ensureRefreshed() {
        if (!this._isDirty) {
            // If the state is not dirty, we can return early.
            return;
        }

        this.refresh();

        // Reset dirty flag after the internal state has been refreshed.
        this._isDirty = false;

        // Call the onRefreshed method to allow subclasses to perform additional actions after the internal state has been refreshed.
        this.onRefreshed();
    }

    /** Recomputes derived properties and caches them. Must be implemented by subclasses. @protected */
    protected abstract refresh(): void;

    /** Marks the internal state as dirty, triggering recalculation on next access. @protected */
    protected markDirty() {
        this._isDirty = true;
        return this;
    }

    /** Called after the internal state has been refreshed. @protected */
    protected onRefreshed() {
        // This method is called after the internal state has been refreshed.
        // It can be overridden by subclasses to perform additional actions after the internal state has been refreshed.
    }
}
