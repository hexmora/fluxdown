# Composite plugins

An composite plugin uses `IPluginItem` to group the slot, render, and Core plugins needed for one feature. Pass one object to enable the whole feature.

## Declare and use a plugin

Every list is optional. For example, combine blockquote rendering with its component:

```tsx
import type { IPluginItem } from '@fluxdown/react-base-plugins/typings';

import { BlockquoteRenderPlugin } from '@fluxdown/react-base-plugins/plugins/blockquote';
import { BlockquoteSlotPlugin } from '@fluxdown/react-plugins/plugins/blockquote';
import { Fluxdown } from 'fluxdown';

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

> Import `IPluginItem` from `@fluxdown/react-base-plugins/typings`.

You can also add `remarks`, `rehypes`, `repairs`, and `mappers`. Extend `BaseSlotPlugin` or `BaseReactRenderPlugin` when writing React plugins; see [Slot plugins](./slot.md) and [Render plugins](./render.md).

## Derive and configure a plugin

`pluginExtends` accepts two or more composite plugins and returns an `IPluginItem`. Pass the base plugin first, then add overrides. For example, derive a plugin that hides the code toolbar:

```tsx
import { pluginExtends } from '@fluxdown/react-plugins/base';
import {
  CodeHeaderSlotPlugin,
  CodePlugin,
} from '@fluxdown/react-plugins/plugins/code';
import { FluxdownLite } from 'fluxdown/lite';

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

> Import `pluginExtends` from `@fluxdown/react-plugins/base`.

`config` applies only to plugins listed in the same object, matched by their `key`. It overrides matching options in `[Plugin, options]` list entries. This example explicitly lists `CodeHeaderSlotPlugin` to disable the inherited toolbar while keeping the code container and source display.

At the same `priority`, later render plugins match first. Later slot plugins sit outside earlier components in the `Raw` chain and can wrap or replace them. Different priorities still run from lowest to highest. Passing `plugins={[FirstPlugin, SecondPlugin]}` directly uses the same order.
