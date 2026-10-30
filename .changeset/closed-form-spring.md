---
"@fluxdown/core-plugins": minor
"@fluxdown/core": patch
"fluxdown": patch
---

Drive the built-in `spring` smooth scheduler with a closed-form damped spring, so reveal progress no longer depends on frame timing or accumulates rounding error. Its tuple is now `[frequency, dampingRatio]` (default `[5, 1]`). Add `toPhysicalSpring` and `toPerceptualSpring` to convert between that form and stiffness, damping, and mass, and `getSpringMotion` to sample the spring.
