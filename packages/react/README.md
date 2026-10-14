# fluxdown

`fluxdown` is the React DOM wrapper around `@fluxdown/react-base`.

It provides the React layer for high-performance rendering of streaming Markdown text, while delegating Markdown stream computation to the headless core package. This keeps rendering concerns isolated and makes it easier to build responsive UI experiences for LLM output.

`@fluxdown/react-base` owns Core lifecycle, plugin configuration, and incremental React reconciliation. `@fluxdown/react-base-presets` owns platform-independent render plugins and slot composition. This package adds the DOM root, theme, styles, and the default DOM slots from `@fluxdown/react-presets`; React Native uses the same shared foundation with native slots.

Use `Fluxdown` for a ready-to-use DOM component. For another React rendering platform, use `BaseFluxdown` from `@fluxdown/react-base` and provide slots through `plugins={[{ slots: [...] }]}` for the Markdown elements you render. Missing required slots raise an explicit error.

Custom render plugins use the shared contracts from `@fluxdown/react-base-presets/base`. Platform attributes are mapped in the DOM slots. When rendering host elements directly, import `getReactProps` from `@fluxdown/react-presets/base` and pass the HAST node explicitly instead of using the former render-parameter `getProps` callback. Custom slots that replace `Raw` can use `getReactProps(current)` to retain HAST attributes.
