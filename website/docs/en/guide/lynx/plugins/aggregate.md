# Composite plugins

A composite plugin uses `IPluginItem` to group the slots, render plugins and Core plugins needed for a feature. Pass one object to enable them together.

## Declare and use

Every list is optional. For example, combine blockquote rendering with its slot:

```tsx
import type { IPluginItem } from '@fluxdown/lynx-plugins/typings';

import { Fluxdown } from '@fluxdown/lynx';
import {
  BlockquoteRenderPlugin,
  BlockquoteSlotPlugin,
} from '@fluxdown/lynx-plugins/plugins/blockquote';

export const QuotePlugin: IPluginItem = {
  renders: [BlockquoteRenderPlugin],
  slots: [BlockquoteSlotPlugin],
};

type MessageProps = {
  text: string;
};

export function Message({ text }: MessageProps) {
  return <Fluxdown plugins={QuotePlugin} text={text} />;
}
```

> Import `IPluginItem` from `@fluxdown/lynx-plugins/typings`. Built-in render and slot classes come from their corresponding plugin subpaths.

You can also include `remarks`, `rehypes`, `repairs` and `mappers`. For custom UI plugins, extend `BaseSlotPlugin` or `BaseLynxRenderPlugin`; see [slot plugins](./slot.md) and [render plugins](./render.md).

## Extend and configure

`pluginExtends` takes two or more composite plugins. Pass the base first, followed by the behavior you want to override. This example hides the code toolbar:

```tsx
import { FluxdownLite } from '@fluxdown/lynx/lite';
import { pluginExtends } from '@fluxdown/lynx-plugins/base';
import {
  CodeHeaderSlotPlugin,
  CodePlugin,
} from '@fluxdown/lynx-plugins/plugins/code';

export const CompactCodePlugin = /*#__PURE__*/ pluginExtends(CodePlugin, {
  slots: [CodeHeaderSlotPlugin],
  config: {
    'slot-code-header': { disabled: true },
  },
});

type MessageProps = {
  text: string;
};

export function Message({ text }: MessageProps) {
  return <FluxdownLite plugins={CompactCodePlugin} text={text} />;
}
```

> Import `pluginExtends` from `@fluxdown/lynx-plugins/base`.

`config` matches plugins by `key` and applies only to those listed in the same object. It overrides matching options in `[Plugin, options]`. The example explicitly lists `CodeHeaderSlotPlugin` to disable the inherited toolbar while preserving the code container and source display.

Lower `priority` values run first. At equal priority, later render plugins match first; later slots sit outside earlier components in the `Raw` chain and can wrap or replace them. Passing `plugins={[FirstPlugin, SecondPlugin]}` follows the same order.
