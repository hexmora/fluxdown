# 使用与编写插件

插件按内容处理过程分工。调整组件和交互，从 slot 开始；需要改变节点对应的插槽，使用 render。解析、修复和流式映射由 Core 插件处理。

| 类型     | 作用                                | 编写指南                                  |
| -------- | ----------------------------------- | ----------------------------------------- |
| `slot`   | 渲染插槽，提供组件和交互。          | [Slot 插件](./plugins/slot.md)            |
| `render` | 将 HAST 节点渲染成插槽。            | [Render 插件](./plugins/render.md)        |
| `mapper` | 响应式映射 HAST，控制内容逐步呈现。 | [Mapper 插件](../core/plugins/mapper.mdx) |
| `remark` | 解析 Markdown 语法。                | [Remark 插件](../core/plugins/remark.mdx) |
| `rehype` | 对 HAST 做二次处理。                | [Rehype 插件](../core/plugins/rehype.mdx) |
| `repair` | 对 Markdown AST 做二次处理与修复。  | [Repair 插件](../core/plugins/repair.mdx) |

## 按需添加能力

先安装插件包：

```bash
pnpm add @fluxdown/vue-plugins
```

例如，为 Lite 添加 Shiki 代码高亮：

```vue
<script setup lang="ts">
import { FluxdownLite } from '@fluxdown/vue/lite';
import { CodeShikiPlugin } from '@fluxdown/vue-plugins/plugins/code-shiki';

type MessageProps = {
  text: string;
};

const props = defineProps<MessageProps>();
</script>

<template>
  <FluxdownLite :text="props.text" :plugins="CodeShikiPlugin" />
</template>
```

> 插件从 `@fluxdown/vue-plugins/plugins/<插件目录>` 导入。目录使用小写中划线，完整清单见[插件矩阵](./plugins/matrix.mdx)。

## 组合与配置

`plugins` 接受一个综合插件或数组。每个对象可以组合 `slots`、`renders`、`remarks`、`rehypes`、`repairs` 和 `mappers`，再用 `config` 配置当前对象列出的插件。

> `IPluginItem` 从 `@fluxdown/vue-plugins/typings` 导入。

Full 和 Lite 保留默认预设，再应用传入的插件；Raw 完全使用传入的列表。相同优先级下，后面的 render 先匹配，后面的 slot 通过 `Raw` 包裹前面的组件。

声明与派生方式见[综合插件](./plugins/aggregate.md)。只想调整流式动画时，也可以直接通过 `streaming.effect` 传入 mapper，见[自定义配置](./configuration.md)。
