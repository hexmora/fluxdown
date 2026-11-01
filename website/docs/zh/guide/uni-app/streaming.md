---
title: uni-app 流式 Markdown 渲染
description: 在 uni-app x 中用响应式文本连接 Fluxdown，渲染流式 Markdown。示例涵盖异步文本流、语法修复、平滑效果和消息状态隔离。
---

# 在 uni-app 中渲染流式 Markdown {#流式内容}

把收到的片段追加到响应式字符串中，传给 `text`。`streaming` 控制未完成语法的修复、平滑输出和末尾效果。

## 连接文本流

下面接收已经解析为文本的异步迭代器。SSE 或其他协议的解码留在请求层：

```vue
<script setup lang="ts">
import { Fluxdown } from '@fluxdown/uni-app';
import { ref } from 'vue';

const text = ref('');

const pending = ref(false);

async function read(chunks: AsyncIterable<string>) {
  text.value = '';

  pending.value = true;

  try {
    for await (const chunk of chunks) {
      text.value += chunk;
    }
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <Fluxdown :text="text" :streaming="pending" />
</template>
```

在应用发起请求后调用 `read(chunks)`。流结束时关闭 `streaming`，组件会完成剩余的平滑输出，再移除末尾效果。

## 调整输出

`streaming: true` 开启末尾修复、平滑输出和 `scale` 效果。传入对象可以分别调整：

```vue
<script setup lang="ts">
import type { StreamingConfig } from '@fluxdown/uni-app';

import { Fluxdown } from '@fluxdown/uni-app';

type MessageProps = {
  text: string;
  pending: boolean;
};

const props = defineProps<MessageProps>();

const streaming: StreamingConfig = {
  repairEnding: true,
  smooth: true,
  effect: ['shad', { length: 3, maskWidth: 18 }],
};
</script>

<template>
  <Fluxdown :text="props.text" :streaming="props.pending && streaming" />
</template>
```

| 配置           | 用途                                            |
| -------------- | ----------------------------------------------- |
| `repairEnding` | 修复尚未闭合的 Markdown，默认开启。             |
| `smooth`       | 平滑显示新到达的内容，默认开启。                |
| `effect`       | 选择末尾效果，默认 `scale`；设为 `false` 关闭。 |

只想显示服务端原本的片段节奏，可以关闭 `smooth`。自定义 ticker 与 scheduler 的方式见 [Core 流式内容](../core/streaming.md)。

## 四种末尾效果

| 效果     | 呈现方式                                 |
| -------- | ---------------------------------------- |
| `scale`  | 新文字由模糊、缩小逐渐变得清晰。         |
| `shad`   | 用渐变遮罩柔和地展开末尾。               |
| `chunk`  | 按收到的片段渐入，适合 `smooth: false`。 |
| `suffix` | 在末尾显示标记，提示内容还在生成。       |

例如，保留网络片段并逐段渐入：

```vue
<Fluxdown
  :text="text"
  :streaming="pending && { smooth: false, effect: 'chunk' }"
/>
```

`effect` 也接受 `[名称, 配置]` 或多个效果的数组，完整字段见[自定义配置](./configuration.md)。可以在[动画效果](../common/streaming-effects/animation/index.mdx)中查看四种效果的演示。

## 切换消息

每条消息使用独立组件，并把消息标识作为 `key`。切换到另一条内容时，组件会创建新的流式状态，避免把上一条消息的播放进度带过来。

```vue
<Fluxdown :key="message.id" :text="message.text" :streaming="message.pending" />
```

[横向演示](../common/features/renderers.mdx)可以同时查看各渲染库的静态与流式表现；[Playground](/playground)可以选择 uni-app 并输入自己的内容。
