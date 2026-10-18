---
"@fluxdown/react-base": minor
"@fluxdown/react-base-presets": minor
"fluxdown": minor
"@fluxdown/react-presets": minor
"@fluxdown/react-native": minor
"@fluxdown/react-native-presets": minor
"@fluxdown/website": patch
---

Share the React renderer through platform-independent base packages, with Web and React Native slot implementations, typed native styles, and package-local on-device Storybook.

Import render plugins from `@fluxdown/react-base-presets/render` instead of `@fluxdown/react-presets/render`. Shared hooks and slot infrastructure now live in `@fluxdown/react-base-presets/base`; platform slots remain in their respective presets packages.

Render plugins retain their `getProps()` callback. Web and React Native inject platform attribute mapping through a static renderer dependency.

Align native theme tokens and layout with Web, share lazy Shiki highlighting and MathJax SVG conversion, and render native equations with `react-native-svg`. React Native consumers should install `react-native-svg` alongside the component.
