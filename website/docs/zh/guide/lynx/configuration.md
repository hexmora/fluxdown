# 自定义配置

用组件属性控制内容、流式输出、样式与插件。

| 属性        | 类型                           | 默认值与用途                            |
| ----------- | ------------------------------ | --------------------------------------- |
| `text`      | `string`                       | 必填，当前完整 Markdown。               |
| `streaming` | `boolean \| StreamingConfig`   | `false`，控制末尾修复、平滑输出和效果。 |
| `build`     | `BaseBuildConfig`              | `{}`，选择脚注、公式等解析能力。        |
| `theme`     | `Theme`                        | `'light'`，主题预设或局部覆盖。         |
| `className` | `string`                       | 最外层 `view` 的类名。                  |
| `style`     | `CSSProperties`                | 最外层 `view` 的样式。                  |
| `plugins`   | `IPluginItem \| IPluginItem[]` | 扩展预设；Raw 入口必填。                |
| `patches`   | `IPatchItem<ReactNode>[]`      | 用 Lynx 内容替换或插入指定文本。        |
| `getProps`  | `GetPropsFunction \| null`     | 转换语法树上的元素属性。                |
| `ref`       | `Ref<FluxdownRef>`             | 读取响应式渲染结果。                    |

> `BaseBuildConfig`、`StreamingConfig` 和 `FluxdownRef` 从 `@fluxdown/lynx` 导入；`Theme`、`IPluginItem` 和 `GetPropsFunction` 从 `@fluxdown/lynx-plugins/typings` 导入；`CSSProperties` 来自 `@lynx-js/types`，`ReactNode` 来自 `@lynx-js/react`。

## 编译与流式参数

`build`、`streaming` 和 `patches` 沿用 Core 的处理流程。共用字段、默认值与范围规则见 [React 的自定义配置](../react/configuration.md)。Lynx 支持的呈现方式见[插件矩阵](./plugins/matrix.mdx)。

`build.tex` 默认为 `false`。开启后会解析公式语法，内置 `Tex` 插槽显示公式源码；需要公式排版时可以替换这个插槽。

## 插入交互内容

补丁的 `render` 返回 ReactLynx 内容。插入段落中的文字使用 `text` 元素：

```tsx
<Fluxdown
  patches={[
    {
      key: 'person-ada',
      range: [3, 7],
      render: () => <text bindtap={() => openProfile('ada')}>@Ada</text>,
    },
  ]}
  text="欢迎，@Ada。"
/>
```

这里的 `openProfile` 由应用提供。位置按原始字符串索引计算；区间包含起点、不包含终点，并且应位于同一个内容块内。

## 元素属性

不传 `getProps` 时，组件会转换 `id`、`className`、尺寸、列表状态和 `data-*` 等支持的属性。传入函数可以替换这个过程；传 `null` 则不从语法树转发元素属性。

```tsx
<Fluxdown getProps={null} text={text} />
```

字体、间距等内部排版优先使用[主题](./customization.md)，链接导航、代码复制等交互使用 [Slot 插件](./plugins/slot.md)。

## 读取渲染结果

`FluxdownRef` 是响应式渲染结果的句柄，不是 `view` 引用。普通展示无需使用它；自己建立的订阅需要取消。

```tsx
import type { FluxdownRef } from '@fluxdown/lynx';

import { Fluxdown } from '@fluxdown/lynx';
import { useRef } from '@lynx-js/react';

type MessageProps = {
  text: string;
};

export function Message({ text }: MessageProps) {
  const content = useRef<FluxdownRef>(null);

  return <Fluxdown ref={content} text={text} />;
}
```
