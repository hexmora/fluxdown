---
title: Taro 流式 Markdown 渲染
description: 在 Taro React 项目中用 Fluxdown 渲染流式 Markdown，累积文本片段、配置平滑输出与动画效果，并管理消息的播放状态。
---

# 在 Taro 中渲染流式 Markdown {#流式内容}

将当前已收到的完整文本传给 `text`，用 `streaming` 控制末尾语法修复、平滑输出和动画效果。请求层继续负责数据传输与取消。

## 接收文本

如果请求返回的是单个片段，先累积文本，再更新组件：

```ts
type TextListener = (text: string) => void;

async function readMarkdown(
  chunks: AsyncIterable<string>,
  onText: TextListener,
) {
  let text = '';

  for await (const chunk of chunks) {
    text += chunk;

    onText(text);
  }
}
```

在请求处理函数中调用 `readMarkdown(chunks, setText)`。请求开始时开启 pending 状态，完成、失败或取消时关闭。如果请求库已经返回累积文本，直接按[快速开始](./quick-start.md#接入流式文本)传给组件即可。

## 调整输出

`streaming={true}` 开启末尾修复、平滑输出与 `scale` 效果。传对象可以分别配置：

```tsx
import { Fluxdown } from '@fluxdown/taro';

type MessageProps = {
  text: string;
  pending: boolean;
};

export function Message({ text, pending }: MessageProps) {
  return (
    <Fluxdown
      streaming={
        pending && {
          repairEnding: true,
          smooth: true,
          effect: ['shad', { length: 3, maskWidth: 18 }],
        }
      }
      text={text}
    />
  );
}
```

| 选项           | 用途                                                |
| -------------- | --------------------------------------------------- |
| `repairEnding` | 修复尚未闭合的 Markdown，默认开启。                 |
| `smooth`       | 让收到的内容平滑显示，默认开启。                    |
| `effect`       | 选择末尾效果，默认为 `scale`，设为 `false` 可关闭。 |

关闭 `smooth` 可以保留原始片段的到达节奏。自定义时钟与调度器见 [Core 流式输出](../core/streaming.md)。

## 四种末尾效果

| 效果     | 表现                                        |
| -------- | ------------------------------------------- |
| `scale`  | 新文字放大到正常尺寸，同时从模糊变清晰。    |
| `shad`   | 末尾文字通过渐变遮罩逐步显现。              |
| `chunk`  | 每个新片段淡入，搭配 `smooth: false` 使用。 |
| `suffix` | 在末尾显示标记，提示内容仍在生成。          |

例如，保留收到的片段，逐段淡入：

```tsx
<Fluxdown
  streaming={pending && { smooth: false, effect: 'chunk' }}
  text={text}
/>
```

`effect` 也接受 `[名称, 选项]` 或效果数组。完整字段见[自定义配置](./configuration.md)，交互演示见[动画效果](../common/streaming-effects/animation/index.mdx)。

## 结束或切换消息

生成结束后将 `streaming` 设为 `false`。组件会完成剩余的平滑输出，再移除末尾效果。

每条消息使用独立组件，以稳定的消息标识作为 `key`。换成不同的 key 后，组件会创建新的流式状态：

```tsx
<Fluxdown key={message.id} streaming={message.pending} text={message.text} />
```
