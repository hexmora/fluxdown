# @fluxdown/react-native

## 0.2.2

### Patch Changes

- fd73816: Allow the full-rendering integration test enough time to initialize its lazy-loaded engines on CI. Runtime behavior is unchanged.

## 0.2.1

### Patch Changes

- 44a3c8d: Make the shade continuity regression test independent of CI timing while preserving its rendering and host identity assertions.
- Updated dependencies [44a3c8d]
  - @fluxdown/react-native-plugins@0.2.1

## 0.2.0

### Minor Changes

- 8691710: Rename lite plugin presets consistently, expose native theme types from the plugins package, and refine documentation, locale preferences, navigation, and renderer comparisons.
- 8691710: Add React Native components and plugin presets, with shared base rendering, native streaming effects, syntax highlighting, SVG formulas and Mermaid diagrams, and a React Native Web documentation preview.

### Patch Changes

- 8691710: Align Native streaming effects with the React renderer through shared drawing and animation logic, preserving text layout, inherited typography, animation progress, and SVG blur updates. Require react-native-svg for the shared effect presets and update installation guidance. Validate shared effects on Android, preserve native text baselines, and use Metro-compatible MathJax modules for formulas.
- 8691710: Keep native streaming text on a stable baseline while measuring and drawing inline effects. Restore chunk fades through text color alpha and preserve inherited typography without platform-specific rendering branches.

  Keep active scale words and characters mounted when settled text is collapsed during streaming.

  Keep shad measurements attached to complete words and stable text positions as the active tail moves, preserving settled prefixes while layouts update.

- Updated dependencies [8691710]
- Updated dependencies [8691710]
- Updated dependencies [8691710]
- Updated dependencies [8691710]
  - @fluxdown/react-native-plugins@0.2.0
  - @fluxdown/react-base@0.14.1
  - @fluxdown/react-base-plugins@0.11.1
