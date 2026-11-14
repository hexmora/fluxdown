---
"@fluxdown/core-plugins": patch
"@fluxdown/core": patch
"@fluxdown/react-base-plugins": patch
"@fluxdown/react-plugins": patch
"fluxdown": patch
---

Preserve escaped and entity-encoded literals during streaming repairs using node-local source metadata, without position-based lookups. Improve pending lists, tasks, headings, nested emphasis and strikethrough, multi-backtick code, partial fences, links, images, and character references. Keep completed syntax and ambiguous prose intact, respect the active strikethrough configuration, and skip source-dependent checks when source metadata is unavailable. Separate shared syntax helpers from repair infrastructure.

Hold uncertain ordered-list digits only during ending repair. Stabilize incomplete HTML attributes, autolinks, reference definitions, and inline formatting in open table cells. Keep incomplete TeX in its math mode and render its longest engine-accepted prefix, caching checked endpoints across appended input and preserving repair metadata through HTML parsing. Restore literal input when ending repairs are disabled, and avoid invalid HTML nesting in table and display-math rendering.

Continue tail repairs after reference-node replacement, hold matching delayed-definition labels until their role is known, and support streamed links and images in open table cells. Keep unresolved explicit references in document scope so chunked rendering preserves them while later definitions and titles arrive. Preserve verified open-cell boundaries for one repair pass without retaining stale source, and resolve list structure before inline repairs consume its provenance. Cover these combinations with character-by-character streaming regressions through the repair pipeline and the React renderer.

Inject compiler and plugin context without coupling composition to concrete syntax plugins. Keep table preparation in its repair plugin, source invalidation in shared repair infrastructure, and syntax-specific helpers in their owning plugins. Scope engine-aware TeX prefix validation to the React TeX plugins while preserving their lazy loading. Disabling table repair also disables its cross-plugin boundary preparation.
