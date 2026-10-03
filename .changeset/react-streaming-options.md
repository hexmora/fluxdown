---
"fluxdown": minor
---

Group smooth rendering, Shad fading, and ending syntax repairs under the `streaming` prop. Streaming defaults to false; `true` or an options object enables all three features unless overridden. Move `build.repairEnding` to `streaming.repairEnding` and enable repairs by default when ending repair is requested, while preserving explicit `build.repair` overrides.

Rename `FluxdownConfig` to `BaseBuildConfig`.
