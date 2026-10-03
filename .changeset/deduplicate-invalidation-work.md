---
"stative": patch
---

Mark dependent states before adding them to the invalidation worklist, avoiding duplicate entries and allocations for already-dirty roots while preserving dependency ordering and error isolation.
