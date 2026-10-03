# @fluxdown/types

## 0.6.1

### Patch Changes

- f09f2f9: Drain short streaming suffixes, recover the smooth cursor from the retained visible prefix after destructive edits, and stop animation frames while caught up. Preserve zero-length rendered blocks, including empty code fences and tables.

  Expose optional `prevPrefixLength` notifications on block states for preserved-prefix tracking while keeping smooth revision snapshots internal.

- Updated dependencies [6a935bf]
- Updated dependencies [5d8e870]
  - stative@2.0.0

## 0.6.0

### Minor Changes

- 1242fc4: Initial release with extensible Markdown rendering for streaming content, framework-independent processing, and React integrations with Shad tail shading and smooth rendering.

### Patch Changes

- Updated dependencies [1242fc4]
- Updated dependencies [1242fc4]
  - @fluxdown/mdast@0.6.0
  - @fluxdown/utils@0.6.0
  - stative@1.0.2
