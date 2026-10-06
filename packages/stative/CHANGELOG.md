# stative

## 1.1.1

### Patch Changes

- a4457b5: Mark dependent states before adding them to the invalidation worklist, avoiding duplicate entries and allocations for already-dirty roots while preserving dependency ordering and error isolation.
- cb73ca0: Reduce propagation allocations by reusing pending publication callbacks, copying combined input snapshots only when their values change, and forwarding closure values through one owned mutable state instead of an extra BehaviorSubject relay. Preserve synchronous initialization errors, batching, output equality, and ownership boundaries. Closure outputs obtained before their first read now retain the latest received value after completion or destruction.

## 1.1.0

### Minor Changes

- cc66511: Replace recursive priority scheduling with subscription dependency propagation while preserving synchronous batching, consistent derived updates, and subscription cleanup.

  Remove `BatchScheduler`; import `batch` directly instead of calling `BatchScheduler.batch`. State graph utilities are now exported through the package barrel. Update Fluxdown presets and integration tests to use dependency ordering without manually assigned priorities.

### Patch Changes

- cc66511: Reuse the initial combined mapping when subscribing to unchanged sources, avoiding duplicate initial Markdown compilation while preserving lazy updates and completion.

## 1.0.2

### Patch Changes

- 1242fc4: Initial release with framework-independent reactive state, composable state closures, lifecycle management, and a typed JSX runtime.
