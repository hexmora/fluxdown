---
"stative": patch
---

Track shared descriptor lifetime with owner counts instead of reverse owner sets, preserving cleanup order and reentrant detach behavior.
