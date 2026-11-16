# @fluxdown/react-plugins

## 0.12.3

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
- Updated dependencies [fba214a]
  - @fluxdown/core-plugins@0.14.0
  - @fluxdown/react-base-plugins@0.11.3
  - @fluxdown/types@0.11.0

## 0.12.2

### Patch Changes

- a6380c3: Move documentation links and package homepages to https://fluxdown.dev/.
- Updated dependencies [a6380c3]
  - @fluxdown/react-base-plugins@0.11.2
  - @fluxdown/types@0.10.2

## 0.12.1

### Patch Changes

- cd5b1f8: Stabilize syntax-highlighter verification for cold language loads and tokenization under CI load. Runtime highlighting behavior is unchanged.

## 0.12.0

### Minor Changes

- 8691710: Rename lite plugin presets consistently, expose native theme types from the plugins package, and refine documentation, locale preferences, navigation, and renderer comparisons.

### Patch Changes

- Updated dependencies [8691710]
  - @fluxdown/react-base-plugins@0.11.1

## 0.11.0

### Minor Changes

- 9f08ddc: Separate platform-independent React rendering and base plugins from DOM slots, themes, and preset packs. Replace @fluxdown/react-presets with @fluxdown/react-base-plugins and @fluxdown/react-plugins, add @fluxdown/react-base and @fluxdown/react-hooks, and rename @fluxdown/core-presets to @fluxdown/core-plugins. Retain the full, lite, and raw Fluxdown entries.

### Patch Changes

- Updated dependencies [9f08ddc]
  - @fluxdown/react-base-plugins@0.11.0
