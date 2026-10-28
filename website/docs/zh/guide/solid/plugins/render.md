# Render 插件

Render 插件将 HAST 节点渲染成插槽，决定哪些内容交给哪个组件。插槽的样式与交互由 slot 插件负责。

## 声明与使用

下面把以“提示：”开头的段落交给引用块插槽，其余段落保持原样。在 `.tsx` 文件中声明：

```tsx
import type {
  SolidRenderMatchParams,
  SolidRenderParams,
} from '@fluxdown/solid-plugins/base';

import {
  BaseSolidRenderPlugin,
  createTypeOfSlot,
  isElementWithTag,
} from '@fluxdown/solid-plugins/base';

const Blockquote = /*#__PURE__*/ createTypeOfSlot('Blockquote');

export class NoteRenderPlugin extends BaseSolidRenderPlugin {
  static readonly key = 'render-note';

  match({ node }: SolidRenderMatchParams) {
    if (!isElementWithTag(node, 'p')) {
      return false;
    }

    const first = node.children[0];

    return first?.type === 'text' && first.value.startsWith('提示：');
  }

  render(props: SolidRenderParams) {
    return (
      <Blockquote
        current={props.node}
        parents={props.parents}
        render={props.render}
      >
        {props.renderChildren()}
      </Blockquote>
    );
  }
}
```

再传给组件：

```tsx
import { Fluxdown } from '@fluxdown/solid';

import { NoteRenderPlugin } from './plugins/note';

const plugins = { renders: [NoteRenderPlugin] };

export function Article() {
  return <Fluxdown text="提示：请保存修改。" plugins={plugins} />;
}
```

> 基类、参数类型和 `createTypeOfSlot` 从 `@fluxdown/solid-plugins/base` 导入。使用前安装 `@fluxdown/solid-plugins`。

`match` 选择节点，`renderChildren()` 渲染当前节点的子内容。`current`、`parents` 和 `render` 保留插槽需要的上下文。

## 保持响应式更新

`render` 在 Solid 组件上下文中执行。像编写普通 Solid 组件一样，在 JSX 中读取 `props.node`、`props.parents`，不要先解构成普通变量。派生数据可用 `createMemo`，副作用可用 `createEffect`，清理工作放在 `onCleanup` 中。

`renderChildren()` 默认读取当前节点。需要渲染某个响应式子节点时，可以传 getter：`props.render(() => child())`；渲染指定父节点的子内容则使用 `props.renderChildren(() => parent())`。保留 getter 后，文本追加时仍会读取最新节点。

需要透传 HAST 属性时，先通过 `props.getProps(element)` 转换成 Solid 属性，再传给插槽。它会处理类名、样式与 `data-*` 等属性。

## 匹配顺序

更小的 `priority` 更早匹配；相同优先级下，后面的 render 插件先匹配，因此自定义插件优先于预设。未匹配的节点继续由预设处理。

只想修改组件或交互时，使用 [Slot 插件](./slot.md) 更直接。要先修改 HAST 内容，使用 [Rehype 插件](../../core/plugins/rehype.mdx)。
