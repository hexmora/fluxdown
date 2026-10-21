# fluxdown

## 0.11.0

### Minor Changes

- 9867aed: Add a chunk streaming effect that fades each incoming text batch in together, preserves existing content and natural wrapping, and respects reduced motion.
- aeaa05f: Use monotonic animation clocks and scale as the default streaming effect. Keep plugin configuration entries optional while declaring complete global configuration registries, and organize effect documentation with shared streaming previews.
- ea3f399: Add a suffix streaming effect with cursor and dot markers, extensible marker types, and support for code blocks and syntax highlighting.

### Patch Changes

- Updated dependencies [9867aed]
- Updated dependencies [aeaa05f]
- Updated dependencies [ea3f399]
  - @fluxdown/core-presets@0.10.0
  - @fluxdown/core@0.12.1
  - @fluxdown/react-presets@0.8.0
  - @fluxdown/types@0.10.0

## 0.10.0

### Minor Changes

- a8c6013: Add the `scale` streaming effect and its `Scale` mapper and `ScaleRenderPlugin` presets. Enable it with `streaming: { effect: 'scale' }`, customize it with `['scale', { duration, from, blur }]`, or combine it with other effects.

  Newly revealed characters grow and fade into place with a shrinking blur, preserving their animation progress across updates and remounts. Defaults are 200 milliseconds, an initial scale of 0, and a blur radius of 0.08 em. Existing content remains still, reduced-motion preferences disable the animation, and code, formulas, and replacement content keep their original rendering.

  Collapse completed scale words back into ordinary text on subsequent updates to keep the active render tree small.

- 4828c8c: Add `streaming.effect` for built-in effects, custom mapper plugins, configured tuples, and ordered combinations. Visual effects now default to disabled, including with `streaming={true}`. Enable the trailing fade with `effect: true` or `effect: 'shad'`, or configure it with `effect: ['shad', config]`.

  Remove `streaming.shad`; migrate its values to `effect`, using `['shad', config]` for configured fades. Export `EffectItem` from the merged `EffectConfigs` registry and resolve effect keys through the mapper presets. Preserve the supplied mapper order so composed effects run in the requested sequence.

  Move fade mask width into the Shad mapper configuration. Renderers consume the width from each shaded block, without requiring CSS variables on the Fluxdown root.

  Normalize mapper configuration into stable readable inputs. Export plain Config, derived Inputs, and mixed-value PluginConfig types; apply plugin metadata at the registry boundary. Mapper configuration can switch between plain values and readable closures without rebuilding the mapper. Convert external states with `toClosure` before supplying them as configuration.

  Add a type-only `/typings` entry for the core preset foundation types, and use a mask for the shad gradient so it composes with transformed content.

### Patch Changes

- Updated dependencies [a8c6013]
- Updated dependencies [4828c8c]
- Updated dependencies [4828c8c]
  - @fluxdown/core@0.12.0
  - @fluxdown/core-presets@0.9.0
  - @fluxdown/react-presets@0.7.0
  - stative@2.1.0
  - @fluxdown/types@0.9.0

## 0.9.1

### Patch Changes

- cd2389a: Improve the visual appearance of streaming text with a longer fading tail and smoother continuation. Require scheduler `idle` and `resume` members, with default implementations in `BaseSmoothScheduler`.
- Updated dependencies [cd2389a]
  - @fluxdown/core-presets@0.8.0
  - @fluxdown/core@0.11.2
  - @fluxdown/react-presets@0.6.9

## 0.9.0

### Minor Changes

- c8829f8: Accept a single plugin pack as well as an ordered array in `plugins`. Equivalent single-pack and array configurations share the existing prop comparison behavior.

## 0.8.2

### Patch Changes

- 0062bce: Render primitive children without redundant Fragment fibers while preserving grouping and keys for element, array, and portal outputs.
- Updated dependencies [d346cb1]
- Updated dependencies [9fbd532]
- Updated dependencies [c129be9]
- Updated dependencies [811e8ec]
- Updated dependencies [4147678]
- Updated dependencies [4434b3a]
- Updated dependencies [b6eea33]
- Updated dependencies [ecf42cf]
  - @fluxdown/core@0.11.1
  - stative@2.0.1
  - @fluxdown/core-presets@0.7.3
  - @fluxdown/react-presets@0.6.8

## 0.8.1

### Patch Changes

- Updated dependencies [6e5d714]
  - @fluxdown/core@0.11.0
  - @fluxdown/react-presets@0.6.7

## 0.8.0

### Minor Changes

- 0724e81: Add theme tokens for inline code, dividers, footnotes, and font smoothing while preserving the existing preset styles and shared-token defaults. Allow CSS values in shared font-weight tokens.
- 5bfdbd3: Allow plugin tuples to set `disabled: true` to opt out of individual presets or custom plugins. Disabled plugins and mappers are not constructed, and their existing state is cleaned up when configuration changes.

### Patch Changes

- Updated dependencies [5bfdbd3]
  - @fluxdown/types@0.8.0
  - @fluxdown/core@0.10.0
  - @fluxdown/core-presets@0.7.1
  - @fluxdown/react-presets@0.6.6

## 0.7.5

### Patch Changes

- 334446a: Skip repeated root-list reconciliation when Fluxdown passes an equivalent style object. Actual style and class changes, and reactive child-list publications, continue to update the rendered content.
- Updated dependencies [177889c]
- Updated dependencies [632914d]
- Updated dependencies [7c651f1]
- Updated dependencies [6658a55]
- Updated dependencies [632914d]
- Updated dependencies [f566cc2]
  - @fluxdown/types@0.7.2
  - stative@2.0.0
  - @fluxdown/core@0.9.0
  - @fluxdown/core-presets@0.7.0
  - @fluxdown/react-presets@0.6.5

## 0.7.4

### Patch Changes

- 3222507: Keep ordinary Markdown repairs enabled when streaming ends and only disable ending repairs. Explicit `build.repair` settings still take precedence.
- Updated dependencies [d595ca8]
- Updated dependencies [1f8bb14]
- Updated dependencies [470fb5b]
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
  - @fluxdown/core@0.8.2
  - @fluxdown/core-presets@0.6.5

## 0.7.3

### Patch Changes

- aa2a08f: Allow compatible internal dependency updates through caret version ranges instead
  of exact version pins. Future updates within those ranges can be installed without
  releasing unchanged dependent packages. Existing consumer lockfiles must still be
  updated to resolve newer dependency versions.
- Updated dependencies [aa2a08f]
  - @fluxdown/core@0.8.1
  - @fluxdown/core-presets@0.6.4
  - @fluxdown/react-presets@0.6.4
  - @fluxdown/types@0.7.1

## 0.7.2

### Patch Changes

- Updated dependencies [a4457b5]
- Updated dependencies [cb73ca0]
- Updated dependencies [30d41c4]
- Updated dependencies [7557794]
- Updated dependencies [8eb9b3f]
  - stative@1.1.1
  - @fluxdown/core-presets@0.6.3
  - @fluxdown/core@0.8.0
  - @fluxdown/types@0.7.0
  - @fluxdown/react-presets@0.6.3

## 0.7.1

### Patch Changes

- Updated dependencies [ad0c6a8]
  - @fluxdown/core@0.7.1
  - @fluxdown/core-presets@0.6.2
  - @fluxdown/react-presets@0.6.2

## 0.7.0

### Minor Changes

- cc66511: Preserve HTML containers across Markdown block boundaries and align chunking with native GFM table rows, including rows without pipes. Configure indented code and Setext headings through build options shared by the chunker and the default syntax policy. Explicit plugin settings override the policy without changing chunking.
- cc66511: Group smooth rendering, Shad fading, and ending syntax repairs under the `streaming` prop. Streaming defaults to false; `true` or an options object enables all three features unless overridden. Move `build.repairEnding` to `streaming.repairEnding` and enable repairs by default when ending repair is requested, while preserving explicit `build.repair` overrides.

  Rename `FluxdownConfig` to `BaseBuildConfig`.

- cc66511: Remove `typography.fontSize.lg` and `typography.fontSize.xl` from the public theme configuration. The default h3 and h4 sizes remain 1.25rem and 1.125rem; customize them through `heading.h3.fontSize` and `heading.h4.fontSize`.

### Patch Changes

- cc66511: Render footnote bodies by default and keep references, backlinks, and labels aligned with sanitized IDs. React instances use hydration-safe footnote namespaces; headless consumers can set `build.idPrefix`. Correct the spelling of multiword ARIA attributes.
- Updated dependencies [cc66511]
- Updated dependencies [cc66511]
- Updated dependencies [cc66511]
- Updated dependencies [cc66511]
- Updated dependencies [cc66511]
- Updated dependencies [cc66511]
  - @fluxdown/core@0.7.0
  - @fluxdown/core-presets@0.6.1
  - @fluxdown/react-presets@0.6.1
  - stative@1.1.0
  - @fluxdown/types@0.6.1

## 0.6.0

### Minor Changes

- 1242fc4: Initial release with extensible Markdown rendering for streaming content, framework-independent processing, and React integrations with Shad tail shading and smooth rendering.

### Patch Changes

- Updated dependencies [1242fc4]
- Updated dependencies [1242fc4]
  - @fluxdown/core@0.6.0
  - @fluxdown/core-presets@0.6.0
  - @fluxdown/react-presets@0.6.0
  - @fluxdown/types@0.6.0
  - @fluxdown/utils@0.6.0
  - stative@1.0.2
