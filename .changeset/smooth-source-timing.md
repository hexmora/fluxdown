---
"@fluxdown/core-plugins": patch
---

Integrate spring smoothing at source arrival times and decay buffer-wall momentum by elapsed time, preventing animation-frame phase differences from producing long output delays. Discard accumulated progress when starting or resetting a stream while retaining it on resume.
