# 使用与编写插件

插件按内容处理过程分工。调整组件和交互，从 slot 开始；需要改变节点对应的插槽，再使用 render。解析、修复和流式映射由 Core 插件处理。

| 类型     | 作用                                | 编写指南                                  |
| -------- | ----------------------------------- | ----------------------------------------- |
| `slot`   | 渲染插槽，提供组件和交互。          | [Slot 插件](./plugins/slot.md)            |
| `render` | 将 HAST 节点渲染成插槽。            | [Render 插件](./plugins/render.md)        |
| `mapper` | 响应式映射 HAST，控制内容逐步呈现。 | [Mapper 插件](../core/plugins/mapper.mdx) |
| `remark` | 解析 Markdown 语法。                | [Remark 插件](../core/plugins/remark.mdx) |
| `rehype` | 对 HAST 做二次处理。                | [Rehype 插件](../core/plugins/rehype.mdx) |
| `repair` | 处理 Markdown AST，修复未完成内容。 | [Repair 插件](../core/plugins/repair.mdx) |

## 使用插件包

`plugins` 接收一个 `IPluginItem` 或它的数组。一个对象可以包含 `slots`、`renders`、`remarks`、`rehypes`、`repairs` 和 `mappers` 中的多个列表。

> `IPluginItem` 从 `@fluxdown/svelte-plugins/typings` 导入。单独添加插件时，先安装 `@fluxdown/svelte-plugins`，再从它的 `plugins/<小写中划线目录>` 子路径导入。

```svelte
<script lang="ts">
  import { FluxdownLite } from '@fluxdown/svelte/lite';
  import { CodeShikiPlugin } from '@fluxdown/svelte-plugins/plugins/code-shiki';

  type MessageProps = {
    text: string;
  };

  let { text }: MessageProps = $props();
</script>

<FluxdownLite plugins={CodeShikiPlugin} {text} />
```

这个例子为 Lite 添加代码高亮。多个插件包可以按顺序放进数组；相同优先级下，后面的 render 先匹配，后面的 slot 通过 `Raw` 包裹前面的组件。

## 配置与扩展

`config` 按插件的 `key` 提供选项，只作用于同一个对象列表中明确列出的插件。声明与组合示例见[综合插件](./plugins/aggregate.md)。

内置插件及 Full、Lite 的区别见[插件矩阵](./plugins/matrix.mdx)。需要完全自行组装时，使用 `FluxdownRaw` 并传入完整的 `plugins`。
