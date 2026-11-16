# @fluxdown/angular-plugins

## 0.2.2

### Patch Changes

- fba214a: Resolve plugin enablement and constructor configuration through optional static `enabled` and `prepareConfig` hooks across all plugin types. Keep context outside instances and refresh active pluggables when reactive inputs change.

  Include `TexRepairPlugin` in the default core repair preset. Core plugins depend on KaTeX to select a valid streaming prefix when no custom `render` is supplied; renderer plugins use this preset without separate repair registration.

  Keep repair output intact across all renderer adapters, including trailing TeX whitespace and empty pending formulas. Validate streaming TeX in the repair layer and preserve lazy loading in renderer components, with an empty loading placeholder instead of raw-source flashes. Default compiler presets now include KaTeX; MathJax-only syntax is deferred until the formula closes unless a custom validator is configured.

- Updated dependencies [fba214a]
- Updated dependencies [fba214a]
- Updated dependencies [fba214a]
  - @fluxdown/core-plugins@0.14.0
  - @fluxdown/core@0.13.0
  - @fluxdown/types@0.11.0

## 0.2.1

### Patch Changes

- a6380c3: Move documentation links and package homepages to https://fluxdown.dev/.
- Updated dependencies [a6380c3]
- Updated dependencies [65f128e]
- Updated dependencies [65f128e]
- Updated dependencies [65f128e]
  - @fluxdown/core@0.12.8
  - @fluxdown/core-plugins@0.13.0
  - @fluxdown/types@0.10.2
  - @fluxdown/utils@0.7.3
  - stative@2.1.1

## 0.2.0

### Minor Changes

- e591342: Add Angular components and plugin presets for static and streaming Markdown, including raw, lite, and full entry points, configurable slots, themes, patches, and all four streaming effects.

  Add English and Chinese Angular guides and include Angular in the shared examples, renderer comparisons, homepage, and playground.
