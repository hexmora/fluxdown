# @fluxdown/react-base

Platform-independent React integration for `@fluxdown/core`.

For a ready-to-use component, use [`fluxdown` for React DOM](../react) or [`@fluxdown/react-native`](../react-native). Those wrappers supply their platform slots, root container, and theme.

## Build a platform integration

`BaseFluxdown` owns Core lifecycle, plugin packs, incremental block reconciliation, patches, and streaming configuration. It renders a fragment and installs only the render plugins supplied by its caller. React and React Native use this same runtime for raw, lite, and full packs.

Supply shared render plugins and platform slots through `plugins={[{ renders: [...], slots: [...] }]}`. A missing required slot raises an explicit error. Shared render plugins use `getProps()` to map HAST attributes, then pass them and Markdown data to slots. For another platform, extend `ReactRenderer`, override its protected `getProps` method, and pass that class through the static `Renderer` prop. Keep the class stable for the component lifetime; use a new React key to switch renderers. The default mapper returns an empty object.

Streaming uses the same `streaming.effect` API as the platform components: `scale`, `shad`, `chunk`, `suffix`, effect tuples, ordered effect lists, or custom mapper classes. The base resolves effect mappers; platform packs supply their render implementations. `useMergePlugins` applies ordered preset/user overrides consistently, including disable and re-enable behavior.

## Documentation

- [React plugins](../../website/docs/en/guide/react/plugins.md)
- [React Native plugins](../../website/docs/en/guide/react-native/plugins.md)
- [Shared render plugins and slot contracts](../react-base-presets)

## Contributing and license

See [CONTRIBUTING.md](../../CONTRIBUTING.md). Licensed under [MIT](../../LICENSE).
