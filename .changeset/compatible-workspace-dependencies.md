---
"@fluxdown/core": patch
"@fluxdown/core-presets": patch
"@fluxdown/mdast": patch
"@fluxdown/react-presets": patch
"@fluxdown/types": patch
"fluxdown": patch
---

Allow compatible internal dependency updates through caret version ranges instead
of exact version pins. Future updates within those ranges can be installed without
releasing unchanged dependent packages. Existing consumer lockfiles must still be
updated to resolve newer dependency versions.
