# vue-markdown-render

最简单的迁移是把 `source` 改为 `text`。已有的 Vue 响应式数据可以继续使用，`markdown-it` 的选项与插件则需要单独调整。

<details className="agent-assistance">
<summary>使用 Agent 协助</summary>
<div className="agent-assistance-content">

把下面这段发给项目中的 Agent：

```markdown
请把项目的 vue-markdown-render 迁移到 @fluxdown/vue，直接完成代码修改。

# 参考文档

- 原库：https://github.com/cloudacy/vue-markdown-render
- 目标：https://hexmora.github.io/fluxdown/zh/guide/vue/quick-start.html

# 迁移步骤

1. 检查依赖版本与全部 VueMarkdown 用法，整理 options、markdown-it 插件、样式和自定义 HTML。
2. 用 Fluxdown 替换组件，将 source 改为 text，保留 Vue 响应式数据和请求逻辑。
3. 对照目标文档迁移语法、主题与交互。优先使用内置能力；额外语法用 Remark/Rehype 插件，组件定制用 Slot 插件，不要把 markdown-it 插件直接传入 plugins。
4. 如有流式内容，传入累积文本并正确结束 streaming。核对换行、标题锚点、HTML 和服务端首屏样式。
5. 运行现有检查，用实际内容验证结果，只移除已无引用的依赖。

完成后说明修改和验证结果，列出无法保持一致的行为，不要静默删去已有功能。
```

</div>
</details>

## 替换组件

```sh
pnpm add @fluxdown/vue
```

迁移前：

```vue
<script setup lang="ts">
import VueMarkdown from 'vue-markdown-render';

const props = defineProps<{ text: string }>();
</script>

<template>
  <VueMarkdown :source="props.text" />
</template>
```

迁移后：

```vue
<script setup lang="ts">
import { Fluxdown } from '@fluxdown/vue';

const props = defineProps<{ text: string }>();
</script>

<template>
  <Fluxdown :text="props.text" />
</template>
```

浏览器入口会加载样式。SSR 项目在应用入口引入 `@fluxdown/vue/styles.css`，再按[样式指南](../customization.md)调整主题。

## 调整解析与插件

Fluxdown 默认支持表格、任务列表、删除线和普通换行。原来依赖 `options.breaks`、`linkify` 或自定义解析规则的内容，需要用实际文章对照。缩进代码块和 Setext 标题默认关闭，保留这两种语法时显式开启：

```vue
<Fluxdown
  :text="props.text"
  :build="{ indentedCode: true, setextHeading: true }"
/>
```

两边的 `plugins` 含义不同。原来的 `markdown-it` 插件不能直接传给 Fluxdown：语法扩展参考 [Remark 插件](../../core/plugins/remark.mdx)，标题锚点等树处理参考 [Rehype 插件](../../core/plugins/rehype.mdx)，链接和代码块组件参考 [Slot 插件](../plugins/slot.md)。HTML 允许列表也在 Rehype 文档中配置。

有流式内容时，把截至目前的完整文本传给 `text`，用请求状态控制 `streaming`：

```vue
<Fluxdown :text="text" :streaming="pending" />
```

请求完成后将 `pending` 设为 `false`。源组件的配置见 [vue-markdown-render README](https://github.com/cloudacy/vue-markdown-render)。
