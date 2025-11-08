import { describe, it, expect } from 'vitest';
import {
    clamp,
    lerp,
    lerpClamped,
    inverseLerp,
    remap,
    smoothstep,
    smootherstep,
    easeInQuad,
    easeOutQuad,
    easeInOutQuad,
} from '@utils/scalar';

describe('Scalar Math Utilities', () => {
    describe('clamp()', () => {
        it('returns value within range', () => {
            expect(clamp(5, 0, 10)).toBe(5);
        });

        it('returns min when below range', () => {
            expect(clamp(-5, 0, 10)).toBe(0);
        });

        it('returns max when above range', () => {
            expect(clamp(15, 0, 10)).toBe(10);
        });

        it('handles inverted min/max gracefully', () => {
            expect(clamp(5, 10, 0)).toBe(0);
        });
    });

    describe('lerp()', () => {
        it('returns start when t=0', () => {
            expect(lerp(0, 10, 0)).toBe(0);
        });

        it('returns end when t=1', () => {
            expect(lerp(0, 10, 1)).toBe(10);
        });

        it('interpolates linearly', () => {
            expect(lerp(0, 10, 0.5)).toBe(5);
        });
    });

    describe('lerpClamped()', () => {
        it('clamps t below 0', () => {
            expect(lerpClamped(0, 10, -1)).toBe(0);
        });

        it('clamps t above 1', () => {
            expect(lerpClamped(0, 10, 2)).toBe(10);
        });

        it('interpolates normally when in range', () => {
            expect(lerpClamped(0, 10, 0.25)).toBe(2.5);
        });
    });

    describe('inverseLerp()', () => {
        it('returns 0 when value = start', () => {
            expect(inverseLerp(0, 10, 0)).toBe(0);
        });

        it('returns 1 when value = end', () => {
            expect(inverseLerp(0, 10, 10)).toBe(1);
        });

        it('returns 0.5 for midpoint', () => {
            expect(inverseLerp(0, 10, 5)).toBeCloseTo(0.5);
        });

        it('returns 0 when start=end', () => {
            expect(inverseLerp(5, 5, 10)).toBe(0);
        });

        it('handles out-of-range values', () => {
            expect(inverseLerp(0, 10, 15)).toBeGreaterThan(1);
            expect(inverseLerp(0, 10, -5)).toBeLessThan(0);
        });
    });

    describe('remap()', () => {
        it('maps value between two ranges', () => {
            expect(remap(5, 0, 10, 0, 100)).toBe(50);
        });

        it('handles inverted ranges', () => {
            expect(remap(2.5, 0, 5, 10, 0)).toBe(5);
        });

        it('works with out-of-range inputs', () => {
            expect(remap(15, 0, 10, 0, 100)).toBe(150);
        });
    });

    describe('smoothstep()', () => {
        it('returns 0 at t=0 and 1 at t=1', () => {
            expect(smoothstep(0)).toBe(0);
            expect(smoothstep(1)).toBe(1);
        });

        it('clamps out-of-range t', () => {
            expect(smoothstep(-1)).toBe(0);
            expect(smoothstep(2)).toBe(1);
        });

        it('is roughly 0.5 at midpoint', () => {
            const val = smoothstep(0.5);
            expect(val).toBeGreaterThan(0.4);
            expect(val).toBeLessThan(0.6);
        });
    });

    describe('smootherstep()', () => {
        it('returns 0 at t=0 and 1 at t=1', () => {
            expect(smootherstep(0)).toBe(0);
            expect(smootherstep(1)).toBe(1);
        });

        it('is smooth near midpoint', () => {
            const val = smootherstep(0.5);
            expect(val).toBeCloseTo(0.5, 1);
        });
    });

    describe('easeInQuad()', () => {
        it('starts slow and ends fast', () => {
            expect(easeInQuad(0)).toBe(0);
            expect(easeInQuad(0.5)).toBeCloseTo(0.25);
            expect(easeInQuad(1)).toBe(1);
        });
    });

    describe('easeOutQuad()', () => {
        it('starts fast and ends slow', () => {
            expect(easeOutQuad(0)).toBe(0);
            expect(easeOutQuad(0.5)).toBeCloseTo(0.75);
            expect(easeOutQuad(1)).toBe(1);
        });
    });

    describe('easeInOutQuad()', () => {
        it('smoothly transitions between acceleration and deceleration', () => {
            expect(easeInOutQuad(0)).toBe(0);
            expect(easeInOutQuad(0.25)).toBeCloseTo(0.125);
            expect(easeInOutQuad(0.5)).toBeCloseTo(0.5);
            expect(easeInOutQuad(0.75)).toBeCloseTo(0.875);
            expect(easeInOutQuad(1)).toBe(1);
        });
    });

    // ---- PROPERTY TESTS ----
    describe('mathematical consistency', () => {
        it('lerp and inverseLerp are inverse operations within tolerance', () => {
            for (let t = 0; t <= 1; t += 0.1) {
                const value = lerp(10, 20, t);
                const result = inverseLerp(10, 20, value);
                expect(result).toBeCloseTo(t, 10e-6);
            }
        });

        it('remap preserves ratio across ranges', () => {
            for (let t = 0; t <= 1; t += 0.1) {
                const v1 = lerp(0, 10, t);
                const v2 = remap(v1, 0, 10, 100, 200);
                expect(v2).toBeCloseTo(lerp(100, 200, t), 10e-6);
            }
        });

        it('smoothstep output is monotonic increasing', () => {
            let prev = smoothstep(0);
            for (let i = 1; i <= 10; i++) {
                const t = i / 10;
                const next = smoothstep(t);
                expect(next).toBeGreaterThanOrEqual(prev);
                prev = next;
            }
        });

        it('easeInQuad and easeOutQuad are complementary (mirror symmetry)', () => {
            for (let t = 0; t <= 1; t += 0.1) {
                const a = easeInQuad(t);
                const b = 1 - easeOutQuad(1 - t);
                expect(a).toBeCloseTo(b, 1e-12);
            }
        });

        it('easeInOutQuad(0.5) ≈ 0.5 midpoint symmetry', () => {
            expect(easeInOutQuad(0.5)).toBeCloseTo(0.5, 1e-12);
        });
    });
});
