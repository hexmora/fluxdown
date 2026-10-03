# @fluxdown/core

## 0.7.0

### Minor Changes

- cc66511: Preserve HTML containers across Markdown block boundaries and align chunking with native GFM table rows, including rows without pipes. Configure indented code and Setext headings through build options shared by the chunker and the default syntax policy. Explicit plugin settings override the policy without changing chunking.

### Patch Changes

- cc66511: Render footnote bodies by default and keep references, backlinks, and labels aligned with sanitized IDs. React instances use hydration-safe footnote namespaces; headless consumers can set `build.idPrefix`. Correct the spelling of multiword ARIA attributes.
- cc66511: Drain short streaming suffixes, recover the smooth cursor from the retained visible prefix after destructive edits, and stop animation frames while caught up. Preserve zero-length rendered blocks, including empty code fences and tables.

  Expose optional `prevPrefixLength` notifications on block states for preserved-prefix tracking while keeping smooth revision snapshots internal.

- cc66511: Replace recursive priority scheduling with subscription dependency propagation while preserving synchronous batching, consistent derived updates, and subscription cleanup.

  Remove `BatchScheduler`; import `batch` directly instead of calling `BatchScheduler.batch`. State graph utilities are now exported through the package barrel. Update Fluxdown presets and integration tests to use dependency ordering without manually assigned priorities.

- Updated dependencies [cc66511]
- Updated dependencies [cc66511]
- Updated dependencies [cc66511]
- Updated dependencies [cc66511]
- Updated dependencies [cc66511]
  - @fluxdown/core-presets@0.6.1
  - stative@1.1.0
  - @fluxdown/types@0.6.1

## 0.6.0

### Minor Changes

- 1242fc4: Initial release with extensible Markdown rendering for streaming content, framework-independent processing, and React integrations with Shad tail shading and smooth rendering.

### Patch Changes

- Updated dependencies [1242fc4]
- Updated dependencies [1242fc4]
  - @fluxdown/core-presets@0.6.0
  - @fluxdown/hast@0.6.0
  - @fluxdown/types@0.6.0
  - @fluxdown/utils@0.6.0
  - stative@1.0.2
