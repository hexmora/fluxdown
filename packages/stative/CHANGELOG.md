# stative

## 1.1.0

### Minor Changes

- cc66511: Replace recursive priority scheduling with subscription dependency propagation while preserving synchronous batching, consistent derived updates, and subscription cleanup.

  Remove `BatchScheduler`; import `batch` directly instead of calling `BatchScheduler.batch`. State graph utilities are now exported through the package barrel. Update Fluxdown presets and integration tests to use dependency ordering without manually assigned priorities.

### Patch Changes

- cc66511: Reuse the initial combined mapping when subscribing to unchanged sources, avoiding duplicate initial Markdown compilation while preserving lazy updates and completion.

## 1.0.2

### Patch Changes

- 1242fc4: Initial release with framework-independent reactive state, composable state closures, lifecycle management, and a typed JSX runtime.
