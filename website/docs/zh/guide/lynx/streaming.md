# 流式内容

把累积文本传给 `text`，用请求状态控制 `streaming`：

```tsx
import { Fluxdown } from '@fluxdown/lynx';

type MessageProps = {
  text: string;
  pending: boolean;
};

export function Message({ text, pending }: MessageProps) {
  return <Fluxdown streaming={pending} text={text} />;
}
```

如果数据源提供增量片段，先在应用中拼接，再传给组件。

## 平滑输出与动画

`streaming` 为 `true` 时，默认开启末尾修复、平滑输出和 `scale` 效果。传对象可以分别调整：

```tsx
<Fluxdown
  streaming={
    pending && {
      repairEnding: true,
      smooth: true,
      effect: 'shad',
    }
  }
  text={text}
/>
```

内置四种效果：

- `scale`：文字从模糊、缩小的状态显现。
- `shad`：每个新出现的字符按各自的时钟淡入。
- `chunk`：新增文本片段逐步淡入。
- `suffix`：在末尾显示呼吸闪烁的光标或圆点。

解析和流式调度在后台线程执行，视觉效果由 Lynx 元素呈现。平滑输出会选择可用的动画帧时钟，没有时使用定时器。驱动、插值和效果组合的配置见 [React 的自定义配置](../react/configuration.md#streaming)。

## 完成与取消

请求完成、取消或出错后，将 `streaming` 设为 `false`。组件会显示已经收到的完整内容并清理末尾效果。

[横向演示](../common/features/renderers.mdx)：同时查看 React、Vue、Solid、React Native 和 Lynx 的静态与流式表现。
