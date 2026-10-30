---
"@fluxdown/core-plugins": minor
"@fluxdown/react-base-plugins": minor
"@fluxdown/react-plugins": minor
"@fluxdown/react-native-plugins": minor
"@fluxdown/lynx-plugins": minor
"@fluxdown/vue-plugins": minor
"@fluxdown/solid-plugins": minor
"@fluxdown/taro-plugins": minor
"@fluxdown/react-native": patch
"@fluxdown/core": patch
"fluxdown": minor
---

Rework the `shad` trailing fade so each newly visible character plays its own opacity fade, independent of reveal progress, instead of a gradient mask that follows the cursor. A fade keeps running after the stream pauses. Each batch's duration adapts to how many characters are already fading: `duration × length ÷ characters in flight`, capped at `duration`, so roughly `length` characters fade at once. `shad` now accepts `length` (default `10`) and `duration` (default `400` ms); the `maskWidth` option and the `SHAD_HOST_VALUE` export are removed, and fade spans use `SHAD_FADE_VALUE`. The chunk effect now shares the same entrance tracking, and fade spans carry stable render keys like chunk batches. On React Native, shad fades each character through its text color alpha, like chunk, instead of measuring and drawing a gradient mask. The Vue, Solid and Taro renderers play the same per-character CSS fade as React. On Lynx, shad fades each character through its text color on the main thread, like chunk, with linear easing.
