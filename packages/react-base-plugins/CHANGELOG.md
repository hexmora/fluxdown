# @fluxdown/react-presets

## 0.11.3

### Patch Changes

- fba214a: Preserve escaped and entity-encoded literals during streaming repairs using node-local source metadata, without position-based lookups. Improve pending lists, tasks, headings, nested emphasis and strikethrough, multi-backtick code, partial fences, links, images, and character references. Keep completed syntax and ambiguous prose intact, respect the active strikethrough configuration, and skip source-dependent checks when source metadata is unavailable. Separate shared syntax helpers from repair infrastructure.

  Hold uncertain ordered-list digits only during ending repair. Stabilize incomplete HTML attributes, autolinks, reference definitions, and inline formatting in open table cells. Keep incomplete TeX in its math mode and render its longest engine-accepted prefix, caching checked endpoints across appended input and preserving repair metadata through HTML parsing. Restore literal input when ending repairs are disabled, and avoid invalid HTML nesting in table and display-math rendering.

  Continue tail repairs after reference-node replacement, hold matching delayed-definition labels until their role is known, and support streamed links and images in open table cells. Keep unresolved explicit references in document scope so chunked rendering preserves them while later definitions and titles arrive. Preserve verified open-cell boundaries for one repair pass without retaining stale source, and resolve list structure before inline repairs consume its provenance. Cover these combinations with character-by-character streaming regressions through the repair pipeline and the React renderer.

  Evaluate plugin admission through enabled(context), keep behavior in constructor options, and identify syntax dependencies with plugin keys. Keep table preparation in its repair plugin, source invalidation in shared repair infrastructure, and syntax-specific helpers in their owning plugins. Run TeX prefix validation and bounded prefix caching in the default core TeX repair plugin so renderers receive repaired data directly. KaTeX validates prefixes by default, while renderer components retain lazy loading. Disabling table repair also disables its cross-plugin boundary preparation.

  Plugin classes may provide static enabled(context) and static prepareConfig(context, outerConfig) to resolve admission and constructor options before instantiation. Returning null preserves the outer options. Repair implementations also provide prepare(node). The base classes supply the default static enablement and configuration methods, and the no-op repair preparation method. Concrete syntax configuration stays in the owning plugins rather than the pluggable assembler.

- fba214a: Resolve plugin enablement and constructor configuration through optional static `enabled` and `prepareConfig` hooks across all plugin types. Keep context outside instances and refresh active pluggables when reactive inputs change.

  Include `TexRepairPlugin` in the default core repair preset. Core plugins depend on KaTeX to select a valid streaming prefix when no custom `render` is supplied; renderer plugins use this preset without separate repair registration.

  Keep repair output intact across all renderer adapters, including trailing TeX whitespace and empty pending formulas. Validate streaming TeX in the repair layer and preserve lazy loading in renderer components, with an empty loading placeholder instead of raw-source flashes. Default compiler presets now include KaTeX; MathJax-only syntax is deferred until the formula closes unless a custom validator is configured.

- fba214a: Preserve text colors and surface backgrounds with transparent Shad masks, including blockquotes and inline formatting. Keep quoted lists muted, nested quote edge spacing consistent, and quote corners aligned in right-to-left layouts.

  Allow italic synthesis for fonts without an italic face, and align task checkboxes with the first text line in tight and loose lists.

  Omit whitespace-only children in table structural elements to keep generated HTML valid.

- Updated dependencies [fba214a]
- Updated dependencies [fba214a]
- Updated dependencies [fba214a]
  - @fluxdown/core-plugins@0.14.0
  - @fluxdown/core@0.13.0
  - @fluxdown/types@0.11.0

## 0.11.2

### Patch Changes

- a6380c3: Move documentation links and package homepages to https://fluxdown.dev/.
- Updated dependencies [a6380c3]
- Updated dependencies [65f128e]
- Updated dependencies [65f128e]
- Updated dependencies [65f128e]
  - @fluxdown/core@0.12.8
  - @fluxdown/core-plugins@0.13.0
  - @fluxdown/react-hooks@0.2.1
  - @fluxdown/types@0.10.2
  - @fluxdown/utils@0.7.3
  - stative@2.1.1

## 0.11.1

### Patch Changes

- 8691710: Keep native streaming text on a stable baseline while measuring and drawing inline effects. Restore chunk fades through text color alpha and preserve inherited typography without platform-specific rendering branches.

  Keep active scale words and characters mounted when settled text is collapsed during streaming.

  Keep shad measurements attached to complete words and stable text positions as the active tail moves, preserving settled prefixes while layouts update.

- Updated dependencies [8691710]
  - @fluxdown/core-plugins@0.12.1
  - @fluxdown/core@0.12.5

## 0.11.0

### Minor Changes

- 9f08ddc: Separate platform-independent React rendering and base plugins from DOM slots, themes, and preset packs. Replace @fluxdown/react-presets with @fluxdown/react-base-plugins and @fluxdown/react-plugins, add @fluxdown/react-base and @fluxdown/react-hooks, and rename @fluxdown/core-presets to @fluxdown/core-plugins. Retain the full, lite, and raw Fluxdown entries.

### Patch Changes

- Updated dependencies [9f08ddc]
  - @fluxdown/core@0.12.4
  - @fluxdown/core-plugins@0.12.0
  - @fluxdown/utils@0.7.1
  - @fluxdown/react-hooks@0.2.0

## 0.10.0

### Minor Changes

- 2bb482d: Add CjkPlugin and headless CjkRemarkPlugin for CJK emphasis, strikethrough, and autolink punctuation boundaries. Enable CJK parsing in the Full preset, retain explicit installation in Lite and Raw, and preserve strikethrough configuration and literal link targets.
- 1df885d: Add EmojiRemarkPlugin and EmojiPlugin to convert GitHub emoji shortcodes to Unicode emoji. Enable EmojiPlugin in Full while preserving unknown shortcodes and code literals. Lite and Core can opt in.
- 2625a56: Add the lazy CodePelePlugin to render Mermaid diagrams and mindmaps as themed SVG without DOM or canvas measurement. The full preset includes it by default; lite consumers can import it separately. Code blocks use native Mermaid syntax, show source while loading, and retain the last valid diagram during incomplete edits.

### Patch Changes

- 9170bab: Move core preset imports to `@fluxdown/core-presets/presets/<type>` and individual plugin imports to `@fluxdown/core-presets/plugins/<type>/<name>`. The previous `/mapper`, `/remark`, `/rehype`, and `/repair` aggregate entry points are removed; import each plugin and its related types from its own subpath.
- Updated dependencies [2bb482d]
- Updated dependencies [1df885d]
- Updated dependencies [9170bab]
  - @fluxdown/core-presets@0.11.0
  - @fluxdown/core@0.12.3

## 0.9.1

### Patch Changes

- b1d3ade: Load Prism highlighting lazily and add the full extended language bundle used by next-raw, including language aliases and embedded template support. Preserve readable source while loading, after failures, and during server rendering, and ignore stale highlighting results when streamed code changes.

## 0.9.0

### Minor Changes

- 134f67b: Add raw, lite, and full React entry points with independently importable plugin packs. Split code highlighting into plain, Prism, and Shiki options, and formulas into source, lazy KaTeX, and lazy KaTeX with MathJax fallback. Export plugin pack types from react-presets/typings and replace the render/slot barrels with plugins/\* exports.

  Compose derived packs with pluginExtends and give later renderers precedence at equal priority, preserving slot composition and explicit disabling. Load only each entry's styles, and document aggregate plugins and bundle choices with live Lite and Full examples.

  Export PartialBy from @fluxdown/utils and reuse it for optional plugin props in the full and lite entries and prop comparison.

### Patch Changes

- Updated dependencies [134f67b]
  - @fluxdown/utils@0.7.0
  - @fluxdown/core@0.12.2
  - @fluxdown/core-presets@0.10.1
  - @fluxdown/types@0.10.1

## 0.8.0

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
  - @fluxdown/types@0.10.0

## 0.7.0

### Minor Changes

- a8c6013: Add the `scale` streaming effect and its `Scale` mapper and `ScaleRenderPlugin` presets. Enable it with `streaming: { effect: 'scale' }`, customize it with `['scale', { duration, from, blur }]`, or combine it with other effects.

  Newly revealed characters grow and fade into place with a shrinking blur, preserving their animation progress across updates and remounts. Defaults are 200 milliseconds, an initial scale of 0, and a blur radius of 0.08 em. Existing content remains still, reduced-motion preferences disable the animation, and code, formulas, and replacement content keep their original rendering.

  Collapse completed scale words back into ordinary text on subsequent updates to keep the active render tree small.

### Patch Changes

- 4828c8c: Add `streaming.effect` for built-in effects, custom mapper plugins, configured tuples, and ordered combinations. Visual effects now default to disabled, including with `streaming={true}`. Enable the trailing fade with `effect: true` or `effect: 'shad'`, or configure it with `effect: ['shad', config]`.

  Remove `streaming.shad`; migrate its values to `effect`, using `['shad', config]` for configured fades. Export `EffectItem` from the merged `EffectConfigs` registry and resolve effect keys through the mapper presets. Preserve the supplied mapper order so composed effects run in the requested sequence.

  Move fade mask width into the Shad mapper configuration. Renderers consume the width from each shaded block, without requiring CSS variables on the Fluxdown root.

  Normalize mapper configuration into stable readable inputs. Export plain Config, derived Inputs, and mixed-value PluginConfig types; apply plugin metadata at the registry boundary. Mapper configuration can switch between plain values and readable closures without rebuilding the mapper. Convert external states with `toClosure` before supplying them as configuration.

  Add a type-only `/typings` entry for the core preset foundation types, and use a mask for the shad gradient so it composes with transformed content.

- Updated dependencies [a8c6013]
- Updated dependencies [4828c8c]
- Updated dependencies [4828c8c]
  - @fluxdown/core@0.12.0
  - @fluxdown/core-presets@0.9.0
  - stative@2.1.0
  - @fluxdown/types@0.9.0

## 0.6.9

### Patch Changes

- Updated dependencies [cd2389a]
  - @fluxdown/core-presets@0.8.0
  - @fluxdown/core@0.11.2

## 0.6.8

### Patch Changes

- 4434b3a: Reduce per-subscription React hooks and snapshot bookkeeping without changing selector equality or committed snapshot behavior.
- Updated dependencies [d346cb1]
- Updated dependencies [9fbd532]
- Updated dependencies [c129be9]
- Updated dependencies [811e8ec]
- Updated dependencies [4147678]
- Updated dependencies [b6eea33]
- Updated dependencies [ecf42cf]
  - @fluxdown/core@0.11.1
  - stative@2.0.1
  - @fluxdown/core-presets@0.7.3

## 0.6.7

### Patch Changes

- Updated dependencies [6e5d714]
  - @fluxdown/core@0.11.0

## 0.6.6

### Patch Changes

- Updated dependencies [5bfdbd3]
  - @fluxdown/types@0.8.0
  - @fluxdown/core@0.10.0
  - @fluxdown/core-presets@0.7.1

## 0.6.5

### Patch Changes

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

## 0.6.4

### Patch Changes

- aa2a08f: Allow compatible internal dependency updates through caret version ranges instead
  of exact version pins. Future updates within those ranges can be installed without
  releasing unchanged dependent packages. Existing consumer lockfiles must still be
  updated to resolve newer dependency versions.
- Updated dependencies [aa2a08f]
  - @fluxdown/core@0.8.1
  - @fluxdown/core-presets@0.6.4
  - @fluxdown/types@0.7.1

## 0.6.3

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

## 0.6.2

### Patch Changes

- Updated dependencies [ad0c6a8]
  - @fluxdown/core@0.7.1
  - @fluxdown/core-presets@0.6.2

## 0.6.1

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
  - @fluxdown/types@0.6.0
  - @fluxdown/utils@0.6.0
  - stative@1.0.2
