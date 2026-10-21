# @fluxdown/utils

## 0.7.0

### Minor Changes

- 134f67b: Add raw, lite, and full React entry points with independently importable plugin packs. Split code highlighting into plain, Prism, and Shiki options, and formulas into source, lazy KaTeX, and lazy KaTeX with MathJax fallback. Export plugin pack types from react-presets/typings and replace the render/slot barrels with plugins/\* exports.

  Compose derived packs with pluginExtends and give later renderers precedence at equal priority, preserving slot composition and explicit disabling. Load only each entry's styles, and document aggregate plugins and bundle choices with live Lite and Full examples.

  Export PartialBy from @fluxdown/utils and reuse it for optional plugin props in the full and lite entries and prop comparison.

## 0.6.0

### Minor Changes

- 1242fc4: Initial release with extensible Markdown rendering for streaming content, framework-independent processing, and React integrations with Shad tail shading and smooth rendering.
