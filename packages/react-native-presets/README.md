# @fluxdown/react-native-presets

React Native component slots and themes for Fluxdown.

For a ready-to-use component, start with [`@fluxdown/react-native`](../react-native). Use this package when customizing native slots or themes.

## Entry points

```ts
import { BaseSlotPlugin } from "@fluxdown/react-base-presets/base";
import type { ParagraphProps } from "@fluxdown/react-native-presets/base";
import { PRESET_SLOT_PLUGINS } from "@fluxdown/react-native-presets/slot";
```

`/base` exports native slot prop types, themes, public URL handling, and native property conversion. `/slot` exports native components and `PRESET_SLOT_PLUGINS`.

Shared render plugins, reactive hooks, and slot composition live in [`@fluxdown/react-base-presets`](../react-base-presets). Import shared render plugins from `@fluxdown/react-base-presets/render`. This package has no root or `/render` entry.

Inline slots must return content that can render inside native `Text`; block slots can use `View`. Shared render plugins pass mapped native props to slots through `getProps()`. Custom slots can override those props before passing them to `Raw`.

## Documentation

- [Native styling](../../website/docs/en/guide/react-native/customization.md)
- [Using and writing plugins](../../website/docs/en/guide/react-native/plugins.md)

## Contributing and license

See [CONTRIBUTING.md](../../CONTRIBUTING.md). Licensed under [MIT](../../LICENSE).
