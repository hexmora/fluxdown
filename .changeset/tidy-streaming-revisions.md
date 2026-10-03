---
"@fluxdown/core": patch
"@fluxdown/core-presets": patch
"@fluxdown/hast": minor
---

Preserve block boundaries for trailing list whitespace and reduce repeated work during streaming. Add an immutable HAST projection API to share grapheme indexes within a compiled revision, retain unchanged revision subscriptions, and limit cutoff and shading updates to active blocks while preserving dynamic animation behavior.
