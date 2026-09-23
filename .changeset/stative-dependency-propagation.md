---
"stative": major
"@fluxdown/core-presets": patch
"@fluxdown/core": patch
---

Replace recursive priority scheduling with subscription dependency propagation while preserving synchronous batching, consistent derived updates, and subscription cleanup.

Remove `BatchScheduler`; import `batch` directly instead of calling `BatchScheduler.batch`. State graph utilities are now exported through the package barrel. Update Fluxdown presets and integration tests to use dependency ordering without manually assigned priorities.
