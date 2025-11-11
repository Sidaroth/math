import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    resolve: {
        alias: {
            '@core': path.resolve(__dirname, 'src/core'),
            '@geometry': path.resolve(__dirname, 'src/geometry'),
            '@utils': path.resolve(__dirname, 'src/utils'),
            '@src': path.resolve(__dirname, 'src'),
        },
    },
    test: {
        globals: true,
        environment: 'node',
        coverage: {
            provider: 'v8',
            reporter: ['text'],
            exclude: ['dist', 'node_modules', 'tests'],
        },
        benchmark: {
            outputJson: path.resolve(__dirname, 'benchmarks.json'),
            include: ['tests/bench/**/*.bench.ts'],
        },
    },
});
