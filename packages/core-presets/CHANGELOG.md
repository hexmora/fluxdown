# @fluxdown/core-presets

## 0.6.1

### Patch Changes

- 5d8e870: Replace recursive priority scheduling with subscription dependency propagation while preserving synchronous batching, consistent derived updates, and subscription cleanup.

  Remove `BatchScheduler`; import `batch` directly instead of calling `BatchScheduler.batch`. State graph utilities are now exported through the package barrel. Update Fluxdown presets and integration tests to use dependency ordering without manually assigned priorities.

- Updated dependencies [5d8e870]
  - stative@2.0.0
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
