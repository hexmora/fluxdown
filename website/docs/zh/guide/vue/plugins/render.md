# Render 插件

Render 插件将 HAST 节点渲染成插槽，决定哪些内容交给哪个组件。插槽的样式与交互由 slot 插件负责。

## 声明与使用

下面把以“提示：”开头的段落交给引用块插槽，其余段落保持原样：

```ts
import type {
  VueRenderMatchParams,
  VueRenderParams,
} from '@fluxdown/vue-plugins/base';

import {
  BaseVueRenderPlugin,
  createTypeOfSlot,
  isElementWithTag,
} from '@fluxdown/vue-plugins/base';
import { h } from 'vue';

const Blockquote = /*#__PURE__*/ createTypeOfSlot('Blockquote');

export class NoteRenderPlugin extends BaseVueRenderPlugin {
  static readonly key = 'render-note';

  match({ node }: VueRenderMatchParams) {
    if (!isElementWithTag(node, 'p')) {
      return false;
    }

    const first = node.children[0];

    return first?.type === 'text' && first.value.startsWith('提示：');
  }

  render({ node, parents, render, renderChildren }: VueRenderParams) {
    if (!isElementWithTag(node, 'p')) {
      return null;
    }

    return h(
      Blockquote,
      { current: node, parents, render },
      { default: () => renderChildren(node) },
    );
  }
}
```

在单文件组件中使用：

```vue
<script setup lang="ts">
import { Fluxdown } from '@fluxdown/vue';

import { NoteRenderPlugin } from './plugins/note';

const plugins = { renders: [NoteRenderPlugin] };
</script>

<template>
  <Fluxdown text="提示：请保存修改。" :plugins="plugins" />
</template>
```

> 基类、参数类型和 `createTypeOfSlot` 从 `@fluxdown/vue-plugins/base` 导入。使用前安装 `@fluxdown/vue-plugins`。

`match` 选择节点，`renderChildren` 渲染其子节点。`current`、`parents` 和 `render` 保留插槽需要的上下文。这里使用 Vue 的 `h`；项目已配置 Vue JSX 时也可以返回 JSX。

## 匹配顺序

更小的 `priority` 更早匹配；相同优先级下，后面的 render 插件先匹配，因此自定义插件优先于预设。未匹配的节点继续由预设处理。

只想修改组件或交互时，使用 [Slot 插件](./slot.md) 更直接。要先修改 HAST 内容，使用 [Rehype 插件](../../core/plugins/rehype.mdx)。
