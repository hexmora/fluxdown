---
"@fluxdown/core-presets": minor
"@fluxdown/core": patch
"@fluxdown/react-presets": patch
"fluxdown": patch
---

Move core preset imports to `@fluxdown/core-presets/presets/<type>` and individual plugin imports to `@fluxdown/core-presets/plugins/<type>/<name>`. The previous `/mapper`, `/remark`, `/rehype`, and `/repair` aggregate entry points are removed; import each plugin and its related types from its own subpath.
