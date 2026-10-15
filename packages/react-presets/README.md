# @fluxdown/react-presets

React DOM slots for Fluxdown.

```ts
import { BaseSlotPlugin } from "@fluxdown/react-base-presets/base";
import type { ParagraphProps } from "@fluxdown/react-presets/base";
import { PRESET_SLOT_PLUGINS } from "@fluxdown/react-presets/slot";
```

`/base` exports DOM slot prop types, public URL handling, HTML property conversion, and the CSS prefix. `/slot` exports platform components and `PRESET_SLOT_PLUGINS`. The package also exports `/styles.css`.

Shared render plugins, reactive hooks, and slot composition live in `@fluxdown/react-base-presets`; import shared render plugins from `@fluxdown/react-base-presets/render`. There is no platform `/render` or root entry.
