# Render 插件

Render 插件将 HAST 节点渲染成插槽。它决定哪些节点交给哪个插槽，以及传递什么内容；插槽的组件仍由 slot 插件负责。

## 声明与使用

下面把以“提示：”开头的普通段落交给引用块插槽，其余段落保持原样：

```tsx
import type {
  ReactRenderMatchParams,
  ReactRenderParams,
} from '@fluxdown/react-presets/base';

import {
  BaseReactRenderPlugin,
  createTypeOfSlot,
  isElementWithTag,
} from '@fluxdown/react-presets/base';
import { Fluxdown } from 'fluxdown';

const Blockquote = createTypeOfSlot('Blockquote');

class NoteRenderPlugin extends BaseReactRenderPlugin {
  static readonly key = 'render-note';

  readonly config = { priority: -1 };

  match({ node }: ReactRenderMatchParams) {
    if (!isElementWithTag(node, 'p')) {
      return false;
    }

    const first = node.children[0];
    return first?.type === 'text' && first.value.startsWith('提示：');
  }

  render({ node, parents, render, renderChildren }: ReactRenderParams) {
    if (!isElementWithTag(node, 'p')) {
      return null;
    }

    return (
      <Blockquote current={node} parents={parents} render={render}>
        {renderChildren(node)}
      </Blockquote>
    );
  }
}

export function Note() {
  return (
    <Fluxdown
      plugins={{ renders: [NoteRenderPlugin] }}
      text="提示：请保存修改。"
    />
  );
}
```

`match` 选择节点，`render` 把节点内容交给插槽。`renderChildren` 渲染子节点，`current`、`parents` 和 `render` 则保留插槽需要的上下文。

更小的 `priority` 更早匹配。这里用 `-1`，让提示段落先于默认段落插件匹配；未匹配的节点继续由预设处理。

> 这个例子需要 `pnpm add @fluxdown/react-presets`。

只想修改组件、样式或交互时，使用 [Slot 插件](./slot.md) 更直接。要先修改 HAST 内容，使用 [Rehype 插件](../../core/plugins/rehype.md)。

## 内置插件

Fluxdown 默认包含这些插件，无需手动添加。

这些插件包含在 `PRESET_RENDER_PLUGINS` 中，从 `@fluxdown/react-presets/render` 导入。

| 插件                     | 作用                                                   |
| ------------------------ | ------------------------------------------------------ |
| `PatchRenderPlugin`      | 在指定文本位置渲染应用提供的替换内容。                 |
| `ShadRenderPlugin`       | 显示流式输出末尾的渐变效果。                           |
| `ScaleRenderPlugin`      | 为新出现的字符添加逐字缩放、淡入和模糊消退效果。       |
| `ChunkRenderPlugin`      | 让每组新出现的文字同时淡入。                           |
| `CodeRenderPlugin`       | 将代码、语言和附加信息交给代码块 slot。                |
| `EmphasisRenderPlugin`   | 把斜体内容交给 `Emphasis` slot。                       |
| `ImageRenderPlugin`      | 把图片地址、说明和尺寸交给 `Image` slot。              |
| `LinkRenderPlugin`       | 把链接地址、标题和内容交给 `Link` slot。               |
| `ListRenderPlugin`       | 将有序、无序和任务列表交给 `List` slot。               |
| `ParagraphRenderPlugin`  | 将段落交给 `Paragraph` slot。                          |
| `StrongRenderPlugin`     | 将加粗内容交给 `Strong` slot。                         |
| `TableRenderPlugin`      | 将表格交给 `Table` slot。                              |
| `TableCellRenderPlugin`  | 渲染表头和单元格，并保留列对齐方式。                   |
| `TexRenderPlugin`        | 将公式交给 `Tex` slot，保留行内／块级显示模式。        |
| `HeadingRenderPlugin`    | 将一至六级标题交给 `Heading` slot，保留标题级别。      |
| `BreakLineRenderPlugin`  | 将换行交给 `BreakLine` slot。                          |
| `BlockquoteRenderPlugin` | 将引用段落交给 `Blockquote` slot。                     |
| `FallbackRenderPlugin`   | 为其余支持的节点提供基础渲染，包括普通文本和行内代码。 |
