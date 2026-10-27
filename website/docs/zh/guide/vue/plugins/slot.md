# Slot 插件

Slot 插件负责渲染插槽。代码、链接、标题等内容已经准备好，你只需要决定它们的组件和交互。

## 声明与使用

下面隐藏代码工具栏，保留默认高亮与代码样式。先在独立模块中声明插件：

```ts
import type { CodeBlockProps } from '@fluxdown/vue-plugins/base';

import { BaseSlotPlugin } from '@fluxdown/vue-plugins/base';
import { h } from 'vue';

function CompactCodeBlock({ Raw, ...props }: CodeBlockProps) {
  return Raw ? h(Raw, { ...props, showHeader: false }) : null;
}

export class CompactCodeBlockPlugin extends BaseSlotPlugin<'CodeBlock'> {
  static readonly key = 'compact-code-block';

  readonly type = 'CodeBlock';

  readonly Component = CompactCodeBlock;
}
```

再传给组件：

```vue
<script setup lang="ts">
import { Fluxdown } from '@fluxdown/vue';

import { CompactCodeBlockPlugin } from './plugins/compact-code';

type MessageProps = {
  text: string;
};

const props = defineProps<MessageProps>();

const plugins = { slots: [CompactCodeBlockPlugin] };
</script>

<template>
  <Fluxdown :text="props.text" :plugins="plugins" />
</template>
```

> 插件基类和属性类型从 `@fluxdown/vue-plugins/base` 导入。使用前安装 `@fluxdown/vue-plugins`。

`key` 标识插件，`type` 选择插槽，`Component` 提供 Vue 组件。无状态组件可以直接写成函数；需要响应式状态或生命周期时，使用 `defineComponent` 并声明组件接收的 props。

## 保留默认功能

`Raw` 是前一个插件提供的组件。调用它可以保留已有的高亮或排版，修改属性就能调整其中一部分。

相同优先级下，同一插槽后面的插件通过 `Raw` 包裹前面的组件。完全替换时，直接返回自己的 VNode 即可。子内容可以通过 `children` 属性或 Vue 的默认插槽传递。

> `Raw` 可能为 `null`，调用前需要检查。

## 选择插槽

| 插槽                                       | 常见用途                         |
| ------------------------------------------ | -------------------------------- |
| `CodeBlock`                                | 调整代码容器、复制行为或工具栏。 |
| `CodeHeader`                               | 修改工具栏，加入分享等操作。     |
| `CodeHighlighter`                          | 接入自己的代码高亮。             |
| `Link`、`Image`                            | 定制导航与图片交互。             |
| `Heading`、`Paragraph`                     | 调整标题与段落组件。             |
| `Table`、`TableCell`、`List`、`Blockquote` | 定制内容布局。                   |
| `Tex`                                      | 接入公式呈现。                   |

每个插槽都有对应的属性类型，例如 `LinkProps`、`HeadingProps`。需要改变 HAST 节点对应的插槽时，使用 [Render 插件](./render.md)。
