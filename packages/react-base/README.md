# @fluxdown/react-base

Platform-independent React integration for `@fluxdown/core`.

`BaseFluxdown` owns Core lifecycle, plugin packs, incremental block reconciliation, patches, and streaming configuration. It renders a fragment and uses shared render plugins from `@fluxdown/react-base-presets/render`.

Supply platform slots through `plugins={[{ slots: [...] }]}`. A missing required slot raises an explicit error. Shared render plugins pass Markdown data and the current HAST node to slots; each platform slot maps native or DOM attributes. Custom slots can read `current.properties`, and custom render plugins can pass additional typed props.

Use `fluxdown` for React DOM or `@fluxdown/react-native` for React Native. Those wrappers supply their platform slots, root container, and theme.
