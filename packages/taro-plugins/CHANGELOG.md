# @fluxdown/taro-plugins

## 0.1.3

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

## 0.1.2

### Patch Changes

- a6380c3: Move documentation links and package homepages to https://fluxdown.dev/.
- Updated dependencies [a6380c3]
  - @fluxdown/react-base-plugins@0.11.2
  - @fluxdown/types@0.10.2
  - @fluxdown/utils@0.7.3

## 0.1.1

### Patch Changes

- 3c44059: Add Taro Markdown components with full, lite, and raw packs, native Taro slots, shared streaming effects, themes, Prism highlighting, and KaTeX formulas with a MathJax SVG fallback.
