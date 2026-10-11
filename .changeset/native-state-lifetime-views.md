---
"stative": major
---

Use native notifications, directly owned outputs, and borrowed lifetime views to reduce internal subscriptions and allocations. Borrowed native handles activate when read or observed; destruction freezes the source's last published value and terminal state. Explicit comparators now decide equality without another closure-level `Object.is` filter.

This changes activation timing, output identity, and publication checkpoints. Consume outputs through `IReactiveState`, read or subscribe to activate them, and use `Object.is` when same-reference publications should be suppressed. Custom writable closures remain supported.

Unify pure projections under `selectState`, `selectClosure`, and `useSelect`: evaluate unobserved reads on demand and stay subscribed after first observation. Both `map` and `select` accept one source or an array of sources. `map` retains previous input/output values; pure `select` mappers receive only the current value. Array values must be wrapped in a state to remain a single input. Compact descriptor cleanup storage.
