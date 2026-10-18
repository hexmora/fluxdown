# @fluxdown/react-base

Platform-independent React integration for `@fluxdown/core`.

For a ready-to-use component, use [`fluxdown` for React DOM](../react) or [`@fluxdown/react-native`](../react-native). Those wrappers supply their platform slots, root container, and theme.

## Build a platform integration

`BaseFluxdown` owns Core lifecycle, plugin packs, incremental block reconciliation, patches, and streaming configuration. It renders a fragment and uses shared render plugins from `@fluxdown/react-base-presets/render`.

Supply platform slots through `plugins={[{ slots: [...] }]}`. A missing required slot raises an explicit error. Shared render plugins use `getProps()` to map HAST attributes, then pass them and Markdown data to slots. For another platform, extend `ReactRenderer`, override its protected `getProps` method, and pass that class through the static `Renderer` prop. Keep the class stable for the component lifetime; use a new React key to switch renderers. The default mapper returns an empty object.

## Documentation

- [React plugins](../../website/docs/en/guide/react/plugins.md)
- [React Native plugins](../../website/docs/en/guide/react-native/plugins.md)
- [Shared render plugins and slot contracts](../react-base-presets)

## Contributing and license

See [CONTRIBUTING.md](../../CONTRIBUTING.md). Licensed under [MIT](../../LICENSE).
