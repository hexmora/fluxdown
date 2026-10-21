# @fluxdown/website

## 0.0.5

### Patch Changes

- 134f67b: Add raw, lite, and full React entry points with independently importable plugin packs. Split code highlighting into plain, Prism, and Shiki options, and formulas into source, lazy KaTeX, and lazy KaTeX with MathJax fallback. Export plugin pack types from react-presets/typings and replace the render/slot barrels with plugins/\* exports.

  Compose derived packs with pluginExtends and give later renderers precedence at equal priority, preserving slot composition and explicit disabling. Load only each entry's styles, and document aggregate plugins and bundle choices with live Lite and Full examples.

  Export PartialBy from @fluxdown/utils and reuse it for optional plugin props in the full and lite entries and prop comparison.

- Updated dependencies [134f67b]
  - @fluxdown/react-presets@0.9.0
  - @fluxdown/utils@0.7.0
  - fluxdown@0.12.0
  - @fluxdown/core@0.12.2
  - @fluxdown/core-presets@0.10.1

## 0.0.4

### Patch Changes

- Updated dependencies [9867aed]
- Updated dependencies [aeaa05f]
- Updated dependencies [ea3f399]
  - @fluxdown/core-presets@0.10.0
  - @fluxdown/core@0.12.1
  - @fluxdown/react-presets@0.8.0
  - fluxdown@0.11.0

## 0.0.3

### Patch Changes

- Updated dependencies [a8c6013]
- Updated dependencies [4828c8c]
- Updated dependencies [4828c8c]
  - fluxdown@0.10.0
  - @fluxdown/core@0.12.0
  - @fluxdown/core-presets@0.9.0
  - @fluxdown/react-presets@0.7.0
  - stative@2.1.0

## 0.0.2

### Patch Changes

- Updated dependencies [cd2389a]
  - @fluxdown/core-presets@0.8.0
  - @fluxdown/core@0.11.2
  - fluxdown@0.9.1
  - @fluxdown/react-presets@0.6.9

## 0.0.1

### Patch Changes

- Updated dependencies [c8829f8]
  - fluxdown@0.9.0
