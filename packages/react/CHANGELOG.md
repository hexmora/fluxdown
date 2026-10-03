# fluxdown

## 0.7.0

### Minor Changes

- cf360ee: Preserve HTML containers across Markdown block boundaries and align chunking with native GFM table rows, including rows without pipes. Configure indented code and Setext headings through build options shared by the chunker and the default syntax policy. Explicit plugin settings override the policy without changing chunking.
- e1b4e58: Group smooth rendering, Shad fading, and ending syntax repairs under the `streaming` prop. Streaming defaults to false; `true` or an options object enables all three features unless overridden. Move `build.repairEnding` to `streaming.repairEnding` and enable repairs by default when ending repair is requested, while preserving explicit `build.repair` overrides.

  Rename `FluxdownConfig` to `BaseBuildConfig`.

- 4cf1c63: Remove `typography.fontSize.lg` and `typography.fontSize.xl` from the public theme configuration. The default h3 and h4 sizes remain 1.25rem and 1.125rem; customize them through `heading.h3.fontSize` and `heading.h4.fontSize`.

### Patch Changes

- 58628a2: Render footnote bodies by default and keep references, backlinks, and labels aligned with sanitized IDs. React instances use hydration-safe footnote namespaces; headless consumers can set `build.idPrefix`. Correct the spelling of multiword ARIA attributes.
- Updated dependencies [cf360ee]
- Updated dependencies [58628a2]
- Updated dependencies [6a935bf]
- Updated dependencies [a1b1b84]
- Updated dependencies [f09f2f9]
- Updated dependencies [5d8e870]
  - @fluxdown/core@0.7.0
  - @fluxdown/core-presets@0.6.1
  - @fluxdown/react-presets@0.6.1
  - stative@2.0.0
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
