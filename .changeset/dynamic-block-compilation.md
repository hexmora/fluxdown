---
"@fluxdown/core": minor
---

Share plugin instances within each Core document through an optional `PluginCacheStore` on `PluginBuilder`. Plugins with the same class and recursively comparable configuration reuse one instance until their final consumer releases it. Retained block forks keep their plugin dependencies alive.

Reuse configuration values when their references match, and compare distinct plain objects and arrays recursively by structure. Objects may provide `isPluginConfigEqual` to compare distinct instances explicitly. Configuration getters are never invoked during comparison.

For low-level core integrations, `PluginBuilderInputs.plugins` now describes a resolved pluggable array instead of an `IReadableClosure`; reactive sources can still be supplied through stative JSX/descriptors. The former `PluginEntry` helper type is no longer exported.
