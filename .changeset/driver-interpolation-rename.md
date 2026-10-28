---
"@fluxdown/core-plugins": minor
"@fluxdown/core": patch
"@fluxdown/react-base": minor
"@fluxdown/lynx": minor
"@fluxdown/vue": minor
"fluxdown": minor
---

Rename the smooth `ticker` option to `driver` and `scheduler` to `interpolation`, with matching class and type names: `RafSmoothDriver`, `IntervalSmoothDriver`, `BaseSmoothDriver`, `SpringSmoothInterpolator`, `BaseSmoothInterpolator`, `IDriver`, `IInterpolator`, `DriverType`, `InterpolationType`, `SmoothDriverClass`, and `SmoothInterpolatorClass`. The React, Vue and Lynx options are now optional and default to `'raf'` (or `'interval'`) and `'spring'`. The previous option, class, and type names remain as deprecated aliases for one release.
