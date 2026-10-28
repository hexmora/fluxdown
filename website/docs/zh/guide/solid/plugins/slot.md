# Slot 插件

Slot 插件负责渲染插槽。代码、链接、标题等内容已经准备好，你只需要决定它们的组件和交互。

## 声明与使用

下面隐藏代码工具栏，保留默认高亮与代码样式。在 `.tsx` 文件中声明插件：

```tsx
import type { CodeBlockProps } from '@fluxdown/solid-plugins/base';

import { BaseSlotPlugin } from '@fluxdown/solid-plugins/base';
import { splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';

function CompactCodeBlock(props: CodeBlockProps) {
  const [local, content] = splitProps(props, ['Raw']);

  return (
    <Dynamic
      component={local.Raw ?? undefined}
      {...content}
      showHeader={false}
    />
  );
}

export class CompactCodeBlockPlugin extends BaseSlotPlugin<'CodeBlock'> {
  static readonly key = 'compact-code-block';

  readonly type = 'CodeBlock';

  readonly Component = CompactCodeBlock;
}
```

再传给组件：

```tsx
import { Fluxdown } from '@fluxdown/solid';

import { CompactCodeBlockPlugin } from './plugins/compact-code';

type MessageProps = {
  text: string;
};

const plugins = { slots: [CompactCodeBlockPlugin] };

export function Message(props: MessageProps) {
  return <Fluxdown text={props.text} plugins={plugins} />;
}
```

> 插件基类和属性类型从 `@fluxdown/solid-plugins/base` 导入。使用前安装 `@fluxdown/solid-plugins`。

`key` 标识插件，`type` 选择插槽，`Component` 提供 Solid 组件。`splitProps` 保留属性的响应式访问；也可以直接使用 `props.code` 等字段。

## 保留默认功能

`Raw` 是前一个插件提供的组件。调用它可以保留已有的高亮或排版，修改属性就能调整其中一部分。

相同优先级下，同一插槽后面的插件通过 `Raw` 包裹前面的组件。完全替换时，直接返回自己的 JSX 即可；带有子内容的插槽通过 `props.children` 读取子内容。

> `Raw` 可能为 `null`。上例用 `Dynamic` 的 `undefined` 分支处理没有前置组件的情况。

插槽组件可以使用 `createSignal`、`createEffect` 和 `onCleanup`，生命周期由 Solid 管理。自定义代码高亮时，在代码内容之后渲染 `props.suffix`，保留流式末尾标记。

## 选择插槽

| 插槽                                       | 常见用途                         |
| ------------------------------------------ | -------------------------------- |
| `CodeBlock`                                | 调整代码容器、复制行为或工具栏。 |
| `CodeHeader`                               | 修改工具栏，加入分享等操作。     |
| `CodeHighlighter`                          | 接入自己的代码高亮。             |
| `Link`、`Image`                            | 定制导航与图片交互。             |
| `Heading`、`Paragraph`                     | 调整标题与段落组件。             |
| `Table`、`TableCell`、`List`、`Blockquote` | 定制内容布局。                   |
| `Tex`                                      | 接入公式呈现。                   |
| `Scale`、`Shad`、`Chunk`、`Suffix`         | 调整流式效果的组件。             |
| `Wrapper`、`Fallback`                      | 包裹插槽或处理渲染错误。         |

每个插槽都有对应的属性类型，例如 `LinkProps`、`HeadingProps`。需要改变 HAST 节点对应的插槽时，使用 [Render 插件](./render.md)。
