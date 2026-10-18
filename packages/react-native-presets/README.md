# @fluxdown/react-native-presets

React Native plugin packs, component slots, and themes for Fluxdown.

For a ready-to-use component, start with [`@fluxdown/react-native`](../react-native). Native packs follow the same aggregate plugin model as [`@fluxdown/react-presets`](../react-presets).

## Entry points

```ts
import { BaseSlotPlugin } from "@fluxdown/react-base-presets/base";
import type { ParagraphProps } from "@fluxdown/react-native-presets/base";
import { PRESET_LIGHT_PLUGINS } from "@fluxdown/react-native-presets/lite";
import { PRESET_FULL_PLUGINS } from "@fluxdown/react-native-presets/full";
import { CodeShikiPlugin } from "@fluxdown/react-native-presets/plugins/code-shiki";
```

`/base` exports native slot props, themes, URL handling, and native property conversion. `/plugins/<name>` exports a pack combining shared render plugins with native slots. `/lite` includes source-only code and formulas plus all four streaming effects. `/full` adds Shiki highlighting and lazy MathJax SVG formulas. Formula syntax still requires `build={{ tex: true }}`.

Shared render contracts, hooks, and slot composition live in [`@fluxdown/react-base-presets`](../react-base-presets). Import individual platform-independent render modules from its `/plugins/<name>` entries. `getProps()` supplies native attributes to slots; custom slots may adjust them before calling `Raw`.

Inline slots must return content that fits inside native `Text`; block slots may use `View`. Web builds resolve `.web` effect renderers through React Native Web, while native builds keep native primitives and animations.

## Documentation

- [Native presets and bundle size](../../website/docs/en/guide/react-native/bundle-size.md)
- [Streaming effects and browser comparison](../../website/docs/en/guide/react-native/streaming.mdx)
- [Native styling](../../website/docs/en/guide/react-native/customization.md)
- [Using and writing plugins](../../website/docs/en/guide/react-native/plugins.md)

## Contributing and license

See [CONTRIBUTING.md](../../CONTRIBUTING.md). Licensed under [MIT](../../LICENSE).
