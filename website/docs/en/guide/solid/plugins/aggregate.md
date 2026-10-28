# Aggregate plugins

An aggregate plugin uses `IPluginItem` to group the slot, render and Core plugins needed for one feature. Pass a single object to enable the whole feature.

## Declare and use a plugin

Every list is optional. For example, combine the blockquote renderer and slot:

```ts
import type { IPluginItem } from '@fluxdown/solid-plugins/typings';

import {
  BlockquoteRenderPlugin,
  BlockquoteSlotPlugin,
} from '@fluxdown/solid-plugins/plugins/blockquote';

export const QuotePlugin: IPluginItem = {
  renders: [BlockquoteRenderPlugin],
  slots: [BlockquoteSlotPlugin],
};
```

> Import `IPluginItem` from `@fluxdown/solid-plugins/typings`. Built-in render and slot plugins are exported by their corresponding plugin subpaths.

Then pass it to the component:

```tsx
import { Fluxdown } from '@fluxdown/solid';

import { QuotePlugin } from './plugins/quote';

type MessageProps = {
  text: string;
};

export function Message(props: MessageProps) {
  return <Fluxdown text={props.text} plugins={QuotePlugin} />;
}
```

You can also include `remarks`, `rehypes`, `repairs` and `mappers`. Extend `BaseSlotPlugin` or `BaseSolidRenderPlugin` for custom presentation; see [Slot plugins](./slot.md) and [Render plugins](./render.md).

## Extend and configure

`pluginExtends` accepts two or more aggregate plugins. Pass the base first, then the behavior to add or override. For example, derive a code plugin with its toolbar hidden:

```ts
import { pluginExtends } from '@fluxdown/solid-plugins/base';
import {
  CodeHeaderSlotPlugin,
  CodePlugin,
} from '@fluxdown/solid-plugins/plugins/code';

export const CompactCodePlugin = /*#__PURE__*/ pluginExtends(CodePlugin, {
  slots: [CodeHeaderSlotPlugin],
  config: {
    'slot-code-header': { disabled: true },
  },
});
```

> Import `pluginExtends` from `@fluxdown/solid-plugins/base`.

Pass `CompactCodePlugin` to `FluxdownLite` through `plugins`. `config` applies to the plugins listed in the same pack, matches their `key`, and overrides options from `[Plugin, options]`. Listing `CodeHeaderSlotPlugin` here disables the inherited toolbar while keeping the code container and source display.

Lower `priority` values run earlier. At the same priority, later render plugins match first, and later slot plugins wrap earlier components through `Raw`. `plugins={[FirstPlugin, SecondPlugin]}` follows the same order.
