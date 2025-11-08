/* v8 ignore file -- @preserve */
import { __DEV__ } from '../index';

/**
 * Logs a message to the console if in development mode
 * @param message - The message to log.
 */
export function logMsg(message: string): void {
    if (__DEV__) console.warn(message);
}
