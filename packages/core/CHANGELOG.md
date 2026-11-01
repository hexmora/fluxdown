# @fluxdown/core

## 0.12.7

### Patch Changes

- 10b06f2: Clarify streaming Markdown package descriptions and keywords, and link each package to its framework's documentation.

## 0.12.6

### Patch Changes

- c9598c5: Add a ReactLynx renderer with full, lite and raw components, native element plugins, themes and streaming effects. Preserve JSX for the host application's ReactLynx compiler and provide Storybook examples and renderer tests.

  Use a host-compatible clock for streaming mappers when the browser Performance API is unavailable.

  Bundle the headless Markdown parser dependencies with their DOM-free entity decoder so Lynx consumers do not require application-level resolution aliases.

- Updated dependencies [c9598c5]
  - @fluxdown/core-plugins@0.12.2
  - @fluxdown/utils@0.7.2

## 0.12.5

### Patch Changes

- 8691710: Keep native streaming text on a stable baseline while measuring and drawing inline effects. Restore chunk fades through text color alpha and preserve inherited typography without platform-specific rendering branches.

  Keep active scale words and characters mounted when settled text is collapsed during streaming.

  Keep shad measurements attached to complete words and stable text positions as the active tail moves, preserving settled prefixes while layouts update.

- Updated dependencies [8691710]
  - @fluxdown/core-plugins@0.12.1
  - @fluxdown/hast@0.7.1

## 0.12.4

### Patch Changes

- 9f08ddc: Separate platform-independent React rendering and base plugins from DOM slots, themes, and preset packs. Replace @fluxdown/react-presets with @fluxdown/react-base-plugins and @fluxdown/react-plugins, add @fluxdown/react-base and @fluxdown/react-hooks, and rename @fluxdown/core-presets to @fluxdown/core-plugins. Retain the full, lite, and raw Fluxdown entries.
- Updated dependencies [9f08ddc]
  - @fluxdown/core-plugins@0.12.0
  - @fluxdown/utils@0.7.1

## 0.12.3

### Patch Changes

- 2bb482d: Add CjkPlugin and headless CjkRemarkPlugin for CJK emphasis, strikethrough, and autolink punctuation boundaries. Enable CJK parsing in the Full preset, retain explicit installation in Lite and Raw, and preserve strikethrough configuration and literal link targets.
- 1df885d: Add EmojiRemarkPlugin and EmojiPlugin to convert GitHub emoji shortcodes to Unicode emoji. Enable EmojiPlugin in Full while preserving unknown shortcodes and code literals. Lite and Core can opt in.
- 9170bab: Move core preset imports to `@fluxdown/core-presets/presets/<type>` and individual plugin imports to `@fluxdown/core-presets/plugins/<type>/<name>`. The previous `/mapper`, `/remark`, `/rehype`, and `/repair` aggregate entry points are removed; import each plugin and its related types from its own subpath.
- Updated dependencies [2bb482d]
- Updated dependencies [1df885d]
- Updated dependencies [9170bab]
  - @fluxdown/core-presets@0.11.0

## 0.12.2

### Patch Changes

- Updated dependencies [134f67b]
  - @fluxdown/utils@0.7.0
  - @fluxdown/core-presets@0.10.1
  - @fluxdown/types@0.10.1

## 0.12.1

### Patch Changes

- 9867aed: Add a chunk streaming effect that fades each incoming text batch in together, preserves existing content and natural wrapping, and respects reduced motion.
- aeaa05f: Use monotonic animation clocks and scale as the default streaming effect. Keep plugin configuration entries optional while declaring complete global configuration registries, and organize effect documentation with shared streaming previews.
- ea3f399: Add a suffix streaming effect with cursor and dot markers, extensible marker types, and support for code blocks and syntax highlighting.
- Updated dependencies [9867aed]
- Updated dependencies [aeaa05f]
- Updated dependencies [ea3f399]
  - @fluxdown/core-presets@0.10.0
  - @fluxdown/types@0.10.0

## 0.12.0

### Minor Changes

- 4828c8c: Add `streaming.effect` for built-in effects, custom mapper plugins, configured tuples, and ordered combinations. Visual effects now default to disabled, including with `streaming={true}`. Enable the trailing fade with `effect: true` or `effect: 'shad'`, or configure it with `effect: ['shad', config]`.

  Remove `streaming.shad`; migrate its values to `effect`, using `['shad', config]` for configured fades. Export `EffectItem` from the merged `EffectConfigs` registry and resolve effect keys through the mapper presets. Preserve the supplied mapper order so composed effects run in the requested sequence.

  Move fade mask width into the Shad mapper configuration. Renderers consume the width from each shaded block, without requiring CSS variables on the Fluxdown root.

  Normalize mapper configuration into stable readable inputs. Export plain Config, derived Inputs, and mixed-value PluginConfig types; apply plugin metadata at the registry boundary. Mapper configuration can switch between plain values and readable closures without rebuilding the mapper. Convert external states with `toClosure` before supplying them as configuration.

  Add a type-only `/typings` entry for the core preset foundation types, and use a mask for the shad gradient so it composes with transformed content.

### Patch Changes

- a8c6013: Add the `scale` streaming effect and its `Scale` mapper and `ScaleRenderPlugin` presets. Enable it with `streaming: { effect: 'scale' }`, customize it with `['scale', { duration, from, blur }]`, or combine it with other effects.

  Newly revealed characters grow and fade into place with a shrinking blur, preserving their animation progress across updates and remounts. Defaults are 200 milliseconds, an initial scale of 0, and a blur radius of 0.08 em. Existing content remains still, reduced-motion preferences disable the animation, and code, formulas, and replacement content keep their original rendering.

  Collapse completed scale words back into ordinary text on subsequent updates to keep the active render tree small.

- Updated dependencies [a8c6013]
- Updated dependencies [4828c8c]
- Updated dependencies [4828c8c]
  - @fluxdown/core-presets@0.9.0
  - stative@2.1.0
  - @fluxdown/types@0.9.0

## 0.11.2

### Patch Changes

- cd2389a: Improve the visual appearance of streaming text with a longer fading tail and smoother continuation. Require scheduler `idle` and `resume` members, with default implementations in `BaseSmoothScheduler`.
- Updated dependencies [cd2389a]
  - @fluxdown/core-presets@0.8.0

## 0.11.1

### Patch Changes

- d346cb1: Remove redundant per-block compilation projections and compute unobserved metadata on demand while sharing the document block count.
- b6eea33: Reuse the latest prepared Markdown processor while its plugin functions and namespace stay unchanged. All plugins participate in reuse and must keep input-specific state within each run.
- Updated dependencies [9fbd532]
- Updated dependencies [c129be9]
- Updated dependencies [811e8ec]
- Updated dependencies [4147678]
- Updated dependencies [ecf42cf]
  - stative@2.0.1
  - @fluxdown/core-presets@0.7.3

## 0.11.0

### Minor Changes

- 6e5d714: Share plugin instances within each Core document through an optional `PluginCacheStore` on `PluginBuilder`. Plugins with the same class and recursively comparable configuration reuse one instance until their final consumer releases it. Retained block forks keep their plugin dependencies alive.

  Reuse configuration values when their references match, and compare distinct plain objects and arrays recursively by structure. Objects may provide `isPluginConfigEqual` to compare distinct instances explicitly. Configuration getters are never invoked during comparison.

  For low-level core integrations, `PluginBuilderInputs.plugins` now describes a resolved pluggable array instead of an `IReadableClosure`; reactive sources can still be supplied through stative JSX/descriptors. The former `PluginEntry` helper type is no longer exported.

## 0.10.0

### Minor Changes

- 5bfdbd3: Allow plugin tuples to set `disabled: true` to opt out of individual presets or custom plugins. Disabled plugins and mappers are not constructed, and their existing state is cleaned up when configuration changes.

### Patch Changes

- Updated dependencies [5bfdbd3]
  - @fluxdown/types@0.8.0
  - @fluxdown/core-presets@0.7.1

## 0.9.0

### Minor Changes

- 7c651f1: Reduce per-block state by sharing compiler inputs, deriving metadata on demand, and using read-only lifetime views for block content.

  Blocks without a range or mapper forward their source publications directly, including intentional same-reference notifications. Unobserved metadata is a pure projection evaluated on demand; destruction freezes published input values instead of preserving an extra relay's queue position.

### Patch Changes

- Updated dependencies [177889c]
- Updated dependencies [632914d]
- Updated dependencies [6658a55]
- Updated dependencies [632914d]
- Updated dependencies [f566cc2]
  - @fluxdown/types@0.7.2
  - stative@2.0.0
  - @fluxdown/core-presets@0.7.0

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
