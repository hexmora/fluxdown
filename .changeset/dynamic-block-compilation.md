---
"@fluxdown/core": minor
---

Share plugin instances within each Core document through an optional `PluginCacheStore` on `PluginBuilder`. Plugins with the same class and recursively comparable configuration reuse one instance until their final consumer releases it. Retained block forks keep their plugin dependencies alive.

Reuse configuration values when their references match, and compare distinct plain objects and arrays recursively by structure. Objects may provide `isPluginConfigEqual` to compare distinct instances explicitly. Configuration getters are never invoked during comparison.
