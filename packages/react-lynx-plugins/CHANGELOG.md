# @fluxdown/lynx-plugins

## 0.4.0

### Minor Changes

- cedcaa2: Add Vue Lynx rendering and native plugins with the same themes, Markdown elements, and streaming effects as React Lynx. Rename the existing Lynx packages to React Lynx, and expose both frameworks in the website, documentation, and release consumer checks.

  Use Shiki's Oniguruma WebAssembly engine for both Lynx renderers so code highlighting also works on Android QuickJS, and keep syntax colors current when themes change during initialization.

  Preserve measured Shad token widths when the parent reports its initial layout width, keeping the gradient consistent across both frameworks and native hosts.

  Expand Vue Lynx suffix keyframes for its native encoder while preserving React Lynx animation timing and opacity.

  Share the Vue renderer lifecycle, reconciliation, and host-independent render plugins through `@fluxdown/vue-base` and `@fluxdown/vue-base-plugins`, keeping DOM and Lynx attributes, styles, and animations in their platform packages.

  Align Lynx plugin exports and base directories with the other plugin packages. Keep code blocks readable without highlighting when Shiki initialization or tokenization fails.

  Import shared Vue plugins and contracts directly from `@fluxdown/vue-base-plugins`. Use `TexMathJaxPlugin` for Lynx Full formulas, match the Vue MathJax extension set, and provide optional native Prism highlighting.

## 0.3.1

### Patch Changes

- a6380c3: Move documentation links and package homepages to https://fluxdown.dev/.
- Updated dependencies [a6380c3]
- Updated dependencies [65f128e]
- Updated dependencies [65f128e]
- Updated dependencies [65f128e]
  - @fluxdown/core@0.12.8
  - @fluxdown/core-plugins@0.13.0
  - @fluxdown/hast@0.7.2
  - @fluxdown/types@0.10.2
  - @fluxdown/utils@0.7.3
  - stative@2.1.1

## 0.3.0

### Minor Changes

- 53d58c8: Add an opt-in TexSvgPlugin that typesets TeX with MathJax and native Lynx SVG elements. Support inline and display formulas, theme colors, horizontal overflow, and source fallback for unfinished or invalid input.

## 0.2.0

### Minor Changes

- c9598c5: Add a ReactLynx renderer with full, lite and raw components, native element plugins, themes and streaming effects. Preserve JSX for the host application's ReactLynx compiler and provide Storybook examples and renderer tests.

  Use a host-compatible clock for streaming mappers when the browser Performance API is unavailable.

  Bundle the headless Markdown parser dependencies with their DOM-free entity decoder so Lynx consumers do not require application-level resolution aliases.

### Patch Changes

- Updated dependencies [c9598c5]
  - @fluxdown/core@0.12.6
  - @fluxdown/core-plugins@0.12.2
  - @fluxdown/utils@0.7.2
