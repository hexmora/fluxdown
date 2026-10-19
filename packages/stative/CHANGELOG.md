# stative

## 2.1.0

### Minor Changes

- 4828c8c: Add `renderHooks` to run once hooks in a lazy, independently owned scope without declaring a state component. The callback result is preserved as-is, and destroying the returned closure releases its hook-created resources.

  Extend `useDefaults` to resolve reactive `undefined` values while keeping fallback closures reusable across source changes. Export `isReadableClosure` for adapters that distinguish plain values from readable closures.

## 2.0.1

### Patch Changes

- 9fbd532: Track shared descriptor lifetime with owner counts instead of reverse owner sets, preserving cleanup order and reentrant detach behavior.
- c129be9: Build list item descriptors without an intermediate source closure while preserving lazy setup and per-item ownership.
- 4147678: Store the first ordering prerequisite inline, allocating a map only when a state has additional independent prerequisites.
- ecf42cf: Reuse unchanged select input snapshots without allocating arrays on every read, preserving revision checks and reentrant behavior.

## 2.0.0

### Major Changes

- 632914d: Use native notifications, directly owned outputs, and borrowed lifetime views to reduce internal subscriptions and allocations. Borrowed native handles activate when read or observed; destruction freezes the source's last published value and terminal state. Explicit comparators now decide equality without another closure-level `Object.is` filter.

  This changes activation timing, output identity, and publication checkpoints. Consume outputs through `IReactiveState`, read or subscribe to activate them, and use `Object.is` when same-reference publications should be suppressed. Custom writable closures remain supported.

  Unify pure projections under `selectState`, `selectClosure`, and `useSelect`: evaluate unobserved reads on demand and stay subscribed after first observation. Both `map` and `select` accept one source or an array of sources. `map` retains previous input/output values; pure `select` mappers receive only the current value. Array values must be wrapped in a state to remain a single input. Compact descriptor cleanup storage.

### Patch Changes

- 632914d: Preserve selected subscriptions and frozen snapshots when input setup synchronously observes or destroys the selected state. Reentrant activation now reuses the existing active state, and destruction closes every owned subscription.

## 1.2.0

### Minor Changes

- 6bf8f8a: Add identity-keyed state collections that retain child ownership and subscriptions across list growth and reordering. Duplicate identities share a child while preserving their output positions.
- ad93451: Add shared selection states and closures that preserve synchronous dependency order while avoiding downstream invalidation when their result stays equal. Use a shared selection for the document block count.

### Patch Changes

- d595ca8: Avoid attaching graph dependencies to sources whose terminal notification has already been published.
- 1f8bb14: Settle pending prerequisites attached during publication, including dependencies behind ordering boundaries. Keep failures within the synchronous read that discovers the new prerequisite.
- 5b391b4: Allocate cleanup storage only when an object registers a resource, preserving teardown ordering and error behavior.
- 559a259: Reuse the publication queue's iterator while preserving reentrant updates and dependency error recovery.
- f72e624: Keep collection reads consistent through local ordering prerequisites without invalidating unchanged item graphs. Preserve dependency ordering, synchronous reads, reentrant updates, and error isolation when dependencies are added, removed, or shared.
- 0161ebf: Avoid queue bookkeeping when reading an already settled state while retaining pending update retries and idle queue cleanup.
- 468a453: Release obsolete initial input snapshots after combined states advance, while preserving lazy setup, previous mapper values, and publication behavior.
- dad697b: Reuse the current raw state subscription in switchMap, removing ShadProgress's local tail cache while preserving child ownership and lifecycle handling.
- f627b35: Retain shared ordering prerequisites when a dependency is removed by tracking their supporting paths. Reuse surviving paths and rebuild only when support is lost, including cyclic and dynamically changing graphs.

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
