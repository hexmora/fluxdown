# Slot 插件

Slot 插件负责渲染插槽：代码块、链接、标题等内容已经准备好，你只需要决定它们的组件和交互。调整界面通常从这里开始。

## 声明与使用

下面隐藏代码块工具栏，保留默认高亮和代码样式：

```tsx
import type { CodeBlockProps } from '@fluxdown/react-presets/base';

import { BaseSlotPlugin } from '@fluxdown/react-base-presets/base';
import { Fluxdown } from 'fluxdown';

function CompactCodeBlock({ Raw, ...props }: CodeBlockProps) {
  return Raw ? <Raw {...props} showHeader={false} /> : null;
}

class CompactCodeBlockPlugin extends BaseSlotPlugin<'CodeBlock'> {
  static readonly key = 'compact-code-block';

  readonly type = 'CodeBlock';

  readonly Component = CompactCodeBlock;
}

type MessageProps = {
  text: string;
};

export function Message({ text }: MessageProps) {
  return <Fluxdown plugins={{ slots: [CompactCodeBlockPlugin] }} text={text} />;
}
```

`key` 标识插件，`type` 选择插槽，`Component` 提供组件。把插件类放进 `slots`，Fluxdown 会管理它的创建和清理。

> 共享插件基类从 `@fluxdown/react-base-presets/base` 导入，Web 属性类型从 `@fluxdown/react-presets/base` 导入。先运行 `pnpm add @fluxdown/react-base-presets @fluxdown/react-presets` 安装两个扩展包。

## 保留默认功能

`Raw` 是前一个插件提供的组件。调用它可以保留默认高亮、复制或链接行为；修改传给它的属性，就能定制其中一部分。

同一插槽可以叠加多个插件，后面的插件通过 `Raw` 包裹前面的组件。完全替换时，直接返回自己的 JSX 即可。

> `Raw` 可能为 `null`，调用前需要检查。

## 选择插槽

| 插槽                          | 常见用途                             |
| ----------------------------- | ------------------------------------ |
| `CodeBlock`                   | 调整整个代码块，隐藏工具栏。         |
| `CodeHeader`                  | 修改代码工具栏，加入复制以外的操作。 |
| `CodeHighlighter`             | 接入自己的代码高亮呈现。             |
| `Link`、`Image`               | 定制链接导航和图片交互。             |
| `Heading`、`Paragraph`        | 调整标题和段落组件。                 |
| `Table`、`List`、`Blockquote` | 定制表格、列表和引用块。             |
| `Tex`                         | 接入自己的公式呈现。                 |

每个插槽都有对应的属性类型，例如 `LinkProps`、`HeadingProps`。

如果需要改变某个 HAST 节点对应的插槽，继续阅读 [Render 插件](./render.md)。

## 内置插件

Fluxdown 默认包含这些插件，无需手动添加。

这些插件包含在 `PRESET_SLOT_PLUGINS` 中，从 `@fluxdown/react-presets/slot` 导入。

| 插件                        | 作用                                                 |
| --------------------------- | ---------------------------------------------------- |
| `BlockquoteSlotPlugin`      | 提供引用块的布局和样式。                             |
| `BreakLineSlotPlugin`       | 显示换行。                                           |
| `CodeBlockSlotPlugin`       | 组合代码工具栏与高亮区域。                           |
| `CodeHeaderSlotPlugin`      | 显示代码语言和复制操作，也可加入自定义操作。         |
| `CodeHighlighterSlotPlugin` | 按语言高亮代码；高亮尚未就绪时保持源码可读。         |
| `EmphasisSlotPlugin`        | 显示斜体文字。                                       |
| `HeadingSlotPlugin`         | 显示各级标题。                                       |
| `ImageSlotPlugin`           | 显示图片、说明文字与尺寸，并检查图片 URL。           |
| `LinkSlotPlugin`            | 显示链接并处理可用的 URL。                           |
| `ListSlotPlugin`            | 为有序、无序和任务列表提供默认布局。                 |
| `ParagraphSlotPlugin`       | 提供段落排版。                                       |
| `StrongSlotPlugin`          | 显示加粗文字。                                       |
| `TableSlotPlugin`           | 提供表格容器与布局。                                 |
| `TableCellSlotPlugin`       | 提供表头和单元格，并保留列对齐方式。                 |
| `NodeSlotPlugin`            | 渲染其余支持的节点，包括普通文本和行内代码。         |
| `ShadSlotPlugin`            | 显示流式输出末尾的渐变效果。                         |
| `TexSlotPlugin`             | 显示数学公式，并在完整公式渲染器加载前提供轻量展示。 |

> 公式预设已包含在内，但仍需要通过 `build={{ tex: true }}` 开启公式语法。
