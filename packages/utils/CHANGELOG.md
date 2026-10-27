# @fluxdown/utils

## 0.7.2

### Patch Changes

- c9598c5: Add a ReactLynx renderer with full, lite and raw components, native element plugins, themes and streaming effects. Preserve JSX for the host application's ReactLynx compiler and provide Storybook examples and renderer tests.

  Use a host-compatible clock for streaming mappers when the browser Performance API is unavailable.

  Bundle the headless Markdown parser dependencies with their DOM-free entity decoder so Lynx consumers do not require application-level resolution aliases.

## 0.7.1

### Patch Changes

- 9f08ddc: Separate platform-independent React rendering and base plugins from DOM slots, themes, and preset packs. Replace @fluxdown/react-presets with @fluxdown/react-base-plugins and @fluxdown/react-plugins, add @fluxdown/react-base and @fluxdown/react-hooks, and rename @fluxdown/core-presets to @fluxdown/core-plugins. Retain the full, lite, and raw Fluxdown entries.

## 0.7.0

### Minor Changes

- 134f67b: Add raw, lite, and full React entry points with independently importable plugin packs. Split code highlighting into plain, Prism, and Shiki options, and formulas into source, lazy KaTeX, and lazy KaTeX with MathJax fallback. Export plugin pack types from react-presets/typings and replace the render/slot barrels with plugins/\* exports.

  Compose derived packs with pluginExtends and give later renderers precedence at equal priority, preserving slot composition and explicit disabling. Load only each entry's styles, and document aggregate plugins and bundle choices with live Lite and Full examples.

  Export PartialBy from @fluxdown/utils and reuse it for optional plugin props in the full and lite entries and prop comparison.

## 0.6.0

### Minor Changes

- 1242fc4: Initial release with extensible Markdown rendering for streaming content, framework-independent processing, and React integrations with Shad tail shading and smooth rendering.
