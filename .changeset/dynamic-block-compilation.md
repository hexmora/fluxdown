---
"stative": minor
"@fluxdown/core": patch
---

Add `switchCombineMapState` for projecting fixed and dynamically selected inputs. It borrows inputs, disconnects replaced dependencies, and completes after the current inputs finish. Destruction during an input read or selection callback stops further connections.

Use an internal document compiler to own shared plugin pipelines and private block fallbacks. Retained block forks keep their compilation dependencies alive.
