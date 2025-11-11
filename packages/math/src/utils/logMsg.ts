/* v8 ignore file -- @preserve */

import { __DEV__ } from '@src/index';

/**
 * Logs a warning message to the console if in development mode
 * @param message - The message to log.
 */
export function logWarn(message: string): void {
    if (__DEV__) console.warn(message);
}

/**
 * Logs an info message to the console if in development mode
 * @param message - The message to log.
 */
export function logInfo(message: string): void {
    if (__DEV__) console.info(message);
}

/**
 * Logs a debug message to the console if in development mode
 * @param message - The message to log.
 */
export function logDebug(message: string): void {
    if (__DEV__) console.debug(message);
}

/**
 * Logs a trace message to the console if in development mode
 * @param message - The message to log.
 */
export function logTrace(message: string): void {
    if (__DEV__) console.trace(message);
}

/**
 * Logs an error message to the console if in development mode
 * @param message - The message to log.
 */
export function logError(message: string): void {
    if (__DEV__) console.error(message);
}
