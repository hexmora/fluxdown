# 流式内容

把累积文本传给 `text`，用请求状态控制 `streaming`。Svelte 会随属性变化更新内容，无需手动刷新组件。

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

如果数据源提供增量片段，先在应用中拼接，再传给组件。

## 平滑输出与动画

`streaming` 为 `true` 时，默认开启末尾修复、平滑输出和 `scale` 效果。传对象可以分别调整：

```svelte
<Fluxdown
  streaming={pending && { repairEnding: true, smooth: true, effect: 'shad' }}
  {text}
/>
```

内置四种效果：

- `scale`：文字从模糊、缩小的状态显现。
- `shad`：末尾文字通过渐变逐步显现。
- `chunk`：新增文本片段逐步淡入。
- `suffix`：在末尾显示呼吸闪烁的光标或圆点。

`chunk` 适合直接呈现收到的片段，搭配 `smooth: false`：

```svelte
<Fluxdown
  streaming={pending && { smooth: false, effect: 'chunk' }}
  {text}
/>
```

关闭视觉效果、保留平滑输出时，设置 `effect: false`。时钟、调度器与效果组合的参数见[自定义配置](./configuration.md#streaming)。

## 完成与取消

请求完成、取消或出错后，将 `streaming` 设为 `false`。组件会显示已经收到的完整内容，并清理末尾效果。组件卸载时会自动清理自身订阅与动画。

[横向演示](../common/features/renderers.mdx)：同时查看 React、Vue、Svelte、React Native、Lynx、Solid、Taro 和 Angular 的静态与流式表现。
