# @fluxdown/types

## 0.7.1

### Patch Changes

- aa2a08f: Allow compatible internal dependency updates through caret version ranges instead
  of exact version pins. Future updates within those ranges can be installed without
  releasing unchanged dependent packages. Existing consumer lockfiles must still be
  updated to resolve newer dependency versions.
- Updated dependencies [aa2a08f]
  - @fluxdown/mdast@0.6.1

## 0.7.0

### Minor Changes

- 8eb9b3f: Keep the document block count separate from per-block compilation inputs so adding a block does not revisit stable compilation contexts. Public block metadata continues to report the current count through IBlockMeta; IBlockRawMeta now contains only character offsets and the block index. Advanced compiler integrations must pass section, meta, isLast, and count closures directly to CompiledBlock instead of an item closure. BlockCompilerItem.meta matches IBlockRawMeta exactly and uses an explicit isLast flag instead of meta.blockCount.

### Patch Changes

- Updated dependencies [a4457b5]
- Updated dependencies [cb73ca0]
  - stative@1.1.1

## 0.6.1

### Patch Changes

- cc66511: Drain short streaming suffixes, recover the smooth cursor from the retained visible prefix after destructive edits, and stop animation frames while caught up. Preserve zero-length rendered blocks, including empty code fences and tables.

  Expose optional `prevPrefixLength` notifications on block states for preserved-prefix tracking while keeping smooth revision snapshots internal.

- Updated dependencies [cc66511]
- Updated dependencies [cc66511]
  - stative@1.1.0

## 0.6.0

### Minor Changes

- 1242fc4: Initial release with extensible Markdown rendering for streaming content, framework-independent processing, and React integrations with Shad tail shading and smooth rendering.

### Patch Changes

- Updated dependencies [1242fc4]
- Updated dependencies [1242fc4]
  - @fluxdown/mdast@0.6.0
  - @fluxdown/utils@0.6.0
  - stative@1.0.2
