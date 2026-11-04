# @fluxdown/lynx

## 0.3.2

### Patch Changes

- a6380c3: Move documentation links and package homepages to https://fluxdown.dev/.
- Updated dependencies [a6380c3]
- Updated dependencies [65f128e]
- Updated dependencies [65f128e]
- Updated dependencies [65f128e]
  - @fluxdown/core@0.12.8
  - @fluxdown/core-plugins@0.13.0
  - @fluxdown/lynx-plugins@0.3.1
  - @fluxdown/types@0.10.2
  - @fluxdown/utils@0.7.3
  - stative@2.1.1

## 0.3.1

### Patch Changes

- 0889ca7: Clarify streaming Markdown package descriptions and keywords, and link each package to its framework's documentation.
- Updated dependencies [0889ca7]
  - @fluxdown/core@0.12.7

## 0.3.0

### Minor Changes

- 3efd67a: Remove the component-level getProps option and consistently use the built-in Lynx attribute mapping. Customize native attributes and interactions through render or slot plugins; render plugins retain their getProps helper.

### Patch Changes

- Updated dependencies [53d58c8]
  - @fluxdown/lynx-plugins@0.3.0

## 0.2.0

### Minor Changes

- c9598c5: Add a ReactLynx renderer with full, lite and raw components, native element plugins, themes and streaming effects. Preserve JSX for the host application's ReactLynx compiler and provide Storybook examples and renderer tests.

  Use a host-compatible clock for streaming mappers when the browser Performance API is unavailable.

  Bundle the headless Markdown parser dependencies with their DOM-free entity decoder so Lynx consumers do not require application-level resolution aliases.

### Patch Changes

- Updated dependencies [c9598c5]
  - @fluxdown/lynx-plugins@0.2.0
  - @fluxdown/core@0.12.6
  - @fluxdown/core-plugins@0.12.2
  - @fluxdown/utils@0.7.2
