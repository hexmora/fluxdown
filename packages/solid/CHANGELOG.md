# @fluxdown/solid

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
  - @fluxdown/solid-plugins@0.2.1
  - @fluxdown/types@0.10.2
  - @fluxdown/utils@0.7.3
  - stative@2.1.1

## 0.2.1

### Patch Changes

- 0889ca7: Clarify streaming Markdown package descriptions and keywords, and link each package to its framework's documentation.
- Updated dependencies [0889ca7]
  - @fluxdown/core@0.12.7

## 0.2.0

### Minor Changes

- 44a3c8d: Add Solid components and plugin presets for static and streaming Markdown, with full, lite, and raw entry points.

  Keep chunk animation batches stable when earlier batches settle into text.

  Keep native animation internals out of SVG blur props when rendering on the web.

### Patch Changes

- Updated dependencies [44a3c8d]
  - @fluxdown/solid-plugins@0.2.0
  - @fluxdown/core-plugins@0.12.3
