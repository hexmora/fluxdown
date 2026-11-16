# @fluxdown/react-native-plugins

## 0.2.3

### Patch Changes

- fba214a: Resolve plugin enablement and constructor configuration through optional static `enabled` and `prepareConfig` hooks across all plugin types. Keep context outside instances and refresh active pluggables when reactive inputs change.

  Include `TexRepairPlugin` in the default core repair preset. Core plugins depend on KaTeX to select a valid streaming prefix when no custom `render` is supplied; renderer plugins use this preset without separate repair registration.

  Keep repair output intact across all renderer adapters, including trailing TeX whitespace and empty pending formulas. Validate streaming TeX in the repair layer and preserve lazy loading in renderer components, with an empty loading placeholder instead of raw-source flashes. Default compiler presets now include KaTeX; MathJax-only syntax is deferred until the formula closes unless a custom validator is configured.

- Updated dependencies [fba214a]
- Updated dependencies [fba214a]
- Updated dependencies [fba214a]
- Updated dependencies [fba214a]
  - @fluxdown/react-base-plugins@0.11.3
  - @fluxdown/types@0.11.0

## 0.2.2

### Patch Changes

- a6380c3: Move documentation links and package homepages to https://fluxdown.dev/.
- Updated dependencies [a6380c3]
  - @fluxdown/hast@0.7.2
  - @fluxdown/react-base-plugins@0.11.2
  - @fluxdown/react-hooks@0.2.1
  - @fluxdown/types@0.10.2
  - @fluxdown/utils@0.7.3

## 0.2.1

### Patch Changes

- 44a3c8d: Add Solid components and plugin presets for static and streaming Markdown, with full, lite, and raw entry points.

  Keep chunk animation batches stable when earlier batches settle into text.

  Keep native animation internals out of SVG blur props when rendering on the web.

## 0.2.0

### Minor Changes

- 8691710: Rename lite plugin presets consistently, expose native theme types from the plugins package, and refine documentation, locale preferences, navigation, and renderer comparisons.
- 8691710: Add React Native components and plugin presets, with shared base rendering, native streaming effects, syntax highlighting, SVG formulas and Mermaid diagrams, and a React Native Web documentation preview.

### Patch Changes

- 8691710: Align Native streaming effects with the React renderer through shared drawing and animation logic, preserving text layout, inherited typography, animation progress, and SVG blur updates. Require react-native-svg for the shared effect presets and update installation guidance. Validate shared effects on Android, preserve native text baselines, and use Metro-compatible MathJax modules for formulas.
- 8691710: Keep native streaming text on a stable baseline while measuring and drawing inline effects. Restore chunk fades through text color alpha and preserve inherited typography without platform-specific rendering branches.

  Keep active scale words and characters mounted when settled text is collapsed during streaming.

  Keep shad measurements attached to complete words and stable text positions as the active tail moves, preserving settled prefixes while layouts update.

- Updated dependencies [8691710]
  - @fluxdown/react-base-plugins@0.11.1
  - @fluxdown/hast@0.7.1
