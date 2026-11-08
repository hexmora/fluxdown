---
title: 流式渲染 - Fluxdown Vue Lynx
description: 在 Vue Lynx 中渲染流式 Markdown，使用平滑输出、语法修复以及 scale、shad、chunk、suffix 四种流式效果。
---

# 流式渲染 - Fluxdown Vue Lynx {#streaming-content}

向 `text` 传入累计文本，用请求状态控制 `streaming`：

```vue
<script setup lang="ts">
import { Fluxdown } from '@fluxdown/vue-lynx';

defineProps<{ text: string; pending: boolean }>();
</script>

<template>
  <Fluxdown :streaming="pending" :text="text" />
</template>
```

Vue Lynx 沿用 [Vue 的流式配置](../vue/configuration.md#streaming)。`streaming` 为 `true` 时开启末尾修复、平滑输出和 `scale` 效果。

## 平滑输出和动画

```vue
<Fluxdown
  :streaming="pending && { repairEnding: true, smooth: true, effect: 'shad' }"
  :text="text"
/>
```

四种效果均使用 Lynx 元素，原生样式与 React Lynx 相同：

- `scale`：文字从较小、模糊的状态显现。
- `shad`：每个新出现的字符按各自的时钟淡入。
- `chunk`：收到的文本片段逐块淡入。
- `suffix`：脉动光标或圆点跟随末尾文字。

按片段输出时关闭 smooth，保留输入片段的边界：

```vue
<Fluxdown
  :streaming="pending && { smooth: false, effect: 'chunk' }"
  :text="text"
/>
```

完成、取消或失败后将 `streaming` 设为 `false`，显示已收到的全部文本并清除末尾效果。

在[横向演示](../common/features/renderers.mdx)中对比各渲染库。
