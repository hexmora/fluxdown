# Render 插件

Render 插件将 HAST 节点渲染成插槽，决定哪些内容交给哪个组件。插槽本身的样式和交互由 slot 插件负责。

## 声明与使用

下面把以“提示：”开头的段落交给引用块插槽，其余段落保持原样：

```tsx
import type {
  LynxRenderMatchParams,
  LynxRenderParams,
} from '@fluxdown/lynx-plugins/base';

import { Fluxdown } from '@fluxdown/lynx';
import {
  BaseLynxRenderPlugin,
  createTypeOfSlot,
  isElementWithTag,
} from '@fluxdown/lynx-plugins/base';

const Blockquote = /*#__PURE__*/ createTypeOfSlot('Blockquote');

const Paragraph = /*#__PURE__*/ createTypeOfSlot('Paragraph');

function renderNote({
  node,
  parents,
  render,
  renderChildren,
}: LynxRenderParams) {
  if (!isElementWithTag(node, 'p')) {
    return null;
  }

  return (
    <Blockquote current={node} parents={parents} render={render}>
      <Paragraph
        current={node}
        parents={parents}
        render={render}
        style={{ marginTop: '0px', marginBottom: '0px' }}
      >
        {renderChildren(node)}
      </Paragraph>
    </Blockquote>
  );
}

class NoteRenderPlugin extends BaseLynxRenderPlugin {
  static readonly key = 'render-note';

  match({ node }: LynxRenderMatchParams) {
    if (!isElementWithTag(node, 'p')) {
      return false;
    }

    const first = node.children[0];

    return first?.type === 'text' && first.value.startsWith('提示：');
  }

  readonly render = renderNote;
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

> 基类、参数类型和 `createTypeOfSlot` 从 `@fluxdown/lynx-plugins/base` 导入。使用前安装 `@fluxdown/lynx-plugins`。

`match` 选择节点，`renderChildren` 渲染其子节点。`current`、`parents` 和 `render` 保留插槽需要的上下文。

将 JSX 渲染函数放在类外，再赋给 `readonly render`，避免 ReactLynx 编译器把插件的 `render` 方法识别成类组件。

## 匹配顺序

更小的 `priority` 更早匹配；相同优先级下，后面的 render 插件先匹配，因此自定义插件优先于预设。未匹配的节点继续由预设处理。

只想修改组件或交互时，使用 [Slot 插件](./slot.md) 更直接。要先修改 HAST 内容，使用 [Rehype 插件](../../core/plugins/rehype.mdx)。
