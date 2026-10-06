---
"stative": patch
---

Preserve computed subscriptions and frozen snapshots when input setup synchronously observes or destroys the computed state. Reentrant activation now reuses the existing active state, and destruction closes every owned subscription.
