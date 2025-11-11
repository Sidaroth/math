import { __DEV__ } from '@src/index';

/** Represents a possibly async method return value. */
type MaybePromise<T> = T | Promise<T>;

/** Generic method signature for class methods (sync or async). */
export type Method<This, Args extends any[], Return> = (
    this: This,
    ...args: Args
) => MaybePromise<Return>;

/** The inferred decorator context type for class methods. */
export type MethodContext<
    This,
    Args extends any[],
    Return,
> = ClassMethodDecoratorContext<This, Method<This, Args, Return>>;

/** The expected return type of a decorator wrapping a class method. */
export type MethodDecoratorResult<This, Args extends any[], Return> = (
    this: This,
    ...args: Args
) => MaybePromise<Return>;

// Actual timing decorator implementation
interface TimingStat {
    totalMs: number;
    count: number;
}

const timingStats = new Map<string, TimingStat>();

/**
 * A method decorator that measures and logs execution time for both sync and async methods.
 * Tracks:
 *  - total time (ms)
 *  - number of calls
 *  - average time per call
 *
 * Usage:
 * ```ts
 * @timing
 * myMethod() { ... }
 * ```
 *
 * @param target - The target object.
 * @param context - The context of the method.
 * @returns A function that wraps the original method and logs the time it took to execute.
 */
export function timing<This, Args extends any[], Return>(
    target: Method<This, Args, Return>,
    context: MethodContext<This, Args, Return>,
): MethodDecoratorResult<This, Args, Return> {
    const name = String(context.name);

    // If we're in production, skip wrapping to avoid overhead
    if (!__DEV__) return target;
    const isAsync = target.constructor.name === 'AsyncFunction';

    if (isAsync) {
        return timeAsync<This, Args, Return>(name, target);
    } else {
        return timeSync<This, Args, Return>(name, target);
    }
}

/** Wraps an async method and tracks the execution time. */
function timeAsync<This, Args extends any[], Return>(
    name: string,
    target: (this: This, ...args: Args) => MaybePromise<Return>,
): MethodDecoratorResult<This, Args, Return> {
    return async function (this: This, ...args: Args): Promise<Return> {
        const start = performance.now();
        try {
            const result = await target.apply(this, args);
            recordTiming(name, performance.now() - start);
            return result;
        } catch (err) {
            console.warn(`⚠️ ${name} failed`);
            throw err;
        }
    };
}

/** Wraps a sync method and tracks the execution time. */
function timeSync<This, Args extends any[], Return>(
    name: string,
    target: (this: This, ...args: Args) => MaybePromise<Return>,
): MethodDecoratorResult<This, Args, Return> {
    return function (this: This, ...args: Args): MaybePromise<Return> {
        const start = performance.now();
        try {
            const result = target.apply(this, args);
            recordTiming(name, performance.now() - start);
            return result;
        } catch (err) {
            console.warn(`⚠️ ${name} failed`);
            throw err;
        }
    };
}

/** Adds the timing data to the global map. */
function recordTiming(name: string, ms: number): void {
    const stat = timingStats.get(name) ?? { totalMs: 0, count: 0 };
    stat.totalMs += ms;
    stat.count++;
    timingStats.set(name, stat);
}

/** Retrieve current timing stats (e.g. after a benchmark run). */
export function getTimingStats(): string {
    if (timingStats.size === 0) return 'No timing data recorded';

    const sorted = [...timingStats.entries()].toSorted(
        (a, b) => b[1].totalMs - a[1].totalMs,
    );

    const lines = sorted.map(([name, stat]) => {
        const avg = stat.totalMs / stat.count;
        return `${name}: ${stat.totalMs.toFixed(3)} ms total  |  ${stat.count} calls  |  avg ${avg.toFixed(3)} ms`;
    });

    return lines.join('\n');
}

/** Reset the timing stats. */
export function resetTimingStats(): void {
    timingStats.clear();
}
