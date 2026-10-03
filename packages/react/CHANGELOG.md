# fluxdown

## 0.7.1

### Patch Changes

- Updated dependencies [ad0c6a8]
  - @fluxdown/core@0.7.1
  - @fluxdown/core-presets@0.6.2
  - @fluxdown/react-presets@0.6.2

## 0.7.0

### Minor Changes

- cc66511: Preserve HTML containers across Markdown block boundaries and align chunking with native GFM table rows, including rows without pipes. Configure indented code and Setext headings through build options shared by the chunker and the default syntax policy. Explicit plugin settings override the policy without changing chunking.
- cc66511: Group smooth rendering, Shad fading, and ending syntax repairs under the `streaming` prop. Streaming defaults to false; `true` or an options object enables all three features unless overridden. Move `build.repairEnding` to `streaming.repairEnding` and enable repairs by default when ending repair is requested, while preserving explicit `build.repair` overrides.

  Rename `FluxdownConfig` to `BaseBuildConfig`.

- cc66511: Remove `typography.fontSize.lg` and `typography.fontSize.xl` from the public theme configuration. The default h3 and h4 sizes remain 1.25rem and 1.125rem; customize them through `heading.h3.fontSize` and `heading.h4.fontSize`.

### Patch Changes

- cc66511: Render footnote bodies by default and keep references, backlinks, and labels aligned with sanitized IDs. React instances use hydration-safe footnote namespaces; headless consumers can set `build.idPrefix`. Correct the spelling of multiword ARIA attributes.
- Updated dependencies [cc66511]
- Updated dependencies [cc66511]
- Updated dependencies [cc66511]
- Updated dependencies [cc66511]
- Updated dependencies [cc66511]
- Updated dependencies [cc66511]
  - @fluxdown/core@0.7.0
  - @fluxdown/core-presets@0.6.1
  - @fluxdown/react-presets@0.6.1
  - stative@1.1.0
  - @fluxdown/types@0.6.1

## 0.6.0

### Minor Changes

- 1242fc4: Initial release with extensible Markdown rendering for streaming content, framework-independent processing, and React integrations with Shad tail shading and smooth rendering.

### Patch Changes

- Updated dependencies [1242fc4]
- Updated dependencies [1242fc4]
  - @fluxdown/core@0.6.0
  - @fluxdown/core-presets@0.6.0
  - @fluxdown/react-presets@0.6.0
  - @fluxdown/types@0.6.0
  - @fluxdown/utils@0.6.0
  - stative@1.0.2
