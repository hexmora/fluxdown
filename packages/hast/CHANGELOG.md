# @fluxdown/hast

## 0.7.1

### Patch Changes

- 8691710: Keep native streaming text on a stable baseline while measuring and drawing inline effects. Restore chunk fades through text color alpha and preserve inherited typography without platform-specific rendering branches.

  Keep active scale words and characters mounted when settled text is collapsed during streaming.

  Keep shad measurements attached to complete words and stable text positions as the active tail moves, preserving settled prefixes while layouts update.

## 0.7.0

### Minor Changes

- ad0c6a8: Preserve block boundaries for trailing list whitespace and reduce repeated work during streaming. Add an immutable HAST projection API to share grapheme indexes within a compiled revision, retain unchanged revision subscriptions, and limit cutoff and shading updates to active blocks while preserving dynamic animation behavior.

## 0.6.0

### Minor Changes

- 1242fc4: Initial release with extensible Markdown rendering for streaming content, framework-independent processing, and React integrations with Shad tail shading and smooth rendering.
