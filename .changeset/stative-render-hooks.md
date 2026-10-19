---
"stative": minor
---

Add `renderHooks` to run once hooks in a lazy, independently owned scope without declaring a state component. The callback result is preserved as-is, and destroying the returned closure releases its hook-created resources.

Extend `useDefaults` to resolve reactive `undefined` values while keeping fallback closures reusable across source changes. Export `isReadableClosure` for adapters that distinguish plain values from readable closures.
