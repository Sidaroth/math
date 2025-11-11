const env = process?.env?.NODE_ENV;

// Production and test environments don't need stderr/stdout to be cluttered with dev messages.
export const __DEV__ = env !== 'production' && env !== 'test';
