# math
A lightweight collection of math utilities I’ve built and refined across various projects — geometry, physics, graphics, and general number-crunching. It’s designed for reuse in my personal and experimental work, but can serve as a solid foundation for anyone needing fast, reliable math primitives.

## Features
- **Comprehensive** geometry primitives - vectors, points, lines, polygons, circles, and more.
- **Deterministic** and precise - focuses on numerical stability and predictable floating-point behavior.
- **Performance-first** - minimal allocations, lazy evaluation, and lightweight class structures.
- **Self-contained** - zero external dependencies.
- **TypeScript-first** - strong typing, JSDoc annotations, and inline documentation.
- **Clean** API - intuitive methods and naming conventions consistent across types.

## Modules
- **Core** - Fundamental math constructs: `Point`, `Vector`, `Matrix`, etc.
- **Geometry** - Shapes and related algorithms: `Line`, `Circle`, `Rect`, `Polygon`, etc.
- **Collision** - Collision detection utilities: AABB, SAT, intersection tests, etc.
- **Physics** - Optional physical bodies, forces, motion helpers.
- **Noise** - Randomness and procedural generation utilities.
- **Utils** - General math helpers: interpolation, clamping, rounding, etc.

## Design Philosophy
- **Predictable, not magical** - all functions behave transparently with no hidden side effects.
- **Data-oriented where possible** - easy to interop with WebGL, Pixi, or compute pipelines.
- **Balance clarity and performance** - readable code that’s still fast enough for real-time use
- **Protect users from pitfalls** - immutable or read-only outputs where mutation is unsafe.
- **Testable** - built with repeatability and isolation in mind so results are consistent and verifiable by tests. Aims for 100% coverage.
- **Lazy** - internal state (like area, centroid, or length) is recalculated only when accessed, avoiding unnecessary work while maintaining correctness.


## Example Usage
```ts
import { Point, Circle, Polygon } from '@sidaroth/math';

// Construct shapes
const circle = new Circle(new Point(5, 5), 10);
const triangle = new Polygon([
  new Point(0, 0),
  new Point(10, 0),
  new Point(5, 10),
]);

// Basic operations
console.log('Circle area:', circle.area);
console.log('Triangle centroid:', triangle.centroid.toString());
console.log('Point inside circle:', circle.containsPoint(new Point(8, 8)));
```

## Installation
```bash
npm install @sidaroth/math
# or
pnpm add @sidaroth/math
```

## Tooling
* TypeScript
* Bundler: tsup
* Testing: vitest
* Linting: oxlint
* Formatting: prettier

## Roadmap
- [ ] Add tests for all existing files
- [X] Add benchmarking
- [ ] Add `Ray` geometry type
- [ ] Add `Triangle` geometry type
- [X] Add more math utilities like `interpolate`, `radiansToDegrees`, etc.
- [ ] Add collision detection (SAT, circle-polygon, ray-shape)
- [ ] Add physics body integration
- [ ] Explore SIMD or WebAssembly backed math core (maybe)
- [ ] Ensure compatability with Compute Shaders

