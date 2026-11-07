# Aggregate plugins - Fluxdown Vue Lynx {#aggregate-plugins}

An aggregate plugin uses `IPluginItem` to group the slot, render and Core plugins needed for one feature. Pass a single object to enable the whole feature.

## Declare and use a plugin

Every list is optional. For example, combine the blockquote renderer and slot:

```ts
import type { IPluginItem } from '@fluxdown/vue-base-plugins/typings';

import { BlockquoteRenderPlugin } from '@fluxdown/vue-base-plugins/plugins/blockquote';
import { BlockquoteSlotPlugin } from '@fluxdown/vue-lynx-plugins/plugins/blockquote';

export const QuotePlugin: IPluginItem = {
  renders: [BlockquoteRenderPlugin],
  slots: [BlockquoteSlotPlugin],
};
```

> Import `IPluginItem` from `@fluxdown/vue-base-plugins/typings`. Import built-in render and slot plugins from the corresponding plugin subpath.

Then pass it to the component:

```vue
<script setup lang="ts">
import { Fluxdown } from '@fluxdown/vue-lynx';

import { QuotePlugin } from './plugins/quote';

type MessageProps = {
  text: string;
};

const props = defineProps<MessageProps>();
</script>

<template>
  <Fluxdown :text="props.text" :plugins="QuotePlugin" />
</template>
```

You can also include `remarks`, `rehypes`, `repairs` and `mappers`. Extend `BaseSlotPlugin` or `BaseVueRenderPlugin` for custom presentation; see [Slot plugins](./slot.md) and [Render plugins](./render.md).

## Extend and configure

`pluginExtends` accepts two or more aggregate plugins. Pass the base first, then add the behavior to override. For example, derive a code plugin with its toolbar hidden:

```ts
import { pluginExtends } from '@fluxdown/vue-base-plugins/base';
import {
  CodeHeaderSlotPlugin,
  CodePlugin,
} from '@fluxdown/vue-lynx-plugins/plugins/code';

export const CompactCodePlugin = /*#__PURE__*/ pluginExtends(CodePlugin, {
  slots: [CodeHeaderSlotPlugin],
  config: {
    'slot-code-header': { disabled: true },
  },
});
```

> Import `pluginExtends` from `@fluxdown/vue-base-plugins/base`.

Pass `CompactCodePlugin` to `FluxdownLite` through `plugins`. `config` applies only to plugins listed in the same object, matches their `key`, and overrides matching options from `[Plugin, options]`. This example explicitly lists `CodeHeaderSlotPlugin` to disable the inherited toolbar while keeping the code container and source display.

A lower `priority` runs earlier. At the same priority, later render plugins match first, and later slot plugins sit outside the `Raw` chain to wrap or replace earlier components. `:plugins="[FirstPlugin, SecondPlugin]"` follows the same order.
