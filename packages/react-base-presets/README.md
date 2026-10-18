# @fluxdown/react-base-presets

Shared React rendering infrastructure for Fluxdown, with no DOM or React Native dependency.

For a ready-to-use component, use [`fluxdown` for React DOM](../react) or [`@fluxdown/react-native`](../react-native). Use this package when writing shared render plugins or implementing another React rendering platform.

## Entry points

```ts
import { BaseReactRenderPlugin, BaseSlotPlugin } from "@fluxdown/react-base-presets/base";
import { ParagraphRenderPlugin } from "@fluxdown/react-base-presets/plugins/paragraph";
```

`/base` provides render and slot contracts, plugin composition, reactive hooks, and HAST utilities. `/plugins/<name>` provides individual render modules that translate HAST into named slots. `/highlight` provides the shared code-highlighting hook; `/math` provides lazy MathJax SVG conversion. Lightweight render modules do not import either engine.

Platform packages combine these render modules with their components in `@fluxdown/react-presets/plugins/<name>` and `@fluxdown/react-native-presets/plugins/<name>`. Their Full and Lite presets choose which aggregate packs to install.

A required slot without an implementation throws a descriptive error. `CodeHeader`, `Fallback`, and `Wrapper` are optional. Shared render plugins never create host elements; platform slots render nodes, table cells, and streaming effects.

Shared slot props contain Markdown data and React children. Platform packages add style and interaction props. `createTypeOfSlot<Type, Props>(type)` preserves an extended platform prop type when creating a custom typed slot.

## Documentation

- [React plugins](../../website/docs/en/guide/react/plugins.md)
- [React Native plugins](../../website/docs/en/guide/react-native/plugins.md)
- [Building a React platform integration](../react-base)

## Contributing and license

See [CONTRIBUTING.md](../../CONTRIBUTING.md). Licensed under [MIT](../../LICENSE).
