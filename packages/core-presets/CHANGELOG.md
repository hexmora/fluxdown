# @fluxdown/core-presets

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
