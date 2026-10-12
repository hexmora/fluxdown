---
"@fluxdown/mdast": patch
---

Reduce AST traversal bookkeeping and repeated allocations while preserving live mutation, traversal order, and tail traversal behavior.
