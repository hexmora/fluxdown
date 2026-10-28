# 流式内容

把收到的片段追加到 signal 中，传给 `text`。`streaming` 控制未完成语法的修复、平滑输出和末尾效果。

## 连接文本流

下面在挂载时接收已经解析为文本的异步迭代器。SSE 等协议的解码、请求取消和错误提示留在请求层：

```tsx
import { Fluxdown } from '@fluxdown/solid';
import { createSignal, onMount } from 'solid-js';

type MessageProps = {
  chunks: AsyncIterable<string>;
};

export function Message(props: MessageProps) {
  const [text, setText] = createSignal('');

  const [pending, setPending] = createSignal(true);

  async function read(chunks: AsyncIterable<string>) {
    try {
      for await (const chunk of chunks) {
        setText((value) => value + chunk);
      }
    } finally {
      setPending(false);
    }
  }

  onMount(() => {
    void read(props.chunks);
  });

  return <Fluxdown text={text()} streaming={pending()} />;
}
```

每条流使用独立的组件实例。流结束时关闭 `streaming`，组件会显示剩余内容并关闭末尾效果。

## 调整输出

`streaming: true` 开启末尾修复、平滑输出和 `scale` 效果。传入对象可以分别调整：

```tsx
import type { StreamingConfig } from '@fluxdown/solid';

import { Fluxdown } from '@fluxdown/solid';

type MessageProps = {
  text: string;
  pending: boolean;
};

const streaming: StreamingConfig = {
  repairEnding: true,
  smooth: true,
  effect: ['shad', { length: 3, maskWidth: 18 }],
};

export function Message(props: MessageProps) {
  return <Fluxdown text={props.text} streaming={props.pending && streaming} />;
}
```

> `StreamingConfig` 从 `@fluxdown/solid` 导入。

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

```tsx
<Fluxdown
  text={text()}
  streaming={pending() && { smooth: false, effect: 'chunk' }}
/>
```

`effect` 也接受 `[名称, 配置]` 或多个效果的数组，完整字段见[自定义配置](./configuration.md#streamingeffect)。可以在[动画效果](../common/streaming-effects/animation/index.mdx)中查看四种效果的演示。

## 切换消息

同一条消息持续更新 `text` 即可。复用一个展示位置切换不同消息时，用消息 ID 配合 `<Show keyed>`，让新消息获得独立的流式状态：

```tsx
import { Fluxdown } from '@fluxdown/solid';
import { Show } from 'solid-js';

type MessageProps = {
  id: string;
  text: string;
  pending: boolean;
};

export function Message(props: MessageProps) {
  return (
    <Show when={props.id} keyed>
      {(id) => {
        return (
          <Fluxdown
            data-message-id={id}
            text={props.text}
            streaming={props.pending}
          />
        );
      }}
    </Show>
  );
}
```

`when` 使用稳定的消息 ID。文字追加不会改变它，因此不会反复创建组件。
