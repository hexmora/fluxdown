# 流式内容

把收到的片段追加到 signal 中，传给 `text`。`streaming` 控制未完成语法的修复、平滑输出和末尾效果。

## 连接文本流

下面接收已经解析为文本的异步迭代器。SSE 或其他协议的解码留在请求层：

```ts
import { Component, signal } from '@angular/core';
import { Fluxdown } from '@fluxdown/angular';

@Component({
  selector: 'app-message',
  imports: [Fluxdown],
  template: `<fluxdown [text]="text()" [streaming]="pending()" />`,
})
export class Message {
  readonly text = signal('');

  readonly pending = signal(false);

  async read(chunks: AsyncIterable<string>) {
    this.text.set('');

    this.pending.set(true);

    try {
      for await (const chunk of chunks) {
        this.text.update((text) => text + chunk);
      }
    } finally {
      this.pending.set(false);
    }
  }
}
```

在应用发起请求后调用 `read(chunks)`。流结束时关闭 `streaming`，组件会显示已收到的完整内容，并移除末尾标记。

## 调整输出

`streaming: true` 开启末尾修复、平滑输出和 `scale` 效果。传入对象可以分别调整：

```ts
import type { StreamingConfig } from '@fluxdown/angular';

import { Component, input } from '@angular/core';
import { Fluxdown } from '@fluxdown/angular';

@Component({
  selector: 'app-message',
  imports: [Fluxdown],
  template: `<fluxdown [text]="text()" [streaming]="pending() && streaming" />`,
})
export class Message {
  readonly text = input.required<string>();

  readonly pending = input(false);

  readonly streaming: StreamingConfig = {
    repairEnding: true,
    smooth: true,
    effect: ['shad', { length: 6, duration: 600 }],
  };
}
```

> `StreamingConfig` 从 `@fluxdown/angular` 导入。

| 配置           | 用途                                            |
| -------------- | ----------------------------------------------- |
| `repairEnding` | 修复尚未闭合的 Markdown，默认开启。             |
| `smooth`       | 平滑显示新到达的内容，默认开启。                |
| `effect`       | 选择末尾效果，默认 `scale`；设为 `false` 关闭。 |

## 四种末尾效果

| 效果     | 呈现方式                                 |
| -------- | ---------------------------------------- |
| `scale`  | 新文字由模糊、缩小逐渐变得清晰。         |
| `shad`   | 每个新出现的字符按各自的时钟淡入。       |
| `chunk`  | 按收到的片段渐入，适合 `smooth: false`。 |
| `suffix` | 在末尾显示标记，提示内容还在生成。       |

保留网络片段并逐段渐入：

```html
<fluxdown
  [text]="text()"
  [streaming]="pending() && { smooth: false, effect: 'chunk' }"
/>
```

`effect` 也接受 `[名称, 配置]` 或多个效果的数组。完整字段见[自定义配置](./configuration.md)，实时演示见[动画效果](../common/streaming-effects/animation/index.mdx)。自定义驱动与插值方式见 [Core 流式内容](../core/streaming.md)。

## 多条消息

每条消息使用独立组件，并在 `@for` 中通过消息标识跟踪它，避免让另一条消息复用上一条的播放进度：

```html
@for (message of messages(); track message.id) {
<fluxdown [text]="message.text" [streaming]="message.pending" />
}
```
