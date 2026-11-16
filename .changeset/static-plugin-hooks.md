---
"@fluxdown/angular": patch
"@fluxdown/angular-plugins": patch
"@fluxdown/core": minor
"@fluxdown/core-plugins": minor
"@fluxdown/react-base-plugins": patch
"@fluxdown/react-lynx-plugins": patch
"@fluxdown/react-native-plugins": patch
"@fluxdown/react-plugins": patch
"@fluxdown/solid": patch
"@fluxdown/solid-plugins": patch
"@fluxdown/svelte": patch
"@fluxdown/svelte-plugins": patch
"@fluxdown/taro": patch
"@fluxdown/taro-plugins": patch
"@fluxdown/types": minor
"@fluxdown/uni-app": patch
"@fluxdown/uni-app-plugins": patch
"@fluxdown/vue": patch
"@fluxdown/vue-base-plugins": patch
"@fluxdown/vue-lynx": patch
"@fluxdown/vue-lynx-plugins": patch
"@fluxdown/vue-plugins": patch
---

Resolve plugin enablement and constructor configuration through optional static `enabled` and `prepareConfig` hooks across all plugin types. Keep context outside instances and refresh active pluggables when reactive inputs change.

Include `TexRepairPlugin` in the default core repair preset. Core plugins depend on KaTeX to select a valid streaming prefix when no custom `render` is supplied; renderer plugins use this preset without separate repair registration.

Keep repair output intact across all renderer adapters, including trailing TeX whitespace and empty pending formulas. Validate streaming TeX in the repair layer and preserve lazy loading in renderer components, with an empty loading placeholder instead of raw-source flashes. Default compiler presets now include KaTeX; MathJax-only syntax is deferred until the formula closes unless a custom validator is configured.
