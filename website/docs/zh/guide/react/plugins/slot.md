# Slot 插件

Slot 插件负责渲染插槽：代码块、链接、标题等内容已经准备好，你只需要决定它们的组件和交互。调整界面通常从这里开始。

## 声明与使用

下面隐藏代码块工具栏，保留默认高亮和代码样式：

```tsx
import type { CodeBlockProps } from '@fluxdown/react-presets/base';

import { BaseSlotPlugin } from '@fluxdown/react-presets/base';
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

> 插件基类和属性类型从 `@fluxdown/react-presets/base` 导入。先运行 `pnpm add @fluxdown/react-presets` 安装扩展包。

## 保留默认功能

`Raw` 是前一个插件提供的组件。调用它可以保留默认高亮、复制或链接行为；修改传给它的属性，就能定制其中一部分。

相同优先级下，同一插槽后面的插件通过 `Raw` 包裹前面的组件。完全替换时，直接返回自己的 JSX 即可。

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
