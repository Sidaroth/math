import { describe, it, expect } from 'vitest';
import {
    TWO_PI,
    DEG2RAD,
    RAD2DEG,
    degreesToRadians,
    radiansToDegrees,
    normalizeAngle,
} from '../../src/utils';

describe('Angle utilities', () => {
    describe('constants', () => {
        it('defines TWO_PI correctly', () => {
            expect(TWO_PI).toBeCloseTo(2 * Math.PI);
        });

        it('defines DEG2RAD correctly', () => {
            expect(DEG2RAD).toBeCloseTo(Math.PI / 180);
        });

        it('defines RAD2DEG correctly', () => {
            expect(RAD2DEG).toBeCloseTo(180 / Math.PI);
        });

        it('ensures DEG2RAD and RAD2DEG are reciprocal', () => {
            expect(DEG2RAD * RAD2DEG).toBeCloseTo(1, 1e-12);
        });
    });

    describe('degreesToRadians()', () => {
        it('converts 0° to 0 radians', () => {
            expect(degreesToRadians(0)).toBe(0);
        });

        it('converts 180° to π radians', () => {
            expect(degreesToRadians(180)).toBeCloseTo(Math.PI);
        });

        it('converts 360° to 2π radians', () => {
            expect(degreesToRadians(360)).toBeCloseTo(2 * Math.PI);
        });

        it('handles negative degrees correctly', () => {
            expect(degreesToRadians(-90)).toBeCloseTo(-Math.PI / 2);
        });
    });

    describe('radiansToDegrees()', () => {
        it('converts 0 radians to 0°', () => {
            expect(radiansToDegrees(0)).toBe(0);
        });

        it('converts π radians to 180°', () => {
            expect(radiansToDegrees(Math.PI)).toBeCloseTo(180);
        });

        it('converts 2π radians to 360°', () => {
            expect(radiansToDegrees(2 * Math.PI)).toBeCloseTo(360);
        });

        it('handles negative radians correctly', () => {
            expect(radiansToDegrees(-Math.PI / 2)).toBeCloseTo(-90);
        });
    });

    describe('normalizeAngle()', () => {
        it('leaves angles in range [0, 2π) unchanged', () => {
            expect(normalizeAngle(Math.PI)).toBeCloseTo(Math.PI);
            expect(normalizeAngle(0)).toBeCloseTo(0);
        });

        it('wraps angles greater than 2π', () => {
            expect(normalizeAngle(3 * Math.PI)).toBeCloseTo(Math.PI);
            expect(normalizeAngle(10 * Math.PI)).toBeCloseTo(0);
        });

        it('wraps negative angles correctly', () => {
            // -π normalized should be equivalent to π
            const normalized = normalizeAngle(-Math.PI);
            expect(
                normalized === Math.PI ||
                    Math.abs(normalized - Math.PI) < 1e-12,
            ).toBe(true);
        });

        it('handles multiple revolutions', () => {
            expect(normalizeAngle(100 * Math.PI)).toBeCloseTo(0);
            expect(normalizeAngle(-100 * Math.PI)).toBeCloseTo(0);
        });
    });

    // ---- PROPERTY TESTS ----
    describe('mathematical consistency', () => {
        it('degreesToRadians and radiansToDegrees are inverses', () => {
            for (let deg = -720; deg <= 720; deg += 90) {
                const radians = degreesToRadians(deg);
                expect(radiansToDegrees(radians)).toBeCloseTo(deg, 1e-10);
            }
        });

        it('normalizeAngle always returns value in [0, TWO_PI)', () => {
            for (let a = -10 * Math.PI; a <= 10 * Math.PI; a += Math.PI / 4) {
                const n = normalizeAngle(a);
                expect(n).toBeGreaterThanOrEqual(0);
                expect(n).toBeLessThan(TWO_PI);
            }
        });
    });
});
