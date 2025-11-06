/**
 * Base class for all geometric shapes.
 *
 * Provides dirty checking and lazy refreshing.
 * Subclasses must implement the refresh method to update cached properties.
 */
export abstract class Geometry {
    protected _isDirty: boolean = true;

    /** Ensures all derived properties are up to date. @protected */
    protected ensureRefreshed() {
        if (!this._isDirty) {
            // If the geometry is not dirty, we can return early.
            return;
        }

        this.refresh();

        // Reset dirty flag after a refresh has been performed.
        this._isDirty = false;

        this.onRefreshed();
    }

    /** Recomputes derived geometric properties. Must be implemented by subclasses. @protected */
    protected abstract refresh(): void;

    /** Marks the geometry as dirty, triggering recalculation on next access. @protected */
    protected markDirty() {
        this._isDirty = true;
        return this;
    }

    protected onRefreshed() {
        // This method is called after the geometry has been refreshed.
        // It can be overridden by subclasses to perform additional actions after the geometry has been refreshed.
    }
}
