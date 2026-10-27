# 流式内容

React Native 与 React 共用同一套流式处理。把累积文本传给 `text`，用请求状态控制 `streaming`：

```tsx
import { Fluxdown } from '@fluxdown/react-native';

type MessageProps = {
  text: string;
  pending: boolean;
};

export function Message({ text, pending }: MessageProps) {
  return <Fluxdown streaming={pending} text={text} />;
}
```

不要把最后一个片段单独传给 `text`。如果数据源提供增量片段，先在应用中把它们拼接起来。

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

原生插槽支持 `scale`、`shad`、`chunk` 和 `suffix`。平滑输出使用 React Native 提供的动画帧；末尾视觉效果由原生组件呈现。时钟、弹簧参数和效果组合沿用[通用流式配置](../react/configuration.md#streaming)。

- `scale`：文字从模糊、缩小的状态淡入。
- `shad`：每个新出现的字符按各自的时钟淡入。
- `chunk`：收到的文本片段整体淡入。
- `suffix`：在末尾显示呼吸闪烁的光标或圆点。

## 完成与取消

请求完成、取消或出错后，将 `streaming` 设为 `false`。组件会显示已经收到的完整内容并清理末尾效果。应用退到后台时，也可以暂停自己的数据源或视觉效果。

[对比 React](./comparison.mdx)可以切换四种效果，比较相同内容在两个渲染器中的表现。
