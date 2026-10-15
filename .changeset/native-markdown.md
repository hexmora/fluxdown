---
"@fluxdown/react-base": minor
"@fluxdown/react-base-presets": minor
"fluxdown": minor
"@fluxdown/react-presets": minor
"@fluxdown/react-native": minor
"@fluxdown/react-native-presets": minor
---

Share the React renderer through platform-independent base packages, with Web and React Native slot implementations, typed native styles, and package-local on-device Storybook.

Import render plugins from `@fluxdown/react-base-presets/render` instead of `@fluxdown/react-presets/render`. Shared hooks and slot infrastructure now live in `@fluxdown/react-base-presets/base`; platform slots remain in their respective presets packages.

Render plugins now pass HAST nodes to slots without a `getProps` callback. Platform slots map element attributes themselves. Custom render plugins targeting host elements can call `getReactProps(node)` from `@fluxdown/react-presets/base` or `getReactNativeProps(node)` from `@fluxdown/react-native-presets/base`. Custom slots that replace their `Raw` implementation can derive platform attributes from `current` with the same helpers.

Align native theme tokens and layout with Web, share lazy Shiki highlighting and MathJax SVG conversion, and render native equations with `react-native-svg`. React Native consumers should install `react-native-svg` alongside the component.
