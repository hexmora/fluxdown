# @fluxdown/core

## 0.8.2

### Patch Changes

- 470fb5b: Reuse sealed Markdown block prefixes during streaming appends and lex only the mutable tail. Preserve document-scoped definitions, syntax policies, source offsets, destructive replacements, and block-local patches.
- a37ab59: Compare block metadata with a fast path for changed block counts.
- ad93451: Add shared selection states and closures that preserve synchronous dependency order while avoiding downstream invalidation when their result stays equal. Use a shared selection for the document block count.
- Updated dependencies [d595ca8]
- Updated dependencies [1f8bb14]
- Updated dependencies [6bf8f8a]
- Updated dependencies [5b391b4]
- Updated dependencies [559a259]
- Updated dependencies [f72e624]
- Updated dependencies [a37ab59]
- Updated dependencies [8e65595]
- Updated dependencies [0161ebf]
- Updated dependencies [468a453]
- Updated dependencies [dad697b]
- Updated dependencies [f627b35]
- Updated dependencies [ad93451]
  - stative@1.2.0
  - @fluxdown/core-presets@0.6.5

## 0.8.1

### Patch Changes

- aa2a08f: Allow compatible internal dependency updates through caret version ranges instead
  of exact version pins. Future updates within those ranges can be installed without
  releasing unchanged dependent packages. Existing consumer lockfiles must still be
  updated to resolve newer dependency versions.
- Updated dependencies [aa2a08f]
  - @fluxdown/core-presets@0.6.4
  - @fluxdown/types@0.7.1

## 0.8.0

### Minor Changes

- 8eb9b3f: Keep the document block count separate from per-block compilation inputs so adding a block does not revisit stable compilation contexts. Public block metadata continues to report the current count through IBlockMeta; IBlockRawMeta now contains only character offsets and the block index. Advanced compiler integrations must pass section, meta, isLast, and count closures directly to CompiledBlock instead of an item closure. BlockCompilerItem.meta matches IBlockRawMeta exactly and uses an explicit isLast flag instead of meta.blockCount.

### Patch Changes

- 30d41c4: Reuse unchanged block sections between text updates and skip patch projection when there are no patches. Preserve block-local patch snapshots and destructive text revision tracking.
- 7557794: Reuse unchanged internal block compilation inputs during streaming updates.
- Updated dependencies [a4457b5]
- Updated dependencies [cb73ca0]
- Updated dependencies [8eb9b3f]
  - stative@1.1.1
  - @fluxdown/core-presets@0.6.3
  - @fluxdown/types@0.7.0

## 0.7.1

### Patch Changes

- ad0c6a8: Preserve block boundaries for trailing list whitespace and reduce repeated work during streaming. Add an immutable HAST projection API to share grapheme indexes within a compiled revision, retain unchanged revision subscriptions, and limit cutoff and shading updates to active blocks while preserving dynamic animation behavior.
- Updated dependencies [ad0c6a8]
  - @fluxdown/core-presets@0.6.2
  - @fluxdown/hast@0.7.0

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
