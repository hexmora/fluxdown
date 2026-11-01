# Slot plugins

Slot plugins control presentation and interaction. Keep the built-in Markdown parsing and render plugins, then replace the corresponding `.uvue` component to customize blockquotes, links, or code headers.

## Write the component

For example, use the theme's accent color for blockquotes:

```vue title="plugins/quote/components/quote/main.uvue"
<script setup lang="ts">
import { useTheme } from '@fluxdown/uni-app-plugins/base';

const theme = useTheme();

defineOptions({ inheritAttrs: false });
</script>

<template>
  <view
    :style="{
      borderLeftWidth: '3px',
      borderLeftStyle: 'solid',
      borderLeftColor: theme.tokens.colors.accent,
      paddingLeft: '16px',
      marginBottom: '16px',
    }"
  >
    <slot />
  </view>
</template>
```

```ts title="plugins/quote/components/quote/index.ts"
export { default as Quote } from './main.uvue';
```

> Import `useTheme` from `@fluxdown/uni-app-plugins/base`. It returns a reactive theme reference, which the template unwraps automatically.

## Declare the plugin

Extend `BaseSlotPlugin` and declare the slot name and component:

```ts title="plugins/quote/index.ts"
import type { IPluginItem } from '@fluxdown/uni-app-plugins/typings';

import { BaseSlotPlugin } from '@fluxdown/uni-app-plugins/base';

import { Quote } from './components/quote';

class QuoteSlotPlugin extends BaseSlotPlugin<'Blockquote'> {
  static readonly key = 'slot-custom-quote';

  readonly type = 'Blockquote';

  readonly Component = Quote;
}

export const QuotePlugin: IPluginItem = {
  slots: [QuoteSlotPlugin],
};
```

> Import `BaseSlotPlugin` from `@fluxdown/uni-app-plugins/base` and `IPluginItem` from `@fluxdown/uni-app-plugins/typings`.

`type` identifies a built-in slot. `Component` receives the render plugin's props, while its default slot carries child content. The Markdown source stays the same.

## Use the plugin

```vue
<script setup lang="ts">
import { Fluxdown } from '@fluxdown/uni-app';

import { QuotePlugin } from './plugins/quote';
</script>

<template>
  <Fluxdown :plugins="QuotePlugin" text="> A note worth keeping." />
</template>
```

The last enabled component for a slot type is used. Include `<slot />` in your component to preserve its child content.

Other common slots include `Heading`, `Paragraph`, `Link`, `Image`, `CodeBlock`, `CodeHeader`, `CodeHighlighter`, `Table`, and `Tex`. See the [plugin matrix](./matrix.mdx) for built-in plugins. To change which nodes use these slots, see [Render plugins](./render.md).

## Handle links

Built-in links open relative application routes. The application decides how to handle external URLs. Configure `onPress` on `LinkSlotPlugin` to use your own browser page or another action:

```ts
import type { IPluginItem } from '@fluxdown/uni-app-plugins/typings';

import { LinkSlotPlugin } from '@fluxdown/uni-app-plugins/plugins/link';

export const LinksPlugin: IPluginItem = {
  slots: [
    [
      LinkSlotPlugin,
      {
        onPress(href) {
          uni.navigateTo({
            url: `/pages/browser/index?url=${encodeURIComponent(href)}`,
          });
        },
      },
    ],
  ],
};
```

> Import `LinkSlotPlugin` from `@fluxdown/uni-app-plugins/plugins/link`. `/pages/browser/index` is a page implemented and registered by your application. When `onPress` is set, it handles every link click.
