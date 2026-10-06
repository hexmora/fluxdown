---
"@fluxdown/core": minor
---

Reduce per-block state by sharing compiler inputs, deriving metadata on demand, and using read-only lifetime views for block content.

Blocks without a range or mapper forward their source publications directly, including intentional same-reference notifications. Unobserved metadata is a pure projection evaluated on demand; destruction freezes published input values instead of preserving an extra relay's queue position.
