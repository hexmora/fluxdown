# @fluxdown/core-presets

## 0.8.0

### Minor Changes

- cd2389a: Improve the visual appearance of streaming text with a longer fading tail and smoother continuation. Require scheduler `idle` and `resume` members, with default implementations in `BaseSmoothScheduler`.

## 0.7.3

### Patch Changes

- 811e8ec: Filter Markdown visitors by node type before allocating traversal context, and restrict HTML repairs and code metadata processing to their relevant nodes.
- Updated dependencies [9fbd532]
- Updated dependencies [c129be9]
- Updated dependencies [811e8ec]
- Updated dependencies [4147678]
- Updated dependencies [c4ae73a]
- Updated dependencies [ecf42cf]
  - stative@2.0.1
  - @fluxdown/mdast@0.7.1

## 0.7.2

### Patch Changes

- b59c0a9: Expose built-in smooth scheduler and ticker names through static getters to avoid read-only constructor name initialization errors in older V8 engines.

## 0.7.1

### Patch Changes

- Updated dependencies [5bfdbd3]
  - @fluxdown/types@0.8.0

## 0.7.0

### Minor Changes

- 6658a55: Disabled Smooth and Shad mappers now return their source blocks without constructing animation graphs. Enabling starts from the settled content currently visible, including content updated in the same batch; subsequent additions animate. Disabling releases animation wrappers immediately, so wrapper identity can change across toggles. Explicitly retained forks keep independent lifetimes.

  Derive visible block metadata on demand and avoid repeated linear membership searches while maintaining animation wrappers.

  Disabled mappers expose the compiler's original HAST, including ignorable whitespace that a full-range projection previously removed.

- f566cc2: Add an optional structural-tail traversal scope to `processMdast`. Built-in repair plugins declare `scope: 'tail'` in their config. The repair kernel uses the final child path for pre-order, left-first traversal and falls back to the whole tree for other traversal orders.

  Plugin config takes precedence over repair call options. Subclasses that replace a built-in tail runner with a whole-tree repair should set `scope: 'tree'` in their config.

  Upgrade compatible micromark dependencies, including the GFM table edit-map performance fix.

### Patch Changes

- Updated dependencies [177889c]
- Updated dependencies [632914d]
- Updated dependencies [632914d]
- Updated dependencies [f566cc2]
  - @fluxdown/types@0.7.2
  - stative@2.0.0
  - @fluxdown/mdast@0.7.0

## 0.6.5

### Patch Changes

- a37ab59: Compare block metadata with a fast path for changed block counts.
- 8e65595: Keep retained block revision subscriptions connected while streaming instead of rebuilding the complete aggregate whenever block membership changes.
- dad697b: Reuse the current raw state subscription in switchMap, removing ShadProgress's local tail cache while preserving child ownership and lifecycle handling.
- Updated dependencies [d595ca8]
- Updated dependencies [1f8bb14]
- Updated dependencies [6bf8f8a]
- Updated dependencies [5b391b4]
- Updated dependencies [559a259]
- Updated dependencies [f72e624]
- Updated dependencies [0161ebf]
- Updated dependencies [468a453]
- Updated dependencies [dad697b]
- Updated dependencies [f627b35]
- Updated dependencies [ad93451]
  - stative@1.2.0

## 0.6.4

### Patch Changes

- aa2a08f: Allow compatible internal dependency updates through caret version ranges instead
  of exact version pins. Future updates within those ranges can be installed without
  releasing unchanged dependent packages. Existing consumer lockfiles must still be
  updated to resolve newer dependency versions.
- Updated dependencies [aa2a08f]
  - @fluxdown/mdast@0.6.1
  - @fluxdown/types@0.7.1

## 0.6.3

### Patch Changes

- cb73ca0: Reduce propagation allocations by reusing pending publication callbacks, copying combined input snapshots only when their values change, and forwarding closure values through one owned mutable state instead of an extra BehaviorSubject relay. Preserve synchronous initialization errors, batching, output equality, and ownership boundaries. Closure outputs obtained before their first read now retain the latest received value after completion or destruction.
- Updated dependencies [a4457b5]
- Updated dependencies [cb73ca0]
- Updated dependencies [8eb9b3f]
  - stative@1.1.1
  - @fluxdown/types@0.7.0

## 0.6.2

### Patch Changes

- ad0c6a8: Preserve block boundaries for trailing list whitespace and reduce repeated work during streaming. Add an immutable HAST projection API to share grapheme indexes within a compiled revision, retain unchanged revision subscriptions, and limit cutoff and shading updates to active blocks while preserving dynamic animation behavior.
- Updated dependencies [ad0c6a8]
  - @fluxdown/hast@0.7.0

## 0.6.1

### Patch Changes

- cc66511: Render footnote bodies by default and keep references, backlinks, and labels aligned with sanitized IDs. React instances use hydration-safe footnote namespaces; headless consumers can set `build.idPrefix`. Correct the spelling of multiword ARIA attributes.
- cc66511: Restore the shad window after text shrinks and resumes growing. Apply shad within links while keeping each anchor intact.
- cc66511: Drain short streaming suffixes, recover the smooth cursor from the retained visible prefix after destructive edits, and stop animation frames while caught up. Preserve zero-length rendered blocks, including empty code fences and tables.

  Expose optional `prevPrefixLength` notifications on block states for preserved-prefix tracking while keeping smooth revision snapshots internal.

- cc66511: Replace recursive priority scheduling with subscription dependency propagation while preserving synchronous batching, consistent derived updates, and subscription cleanup.

  Remove `BatchScheduler`; import `batch` directly instead of calling `BatchScheduler.batch`. State graph utilities are now exported through the package barrel. Update Fluxdown presets and integration tests to use dependency ordering without manually assigned priorities.

- Updated dependencies [cc66511]
- Updated dependencies [cc66511]
- Updated dependencies [cc66511]
  - stative@1.1.0
  - @fluxdown/types@0.6.1

## 0.6.0

### Minor Changes

- 1242fc4: Initial release with extensible Markdown rendering for streaming content, framework-independent processing, and React integrations with Shad tail shading and smooth rendering.

### Patch Changes

- Updated dependencies [1242fc4]
- Updated dependencies [1242fc4]
  - @fluxdown/hast@0.6.0
  - @fluxdown/mdast@0.6.0
  - @fluxdown/types@0.6.0
  - @fluxdown/utils@0.6.0
  - stative@1.0.2
