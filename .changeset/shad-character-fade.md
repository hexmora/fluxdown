---
"@fluxdown/core-presets": minor
"@fluxdown/react-presets": minor
"@fluxdown/core": patch
"fluxdown": minor
---

Rework the `shad` trailing fade so each newly visible character plays its own opacity fade, independent of reveal progress, instead of a gradient mask that follows the cursor. A fade keeps running after the stream pauses. Each batch's duration adapts to how many characters are already fading: `duration × length ÷ characters in flight`, capped at `duration`, so roughly `length` characters fade at once. `shad` now accepts `length` (default `10`) and `duration` (default `400` ms); the `maskWidth` option and the `SHAD_HOST_VALUE` export are removed, and fade spans use `SHAD_FADE_VALUE`. The chunk effect now shares the same entrance tracking.
