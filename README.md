# @sidaroth/kit

A lightweight, dependency-free toolkit for **math**, **simulation**, and **rendering** workflows — designed for projects that need raw performance without the bloat of a full engine.

The core idea behind this repo is to create a collection of low-level primitives for simulations and rendering — things you can build on top of, not frameworks that make choices for you.

---

## Overview

`@sidaroth/kit` is a **monorepo** built around modular packages that share a common design philosophy:
- **No dependencies** in core packages
- **Clean TypeScript design**, strict typing, and small bundles
- **Predictable, not magical** - all functions behave transparently with no hidden side effects.
- **Data-oriented where possible** - easy to interop with WebGL, Pixi, or compute pipelines.
- **Balance clarity and performance** - readable code that’s still fast enough for real-time use
- **Protect users from pitfalls** - immutable or read-only outputs where mutation is unsafe.
- **Testable** - built with repeatability and isolation in mind so results are consistent and verifiable by tests. Aims for 100% coverage.
- **Lazy** - internal state (like area, centroid, or length) is recalculated only when accessed, avoiding unnecessary work while maintaining correctness.
- **Easy to integrate** into game engines, graphics pipelines, or compute workloads

This repo is home to the following packages:

| Package | Description 
|----------|--------------|
| [`@sidaroth/math`](./packages/math/README.md) | Core vector/matrix/geometry math primitives |
| [`@sidaroth/core`](./packages/core/README.md) | Simulation utilities, spatial partitioning, ECS-style components |
| *(more coming)* | Physics, rendering, etc. |

Each package is installable and usable independently — this repository hosts them together for development and versioning.

---

## Development

### Requirements
- **Node.js 18+**
- **pnpm** (preferred) or npm
- **TypeScript 5.9+**

### Commands

Run from the root:
```bash
# install all workspaces
pnpm install

# build all packages
pnpm build

# run tests for all packages
pnpm test

# watch + rebuild during development
pnpm dev
```

Each package defines its own build, test, and bench scripts, but they can also be orchestrated through Lerna.

## License

MIT © Christian Holt (@sidaroth)