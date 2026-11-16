---
"@fluxdown/core-plugins": minor
"@fluxdown/core": patch
"@fluxdown/react-base": minor
"@fluxdown/react-lynx": minor
"@fluxdown/vue-base": minor
"@fluxdown/vue": minor
"@fluxdown/vue-lynx": minor
"@fluxdown/solid": minor
"@fluxdown/taro": minor
"@fluxdown/svelte": minor
"@fluxdown/angular": minor
"@fluxdown/uni-app": minor
"fluxdown": minor
---

Rename the smooth `ticker` option to `driver` and `scheduler` to `interpolation`, with matching class and type names: `RafSmoothDriver`, `IntervalSmoothDriver`, `BaseSmoothDriver`, `SpringSmoothInterpolator`, `BaseSmoothInterpolator`, `IDriver`, `IInterpolator`, `DriverType`, `InterpolationType`, `SmoothDriverClass`, and `SmoothInterpolatorClass`. The React, Vue, Svelte, Solid, Taro, Angular, Uni App, React Lynx and Vue Lynx options are now optional and default to `'raf'` (or `'interval'`) and `'spring'`. The previous option, class, and type names remain as deprecated aliases for one release.
