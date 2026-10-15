# @fluxdown/react-base-presets

Shared React rendering infrastructure for Fluxdown, with no DOM or React Native dependency.

```ts
import { BaseReactRenderPlugin, BaseSlotPlugin } from "@fluxdown/react-base-presets/base";
import { PRESET_RENDER_PLUGINS } from "@fluxdown/react-base-presets/render";
```

`/base` provides render and slot contracts, plugin composition, reactive hooks, HAST utilities, and the shared lazy code-highlighting hook. `/math` provides lazy MathJax SVG conversion for platform math slots. `/render` translates HAST into named slots. Platform packages implement those slots: `@fluxdown/react-presets/slot` for React DOM and `@fluxdown/react-native-presets/slot` for React Native.

A required slot without an implementation throws a descriptive error. `CodeHeader`, `Fallback`, and `Wrapper` are optional. Node rendering, table cells, and streaming fade effects also use platform slots; shared render plugins never create host elements.

Shared slot props contain Markdown data and React children. Platform packages add their own style and interaction props. `createTypeOfSlot<Type, Props>(type)` can preserve an extended platform prop type when creating a custom typed slot.
