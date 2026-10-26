# Slot 插件

Slot 插件负责渲染插槽。代码块、链接、标题等内容已经准备好，你只需要决定它们的组件和交互。

## 声明与使用

下面隐藏代码块工具栏，保留默认高亮和代码样式：

```tsx
import type { CodeBlockProps } from '@fluxdown/lynx-plugins/base';

import { Fluxdown } from '@fluxdown/lynx';
import { BaseSlotPlugin } from '@fluxdown/lynx-plugins/base';

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

`key` 标识插件，`type` 选择插槽，`Component` 提供组件。Fluxdown 管理插件的创建和清理。

> 插件基类和属性类型从 `@fluxdown/lynx-plugins/base` 导入。先安装 `@fluxdown/lynx-plugins`。

## 保留默认功能

`Raw` 是前一个插件提供的组件。调用它可以保留已有的高亮或排版，修改传给它的属性就能调整其中一部分。

相同优先级下，同一插槽后面的插件通过 `Raw` 包裹前面的组件。完全替换时，直接返回自己的 JSX 即可。

> `Raw` 可能为 `null`，调用前需要检查。

## 接入宿主交互

链接导航由应用提供。用 `Link` 插槽把点击连接到已有的导航方法：

```tsx
import type { LinkProps } from '@fluxdown/lynx-plugins/base';

import { BaseSlotPlugin } from '@fluxdown/lynx-plugins/base';

import { openUrl } from './native-bridge';

function HostLink({ Raw, ...props }: LinkProps) {
  return Raw ? <Raw {...props} onTap={({ href }) => openUrl(href)} /> : null;
}

export class HostLinkPlugin extends BaseSlotPlugin<'Link'> {
  static readonly key = 'host-link';

  readonly type = 'Link';

  readonly Component = HostLink;
}
```

将 `HostLinkPlugin` 放进 `plugins.slots`；这里的 `openUrl` 来自应用自己的桥接模块，也可以处理脚注等锚点导航。

代码复制通过 `CodeBlock` 插槽的 `onCopy({ code, language, meta })` 接入。回调可以返回 `void` 或 `Promise<void>`；提供后，工具栏会显示复制按钮。图片插槽提供 `onTap({ src, event })`，可连接应用的图片预览。

## 选择插槽

| 插槽                                       | 常见用途                           |
| ------------------------------------------ | ---------------------------------- |
| `CodeBlock`                                | 调整代码块，接入复制或隐藏工具栏。 |
| `CodeHeader`                               | 修改工具栏，加入分享等操作。       |
| `CodeHighlighter`                          | 接入自己的代码高亮呈现。           |
| `Link`、`Image`                            | 定制链接导航和图片交互。           |
| `Heading`、`Paragraph`                     | 调整标题和段落组件。               |
| `Table`、`TableCell`、`List`、`Blockquote` | 定制内容布局。                     |
| `Tex`                                      | 接入公式呈现。                     |

每个插槽都有对应的属性类型，例如 `LinkProps`、`HeadingProps`。需要改变 HAST 节点对应的插槽时，使用 [Render 插件](./render.md)。
