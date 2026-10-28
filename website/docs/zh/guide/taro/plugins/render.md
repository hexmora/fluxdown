# Render 插件

Render 插件将 HAST 节点渲染成插槽。它决定哪些节点交给哪个插槽，以及传递什么内容；插槽的组件仍由 slot 插件负责。

## 声明与使用

下面把以“提示：”开头的普通段落交给引用块插槽，其余段落保持原样：

```tsx
import type {
  ReactRenderMatchParams,
  ReactRenderParams,
} from '@fluxdown/react-base-plugins/base';

import {
  BaseReactRenderPlugin,
  createTypeOfSlot,
  isElementWithTag,
} from '@fluxdown/react-base-plugins/base';
import { Fluxdown } from '@fluxdown/taro';

const Blockquote = createTypeOfSlot('Blockquote');

class NoteRenderPlugin extends BaseReactRenderPlugin {
  static readonly key = 'render-note';

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

更小的 `priority` 更早匹配；相同优先级下，后面的 render 插件先匹配，因此传入的自定义插件优先于预设。未匹配的节点继续由预设处理。

> 基类、渲染类型与插槽工厂从 `@fluxdown/react-base-plugins/base` 导入，使用前安装 `pnpm add @fluxdown/react-base-plugins`。

只想修改组件、样式或交互时，使用 [Slot 插件](./slot.md) 更直接。要先修改 HAST 内容，使用 [Rehype 插件](../../core/plugins/rehype.mdx)。
