---
"@fluxdown/core-presets": minor
"@fluxdown/mdast": minor
---

Add an optional structural-tail traversal scope to `processMdast`. Built-in repair runners whose effects are confined to the final child path use it for pre-order, left-first traversal; custom runners and other traversal orders retain their existing scope.

Upgrade compatible micromark dependencies, including the GFM table edit-map performance fix.
