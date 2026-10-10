---
"@fluxdown/types": minor
"@fluxdown/core": minor
"fluxdown": minor
---

Allow plugin tuples to set `disabled: true` to opt out of individual presets or custom plugins. Disabled plugins and mappers are not constructed, and their existing state is cleaned up when configuration changes.
