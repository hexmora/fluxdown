# @fluxdown/lynx

## 0.2.0

### Minor Changes

- 043daed: Add a ReactLynx renderer with full, lite and raw components, native element plugins, themes and streaming effects. Preserve JSX for the host application's ReactLynx compiler and provide Storybook examples and renderer tests.

  Use a host-compatible clock for streaming mappers when the browser Performance API is unavailable.

  Bundle the headless Markdown parser dependencies with their DOM-free entity decoder so Lynx consumers do not require application-level resolution aliases.

### Patch Changes

- Updated dependencies [043daed]
  - @fluxdown/lynx-plugins@0.2.0
  - @fluxdown/core@0.12.6
  - @fluxdown/core-plugins@0.12.2
  - @fluxdown/utils@0.7.2
