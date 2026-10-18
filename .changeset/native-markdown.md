---
"@fluxdown/react-base": minor
"@fluxdown/react-base-presets": minor
"fluxdown": minor
"@fluxdown/react-presets": minor
"@fluxdown/react-native": minor
"@fluxdown/react-native-presets": minor
"@fluxdown/website": patch
---

Share the React renderer through platform-independent base packages and provide React Native raw/full/lite entries with the same modular plugin, scoped configuration, mapper, and slot composition contracts as React.

Add native shad, scale, chunk, and suffix effects, including reduced-motion handling and React Native Web renderers that follow the React animation timings and styling. Keep code-block suffixes and custom effect renderers in the common rendering pipeline.

Isolate optional Shiki highlighting and MathJax SVG math in the full/native engine plugins. Lite and raw do not bundle either engine, and react-native-svg is an optional peer needed by the MathJax plugin.

Add bilingual package documentation and website guides with a synchronized React / React Native Web comparison, retain on-device Storybook, and validate published native entry points and ESM/CJS pack isolation.
