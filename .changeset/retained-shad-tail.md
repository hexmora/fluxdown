---
"stative": patch
"@fluxdown/core-presets": patch
---

Reuse the current raw state subscription in switchMap, removing ShadProgress's local tail cache while preserving child ownership and lifecycle handling.
