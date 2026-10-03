---
"stative": patch
"@fluxdown/core-presets": patch
---

Reduce propagation allocations by reusing pending publication callbacks, copying combined input snapshots only when their values change, and forwarding closure values through one owned mutable state instead of an extra BehaviorSubject relay. Preserve synchronous initialization errors, batching, output equality, and ownership boundaries. Closure outputs obtained before their first read now retain the latest received value after completion or destruction.
