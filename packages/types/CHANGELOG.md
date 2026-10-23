# @fluxdown/types

## 0.10.1

### Patch Changes

- Updated dependencies [134f67b]
  - @fluxdown/utils@0.7.0
  - @fluxdown/mdast@0.7.2

## 0.10.0

### Minor Changes

- aeaa05f: Use monotonic animation clocks and scale as the default streaming effect. Keep plugin configuration entries optional while declaring complete global configuration registries, and organize effect documentation with shared streaming previews.

## 0.9.0

### Minor Changes

- 4828c8c: Add `streaming.effect` for built-in effects, custom mapper plugins, configured tuples, and ordered combinations. Visual effects now default to disabled, including with `streaming={true}`. Enable the trailing fade with `effect: true` or `effect: 'shad'`, or configure it with `effect: ['shad', config]`.

  Remove `streaming.shad`; migrate its values to `effect`, using `['shad', config]` for configured fades. Export `EffectItem` from the merged `EffectConfigs` registry and resolve effect keys through the mapper presets. Preserve the supplied mapper order so composed effects run in the requested sequence.

  Move fade mask width into the Shad mapper configuration. Renderers consume the width from each shaded block, without requiring CSS variables on the Fluxdown root.

  Normalize mapper configuration into stable readable inputs. Export plain Config, derived Inputs, and mixed-value PluginConfig types; apply plugin metadata at the registry boundary. Mapper configuration can switch between plain values and readable closures without rebuilding the mapper. Convert external states with `toClosure` before supplying them as configuration.

  Add a type-only `/typings` entry for the core preset foundation types, and use a mask for the shad gradient so it composes with transformed content.

### Patch Changes

- Updated dependencies [4828c8c]
  - stative@2.1.0

## 0.8.0

### Minor Changes

- 5bfdbd3: Allow plugin tuples to set `disabled: true` to opt out of individual presets or custom plugins. Disabled plugins and mappers are not constructed, and their existing state is cleaned up when configuration changes.

## 0.7.2

### Patch Changes

- 177889c: Export the existing `IBlockStateMapper` type so block inputs can name their mapper directly.
- Updated dependencies [632914d]
- Updated dependencies [632914d]
- Updated dependencies [f566cc2]
  - stative@2.0.0
  - @fluxdown/mdast@0.7.0

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
