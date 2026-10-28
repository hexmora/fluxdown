# 快速开始

Fluxdown 为 Vue 3 提供 Markdown 组件。它基于同一个 Core，支持静态内容、流式修复、平滑输出和末尾效果，用主题与插件调整呈现方式。

## 安装

```bash
pnpm add @fluxdown/vue
```

项目需要 Vue 3。可以直接在单文件组件中使用：

```vue
<script setup lang="ts">
import { Fluxdown } from '@fluxdown/vue';

const text = '# 你好，Fluxdown\n\n让文字自然展开。';
</script>

<template>
  <Fluxdown :text="text" />
</template>
```

> 浏览器入口会加载组件样式。服务端渲染项目在应用入口引入 `@fluxdown/vue/styles.css`，让首屏也使用相同的样式。

## 接收流式内容

`text` 始终是截至目前收到的完整文本。内容还在增长时传入 `streaming`，结束时改为 `false`：

```vue
<script setup lang="ts">
import { Fluxdown } from '@fluxdown/vue';

type MessageProps = {
  text: string;
  pending: boolean;
};

const props = defineProps<MessageProps>();
</script>

<template>
  <Fluxdown :text="props.text" :streaming="props.pending" />
</template>
```

Vue 会在属性更新时同步内容。网络请求和消息状态由应用管理，组件负责呈现。

## 选择规格

| 组件           | 入口                 | 用途                                         |
| -------------- | -------------------- | -------------------------------------------- |
| `Fluxdown`     | `@fluxdown/vue`      | 完整预设，包含代码高亮、公式和图表。         |
| `FluxdownLite` | `@fluxdown/vue/lite` | 基础 Markdown 与四种末尾效果，按需添加插件。 |
| `FluxdownRaw`  | `@fluxdown/vue/raw`  | 自行传入 `plugins`，决定全部能力。           |

完整列表见[插件矩阵](./plugins/matrix.mdx)。需要调整输出节奏，继续阅读[流式内容](./streaming.md)；需要调整外观，阅读[样式指南](./customization.md)。
