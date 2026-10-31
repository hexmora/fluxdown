# Plugin packs

An `IPluginItem` groups the slot, render and Core plugins needed for a feature. Your application can enable them together by passing one object.

## Declare and use

Every list is optional. For example, combine blockquote rendering and its slot:

```ts title="plugins.ts"
import type { IPluginItem } from '@fluxdown/svelte-plugins/typings';

import {
  BlockquoteRenderPlugin,
  BlockquoteSlotPlugin,
} from '@fluxdown/svelte-plugins/plugins/blockquote';

export const QuotePlugin: IPluginItem = {
  renders: [BlockquoteRenderPlugin],
  slots: [BlockquoteSlotPlugin],
};
```

```svelte
<script lang="ts">
  import { Fluxdown } from '@fluxdown/svelte';

  import { QuotePlugin } from './plugins';
</script>

<Fluxdown plugins={QuotePlugin} text="> Keep a useful aside close to the text." />
```

> Import `IPluginItem` from `@fluxdown/svelte-plugins/typings`. Import built-in render and slot plugins from their feature subpath.

You can also include `remarks`, `rehypes`, `repairs` and `mappers`. Extend `BaseSlotPlugin` or `BaseSvelteRenderPlugin` to write your own presentation plugins; see [slot plugins](./slot.md) and [render plugins](./render.md).

## Extend and configure

`pluginExtends` accepts two or more packs. Pass the base first, followed by the capabilities you want to add or override. For example, hide the code toolbar:

```ts
import { pluginExtends } from '@fluxdown/svelte-plugins/base';
import {
  CodeHeaderSlotPlugin,
  CodePlugin,
} from '@fluxdown/svelte-plugins/plugins/code';

export const CompactCodePlugin = /*#__PURE__*/ pluginExtends(CodePlugin, {
  slots: [CodeHeaderSlotPlugin],
  config: {
    'slot-code-header': { disabled: true },
  },
});
```

> Import `pluginExtends` from `@fluxdown/svelte-plugins/base`.

`config` matches plugins by `key` and only configures those listed in the same object. It overrides matching options from `[Plugin, options]`. This example explicitly lists `CodeHeaderSlotPlugin` to disable the inherited toolbar while retaining the code container and source.

Lower `priority` values run earlier. At equal priority, later render plugins match first; later slots sit outside the `Raw` chain and can wrap or replace earlier components. Passing `plugins={[FirstPlugin, SecondPlugin]}` follows the same ordering.
