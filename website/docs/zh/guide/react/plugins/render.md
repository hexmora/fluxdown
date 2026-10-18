# Render 插件

Render 插件将 HAST 节点渲染成插槽。它决定哪些节点交给哪个插槽，以及传递什么内容；插槽的组件仍由 slot 插件负责。

React 和 React Native 使用 `@fluxdown/react-base-presets` 中相同的 render 插件。下例使用 Web 组件；在原生应用中，将 `Fluxdown` 改为从 `@fluxdown/react-native` 导入即可。实际元素由平台插槽提供，`getProps` 提供对应平台的属性。

## 声明与使用

下面把以“提示：”开头的普通段落交给引用块插槽，其余段落保持原样：

```tsx
import type {
  ReactRenderMatchParams,
  ReactRenderParams,
} from '@fluxdown/react-base-presets/base';

import {
  BaseReactRenderPlugin,
  createTypeOfSlot,
  isElementWithTag,
} from '@fluxdown/react-base-presets/base';
import { Fluxdown } from 'fluxdown';

const Blockquote = createTypeOfSlot('Blockquote');

const Paragraph = createTypeOfSlot('Paragraph');

class NoteRenderPlugin extends BaseReactRenderPlugin {
  static readonly key = 'render-note';

  match({ node }: ReactRenderMatchParams) {
    if (!isElementWithTag(node, 'p')) {
      return false;
    }

    const first = node.children[0];

    return first?.type === 'text' && first.value.startsWith('提示：');
  }

  render({
    getProps,
    node,
    parents,
    render,
    renderChildren,
  }: ReactRenderParams) {
    if (!isElementWithTag(node, 'p')) {
      return null;
    }

    return (
      <Blockquote
        {...getProps(node)}
        current={node}
        parents={parents}
        render={render}
      >
        <Paragraph current={node} parents={parents} render={render}>
          {renderChildren(node)}
        </Paragraph>
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

`match` 选择节点，`render` 把节点内容交给插槽。`getProps` 把节点属性映射为平台属性。`renderChildren` 渲染子节点，`current`、`parents` 和 `render` 则保留插槽需要的上下文。

更小的 `priority` 更早匹配；相同优先级下，后面的 render 插件先匹配，因此传入的自定义插件优先于预设。未匹配的节点继续由预设处理。

> 这个例子需要 `pnpm add @fluxdown/react-base-presets`。

只想修改组件、样式或交互时，使用 [Slot 插件](./slot.md) 更直接。要先修改 HAST 内容，使用 [Rehype 插件](../../core/plugins/rehype.md)。
