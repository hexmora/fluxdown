# Slot 插件

Slot 插件决定内容的具体外观与交互。保留内置 Markdown 解析与 render，只替换对应的 `.uvue` 组件，适合调整引用块、链接或代码工具栏。

## 编写组件

例如，给引用块使用主题强调色：

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

> `useTheme` 从 `@fluxdown/uni-app-plugins/base` 导入，返回当前主题的响应式引用。模板会自动解包。

## 声明插件

继承 `BaseSlotPlugin`，声明插槽名称与组件：

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

> `BaseSlotPlugin` 从 `@fluxdown/uni-app-plugins/base` 导入；`IPluginItem` 从 `@fluxdown/uni-app-plugins/typings` 导入。

`type` 对应内置的插槽名称。`Component` 接收 render 传入的 props，默认插槽承载子内容；不需要改动原始 Markdown。

## 添加到组件

```vue
<script setup lang="ts">
import { Fluxdown } from '@fluxdown/uni-app';

import { QuotePlugin } from './plugins/quote';
</script>

<template>
  <Fluxdown :plugins="QuotePlugin" text="> A note worth keeping." />
</template>
```

同类型的插槽使用列表中最后一个启用的组件。需要保留子内容时，在自己的组件中放置 `<slot />`。

其他常用插槽包括 `Heading`、`Paragraph`、`Link`、`Image`、`CodeBlock`、`CodeHeader`、`CodeHighlighter`、`Table` 与 `Tex`。完整内置插件见[插件矩阵](./matrix.mdx)。要改变哪些节点使用这些插槽，继续阅读 [Render 插件](./render.md)。

## 处理链接

内置链接会打开应用内的相对路径。外部链接由应用决定如何处理，通过 `LinkSlotPlugin` 的 `onPress` 配置接入自己的浏览器页面或其他操作：

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

> `LinkSlotPlugin` 从 `@fluxdown/uni-app-plugins/plugins/link` 导入。示例中的 `/pages/browser/index` 是应用自己实现并注册的页面；设置 `onPress` 后，所有链接点击都会交给该函数。
