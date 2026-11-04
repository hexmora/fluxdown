# @fluxdown/vue

## 0.3.0

### Minor Changes

- cedcaa2: Add Vue Lynx rendering and native plugins with the same themes, Markdown elements, and streaming effects as React Lynx. Rename the existing Lynx packages to React Lynx, and expose both frameworks in the website, documentation, and release consumer checks.

  Use Shiki's Oniguruma WebAssembly engine for both Lynx renderers so code highlighting also works on Android QuickJS, and keep syntax colors current when themes change during initialization.

  Preserve measured Shad token widths when the parent reports its initial layout width, keeping the gradient consistent across both frameworks and native hosts.

  Expand Vue Lynx suffix keyframes for its native encoder while preserving React Lynx animation timing and opacity.

  Share the Vue renderer lifecycle, reconciliation, and host-independent render plugins through `@fluxdown/vue-base` and `@fluxdown/vue-base-plugins`, keeping DOM and Lynx attributes, styles, and animations in their platform packages.

  Align Lynx plugin exports and base directories with the other plugin packages. Keep code blocks readable without highlighting when Shiki initialization or tokenization fails.

  Import shared Vue plugins and contracts directly from `@fluxdown/vue-base-plugins`. Use `TexMathJaxPlugin` for Lynx Full formulas, match the Vue MathJax extension set, and provide optional native Prism highlighting.

### Patch Changes

- Updated dependencies [cedcaa2]
  - @fluxdown/vue-base@0.2.0
  - @fluxdown/vue-base-plugins@0.2.0
  - @fluxdown/vue-plugins@0.3.0

## 0.2.2

### Patch Changes

- a6380c3: Move documentation links and package homepages to https://fluxdown.dev/.
- 65f128e: Require a current-clock reader for custom smooth tickers and provide the shared implementation on BaseSmoothTicker. Keep deterministic ticker fixtures on the same arrival and frame clock.
- Updated dependencies [a6380c3]
- Updated dependencies [65f128e]
- Updated dependencies [65f128e]
- Updated dependencies [65f128e]
  - @fluxdown/core@0.12.8
  - @fluxdown/core-plugins@0.13.0
  - @fluxdown/types@0.10.2
  - @fluxdown/utils@0.7.3
  - @fluxdown/vue-plugins@0.2.1
  - stative@2.1.1

## 0.2.1

### Patch Changes

- 0889ca7: Clarify streaming Markdown package descriptions and keywords, and link each package to its framework's documentation.
- Updated dependencies [0889ca7]
  - @fluxdown/core@0.12.7

## 0.2.0

### Minor Changes

- ee390c4: Add Vue 3 Markdown components with full, lite, and raw entries, composable render and slot plugins, themes, patches, and streaming effects.

### Patch Changes

- Updated dependencies [ee390c4]
  - @fluxdown/vue-plugins@0.2.0
