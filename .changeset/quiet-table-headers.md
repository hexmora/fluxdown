---
"@fluxdown/core-plugins": patch
"@fluxdown/core": patch
"@fluxdown/types": patch
---

Hold ambiguous streaming table headers and incomplete delimiter rows until their syntax resolves, preserving literal pipes and restoring non-table prose. Capture original Markdown fragments in parsed nodes' data.source, clear stale source after repair mutations, and disable table repair when the table syntax plugin is disabled.
