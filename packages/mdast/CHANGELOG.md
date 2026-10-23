# @fluxdown/mdast

## 0.7.2

### Patch Changes

- Updated dependencies [134f67b]
  - @fluxdown/utils@0.7.0

## 0.7.1

### Patch Changes

- 811e8ec: Filter Markdown visitors by node type before allocating traversal context, and restrict HTML repairs and code metadata processing to their relevant nodes.
- c4ae73a: Reduce AST traversal bookkeeping and repeated allocations while preserving live mutation, traversal order, and tail traversal behavior.

## 0.7.0

### Minor Changes

- f566cc2: Add an optional structural-tail traversal scope to `processMdast`. Built-in repair plugins declare `scope: 'tail'` in their config. The repair kernel uses the final child path for pre-order, left-first traversal and falls back to the whole tree for other traversal orders.

  Plugin config takes precedence over repair call options. Subclasses that replace a built-in tail runner with a whole-tree repair should set `scope: 'tree'` in their config.

  Upgrade compatible micromark dependencies, including the GFM table edit-map performance fix.

## 0.6.1

### Patch Changes

- aa2a08f: Allow compatible internal dependency updates through caret version ranges instead
  of exact version pins. Future updates within those ranges can be installed without
  releasing unchanged dependent packages. Existing consumer lockfiles must still be
  updated to resolve newer dependency versions.

## 0.6.0

### Minor Changes

- 1242fc4: Initial release with extensible Markdown rendering for streaming content, framework-independent processing, and React integrations with Shad tail shading and smooth rendering.

### Patch Changes

- Updated dependencies [1242fc4]
  - @fluxdown/utils@0.6.0
