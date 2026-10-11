---
"@fluxdown/core-presets": minor
"@fluxdown/mdast": minor
---

Add an optional structural-tail traversal scope to `processMdast`. Built-in repair plugins declare `scope: 'tail'` in their config. The repair kernel uses the final child path for pre-order, left-first traversal and falls back to the whole tree for other traversal orders.

Plugin config takes precedence over repair call options. Subclasses that replace a built-in tail runner with a whole-tree repair should set `scope: 'tree'` in their config.

Upgrade compatible micromark dependencies, including the GFM table edit-map performance fix.
