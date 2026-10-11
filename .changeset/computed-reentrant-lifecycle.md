---
"stative": patch
---

Preserve selected subscriptions and frozen snapshots when input setup synchronously observes or destroys the selected state. Reentrant activation now reuses the existing active state, and destruction closes every owned subscription.
