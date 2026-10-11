---
"@fluxdown/core-presets": minor
---

Disabled Smooth and Shad mappers now return their source blocks without constructing animation graphs. Enabling starts from the settled content currently visible, including content updated in the same batch; subsequent additions animate. Disabling releases animation wrappers immediately, so wrapper identity can change across toggles. Explicitly retained forks keep independent lifetimes.

Derive visible block metadata on demand and avoid repeated linear membership searches while maintaining animation wrappers.

Disabled mappers expose the compiler's original HAST, including ignorable whitespace that a full-range projection previously removed.
