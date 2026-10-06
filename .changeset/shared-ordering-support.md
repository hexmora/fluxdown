---
"stative": patch
---

Retain shared ordering prerequisites when a dependency is removed by tracking their supporting paths. Reuse surviving paths and rebuild only when support is lost, including cyclic and dynamically changing graphs.
