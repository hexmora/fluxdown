# 使用与编写插件

插件按内容处理过程分工。调整组件和交互，从 slot 开始；需要改变节点对应的插槽，再使用 render。解析、修复和流式映射由 Core 插件处理。

实现流式视觉特效时，可以通过 [`streaming.effect`](./configuration.md#streamingeffect) 直接传入 mapper。它接受与 `plugins.mappers` 相同的 mapper 和配置，无须额外包装成插件集合。

| 类型     | 作用                                         | 编写指南                                  |
| -------- | -------------------------------------------- | ----------------------------------------- |
| `slot`   | 渲染插槽，提供组件和交互。                   | [Slot 插件](./plugins/slot.md)            |
| `render` | 将 HAST 渲染成插槽。                         | [Render 插件](./plugins/render.md)        |
| `mapper` | 响应式映射 HAST，控制内容如何逐步呈现。      | [Mapper 插件](../core/plugins/mapper.mdx) |
| `remark` | 解析 Markdown 语法。                         | [Remark 插件](../core/plugins/remark.mdx) |
| `rehype` | 对 HAST 做二次处理。                         | [Rehype 插件](../core/plugins/rehype.mdx) |
| `repair` | 对 Markdown AST 做二次处理，修复未完成内容。 | [Repair 插件](../core/plugins/repair.mdx) |

## 使用一个插件包

`plugins` 接收一个 `IPluginItem`，也可以接收它的数组。一个插件包可以包含 `slots`、`renders`、`remarks`、`rehypes`、`repairs` 和 `mappers` 中的多个列表。

> `IPluginItem` 类型从 `@fluxdown/react-base-plugins/typings` 导入。

```tsx
import { Fluxdown } from 'fluxdown';

import { HighlightedPlugin } from './plugins/highlighted';

type MessageProps = {
  text: string;
};

export function Message({ text }: MessageProps) {
  return <Fluxdown plugins={HighlightedPlugin} text={text} />;
}
```

这里的 `HighlightedPlugin` 是应用中导出的[综合插件](./plugins/aggregate.md)，可以把多个 slot、render 和 Core 插件组成一个功能。

## 组合多个插件包

把需要的插件包按顺序放进数组，直接传给 `Fluxdown`。相同优先级下，后面的 render 先匹配，后面的 slot 通过 `Raw` 包裹前面的组件：

```tsx
import { Fluxdown } from 'fluxdown';

import { HighlightedPlugin } from './plugins/highlighted';
import { CommentPlugin } from '../plugins/comment';

type MessageProps = {
  text: string;
};

export function Message({ text }: MessageProps) {
  return <Fluxdown plugins={[HighlightedPlugin, CommentPlugin]} text={text} />;
}
```

## 配置预设插件

在相应列表中指定预设，再通过 `config` 按插件的 `key` 提供选项。例如，图片地址尚未生成完成时，先隐藏它：

```tsx
import { IncompleteImageRepairPlugin } from '@fluxdown/core-plugins/plugins/repair/incomplete-image';
import { Fluxdown } from 'fluxdown';

type MessageProps = {
  text: string;
};

export function Message({ text }: MessageProps) {
  return (
    <Fluxdown
      plugins={{
        repairs: [IncompleteImageRepairPlugin],
        config: {
          'repair-incomplete-image': { strategy: 'discard' },
        },
      }}
      streaming
      text={text}
    />
  );
}
```

> 这个例子需要 `pnpm add @fluxdown/core-plugins`。默认图片策略是 `placeholder`，会先显示占位内容。

`config` 作用于同一个插件包里列出的插件。其他预设会继续保留。内置 React 插件见[插件矩阵](./plugins/matrix.mdx)，解析与映射预设见 [Core 插件](../core/plugins.md)。完整属性见[自定义配置](./configuration.md#plugins)。
