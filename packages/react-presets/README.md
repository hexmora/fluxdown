# @fluxdown/react-presets

React DOM slots for Fluxdown.

For a ready-to-use component, start with [`fluxdown`](../react). Use this package when customizing DOM slots.

## Entry points

```ts
import { BaseSlotPlugin } from "@fluxdown/react-base-presets/base";
import type { ParagraphProps } from "@fluxdown/react-presets/base";
import { PRESET_SLOT_PLUGINS } from "@fluxdown/react-presets/slot";
```

`/base` exports DOM slot prop types, public URL handling, HTML property conversion, and the CSS prefix. `/slot` exports platform components and `PRESET_SLOT_PLUGINS`. The package also exports `/styles.css`.

Shared render plugins, reactive hooks, and slot composition live in [`@fluxdown/react-base-presets`](../react-base-presets). Import shared render plugins from `@fluxdown/react-base-presets/render`. This package has no root or `/render` entry.

Shared render plugins pass mapped DOM props to slots through `getProps()`. Custom slots can override those props before passing them to `Raw`.

## Documentation

- [Styling guide](../../website/docs/en/guide/react/customization.md)
- [Using and writing plugins](../../website/docs/en/guide/react/plugins.md)

## Contributing and license

See [CONTRIBUTING.md](../../CONTRIBUTING.md). Licensed under [MIT](../../LICENSE).
