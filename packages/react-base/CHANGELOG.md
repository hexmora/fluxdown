# @fluxdown/react-base

## 0.14.1

### Patch Changes

- 8691710: Keep native streaming text on a stable baseline while measuring and drawing inline effects. Restore chunk fades through text color alpha and preserve inherited typography without platform-specific rendering branches.

  Keep active scale words and characters mounted when settled text is collapsed during streaming.

  Keep shad measurements attached to complete words and stable text positions as the active tail moves, preserving settled prefixes while layouts update.

- Updated dependencies [8691710]
  - @fluxdown/core-plugins@0.12.1
  - @fluxdown/core@0.12.5
  - @fluxdown/react-base-plugins@0.11.1

## 0.14.0

### Minor Changes

- 9f08ddc: Separate platform-independent React rendering and base plugins from DOM slots, themes, and preset packs. Replace @fluxdown/react-presets with @fluxdown/react-base-plugins and @fluxdown/react-plugins, add @fluxdown/react-base and @fluxdown/react-hooks, and rename @fluxdown/core-presets to @fluxdown/core-plugins. Retain the full, lite, and raw Fluxdown entries.

### Patch Changes

- Updated dependencies [9f08ddc]
  - @fluxdown/core@0.12.4
  - @fluxdown/core-plugins@0.12.0
  - @fluxdown/utils@0.7.1
  - @fluxdown/react-hooks@0.2.0
  - @fluxdown/react-base-plugins@0.11.0
