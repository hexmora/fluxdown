---
title: Svelte Markdown 渲染器
description: 在 Svelte 5 或 SvelteKit 中使用 Fluxdown，渲染 Markdown 与流式文本。了解组件安装、基础示例，以及 Full、Lite 和 Raw 的选择。
---

# Svelte Markdown 渲染器快速开始 {#快速开始}

Svelte 版基于 Core 实现，提供语法修复、平滑输出和可替换的渲染插槽。组件使用 Svelte 5，可用于已有的 Svelte 或 SvelteKit 项目。

## 安装

```sh
pnpm add @fluxdown/svelte
```

组件由项目中的 Svelte 编译器处理，导入时会一并加载所需样式。

## 显示第一段内容

```svelte
<script lang="ts">
  import { Fluxdown } from '@fluxdown/svelte';

  const markdown = `# 你好，Fluxdown

让正在生成的内容，也能**轻松阅读**。`;
</script>

<Fluxdown text={markdown} />
```

## 接入流式文本

```svelte
<script lang="ts">
  import { Fluxdown } from '@fluxdown/svelte';

  type MessageProps = {
    text: string;
    pending: boolean;
  };

  let { text, pending }: MessageProps = $props();
</script>

<Fluxdown streaming={pending} {text} />
```

`text` 始终传入截至目前收到的完整内容。请求结束时，将 `streaming` 设为 `false`。

## 选择组件

默认的 `Fluxdown` 包含代码高亮、公式和图表。`FluxdownLite` 提供基础展示能力，`FluxdownRaw` 由你传入完整插件列表。

> `Fluxdown` 从 `@fluxdown/svelte` 或 `@fluxdown/svelte/full` 导入，`FluxdownLite` 从 `@fluxdown/svelte/lite` 导入，`FluxdownRaw` 从 `@fluxdown/svelte/raw` 导入。

## 下一步

- [流式内容](./streaming.md)：控制平滑输出与末尾效果。
- [样式指南](./customization.md)：调整颜色、字体和间距。
- [插件矩阵](./plugins/matrix.mdx)：选择预设或自己组装。
- [横向演示](../common/features/renderers.mdx)：同时查看 React、Vue、Svelte、Angular、React Native、Lynx、Solid 和 Taro 的静态与流式表现。
