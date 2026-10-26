---
"@fluxdown/lynx": minor
"@fluxdown/lynx-plugins": minor
"@fluxdown/core": patch
"@fluxdown/core-plugins": patch
"@fluxdown/utils": patch
---

Add a ReactLynx renderer with full, lite and raw components, native element plugins, themes and streaming effects. Preserve JSX for the host application's ReactLynx compiler and provide Storybook examples and renderer tests.

Use a host-compatible clock for streaming mappers when the browser Performance API is unavailable.

Bundle the headless Markdown parser dependencies with their DOM-free entity decoder so Lynx consumers do not require application-level resolution aliases.
