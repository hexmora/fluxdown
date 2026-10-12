# fluxdown

## 0.8.1

### Patch Changes

- Updated dependencies [6e5d714]
  - @fluxdown/core@0.11.0
  - @fluxdown/react-presets@0.6.7

## 0.8.0

### Minor Changes

- 0724e81: Add theme tokens for inline code, dividers, footnotes, and font smoothing while preserving the existing preset styles and shared-token defaults. Allow CSS values in shared font-weight tokens.
- 5bfdbd3: Allow plugin tuples to set `disabled: true` to opt out of individual presets or custom plugins. Disabled plugins and mappers are not constructed, and their existing state is cleaned up when configuration changes.

### Patch Changes

- Updated dependencies [5bfdbd3]
  - @fluxdown/types@0.8.0
  - @fluxdown/core@0.10.0
  - @fluxdown/core-presets@0.7.1
  - @fluxdown/react-presets@0.6.6

## 0.7.5

### Patch Changes

- 334446a: Skip repeated root-list reconciliation when Fluxdown passes an equivalent style object. Actual style and class changes, and reactive child-list publications, continue to update the rendered content.
- Updated dependencies [177889c]
- Updated dependencies [632914d]
- Updated dependencies [7c651f1]
- Updated dependencies [6658a55]
- Updated dependencies [632914d]
- Updated dependencies [f566cc2]
  - @fluxdown/types@0.7.2
  - stative@2.0.0
  - @fluxdown/core@0.9.0
  - @fluxdown/core-presets@0.7.0
  - @fluxdown/react-presets@0.6.5

## 0.7.4

### Patch Changes

- 3222507: Keep ordinary Markdown repairs enabled when streaming ends and only disable ending repairs. Explicit `build.repair` settings still take precedence.
- Updated dependencies [d595ca8]
- Updated dependencies [1f8bb14]
- Updated dependencies [470fb5b]
- Updated dependencies [6bf8f8a]
- Updated dependencies [5b391b4]
- Updated dependencies [559a259]
- Updated dependencies [f72e624]
- Updated dependencies [a37ab59]
- Updated dependencies [8e65595]
- Updated dependencies [0161ebf]
- Updated dependencies [468a453]
- Updated dependencies [dad697b]
- Updated dependencies [f627b35]
- Updated dependencies [ad93451]
  - stative@1.2.0
  - @fluxdown/core@0.8.2
  - @fluxdown/core-presets@0.6.5

## 0.7.3

### Patch Changes

- aa2a08f: Allow compatible internal dependency updates through caret version ranges instead
  of exact version pins. Future updates within those ranges can be installed without
  releasing unchanged dependent packages. Existing consumer lockfiles must still be
  updated to resolve newer dependency versions.
- Updated dependencies [aa2a08f]
  - @fluxdown/core@0.8.1
  - @fluxdown/core-presets@0.6.4
  - @fluxdown/react-presets@0.6.4
  - @fluxdown/types@0.7.1

## 0.7.2

### Patch Changes

- Updated dependencies [a4457b5]
- Updated dependencies [cb73ca0]
- Updated dependencies [30d41c4]
- Updated dependencies [7557794]
- Updated dependencies [8eb9b3f]
  - stative@1.1.1
  - @fluxdown/core-presets@0.6.3
  - @fluxdown/core@0.8.0
  - @fluxdown/types@0.7.0
  - @fluxdown/react-presets@0.6.3

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
