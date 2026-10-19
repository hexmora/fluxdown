---
"fluxdown": minor
"@fluxdown/core": patch
"@fluxdown/core-presets": minor
"@fluxdown/react-presets": minor
---

Add the `scale` streaming effect and its `Scale` mapper and `ScaleRenderPlugin` presets. Enable it with `streaming: { effect: 'scale' }`, customize it with `['scale', { duration, from, blur }]`, or combine it with other effects.

Newly revealed characters grow and fade into place with a shrinking blur, preserving their animation progress across updates and remounts. Defaults are 200 milliseconds, an initial scale of 0, and a blur radius of 0.08 em. Existing content remains still, reduced-motion preferences disable the animation, and code, formulas, and replacement content keep their original rendering.

Collapse completed scale words back into ordinary text on subsequent updates to keep the active render tree small.
