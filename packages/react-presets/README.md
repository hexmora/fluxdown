# @fluxdown/react-presets

React DOM plugin packs and styles for Fluxdown.

[Documentation](../../website/docs/en/guide/react/plugins.md) · [简体中文](./docs/README.zh-CN.md)

For a ready-to-use component, start with [`fluxdown`](../react). Use this package to choose individual plugins, replace DOM slots, or customize the theme.

## Entry points

```ts
import { BaseSlotPlugin } from "@fluxdown/react-base-presets/base";
import type { ParagraphProps } from "@fluxdown/react-presets/base";
import { PRESET_LIGHT_PLUGINS } from "@fluxdown/react-presets/lite";
import { PRESET_FULL_PLUGINS } from "@fluxdown/react-presets/full";
import { CodeShikiPlugin } from "@fluxdown/react-presets/plugins/code-shiki";
```

`/base` exports DOM slot props, property conversion and shared plugin contracts. `/plugins/<name>` exports each aggregate plugin with its render and slot implementations. `/lite` excludes highlighting and formula engines; `/full` adds Shiki and KaTeX / MathJax. The package also exports `/styles.css`.

Shared render contracts and platform-independent plugin implementations live in [`@fluxdown/react-base-presets`](../react-base-presets). Its render plugins pass mapped DOM props to slots through `getProps()`. Native components use the equivalent packs from [`@fluxdown/react-native-presets`](../react-native-presets).

See [Reduce bundle size](../../website/docs/en/guide/react/bundle-size.mdx) for the complete plugin list and lightweight alternatives.

## Contributing and license

See [CONTRIBUTING.md](../../CONTRIBUTING.md). Licensed under [MIT](../../LICENSE).
