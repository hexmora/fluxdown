---
"@fluxdown/core-presets": minor
"@fluxdown/core": patch
"fluxdown": minor
---

Rename the smooth `ticker` option to `driver` and `scheduler` to `interpolation`, with matching class and type names: `RafSmoothDriver`, `IntervalSmoothDriver`, `BaseSmoothDriver`, `SpringSmoothInterpolator`, `BaseSmoothInterpolator`, `IDriver`, `IInterpolator`, `DriverType`, `InterpolationType`, `SmoothDriverClass`, and `SmoothInterpolatorClass`. Both React options are now optional and default to `'raf'` (or `'interval'`) and `'spring'`. The previous option, class, and type names remain as deprecated aliases for one release.
