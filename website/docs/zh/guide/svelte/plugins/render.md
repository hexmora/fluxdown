# Render 插件

Render 插件将 HAST 节点转换为 Svelte 渲染描述，决定哪些内容交给哪个插槽。插槽本身的样式和交互由 slot 插件负责。

## 声明与使用

下面把以“Note:”开头的段落交给引用块插槽，其余段落保持原样：

```ts title="plugins.ts"
import type {
  SvelteRenderMatchParams,
  SvelteRenderParams,
} from '@fluxdown/svelte-plugins/base';

import {
  BaseSvelteRenderPlugin,
  createElement,
  createTypeOfSlot,
  isElementWithTag,
} from '@fluxdown/svelte-plugins/base';

const Blockquote = /*#__PURE__*/ createTypeOfSlot('Blockquote');

const Paragraph = /*#__PURE__*/ createTypeOfSlot('Paragraph');

export class NoteRenderPlugin extends BaseSvelteRenderPlugin {
  static readonly key = 'render-note';

  match({ node }: SvelteRenderMatchParams) {
    if (!isElementWithTag(node, 'p')) {
      return false;
    }

    const first = node.children[0];

    return first?.type === 'text' && first.value.startsWith('Note:');
  }

  render({ node, parents, render, renderChildren }: SvelteRenderParams) {
    if (!isElementWithTag(node, 'p')) {
      return null;
    }

    const props = { current: node, parents, render };

    return createElement(
      Blockquote,
      props,
      createElement(
        Paragraph,
        { ...props, style: 'margin-top: 0; margin-bottom: 0' },
        renderChildren(node),
      ),
    );
  }
}
```

```svelte
<script lang="ts">
  import { Fluxdown } from '@fluxdown/svelte';

  import { NoteRenderPlugin } from './plugins';
</script>

<Fluxdown
  plugins={{ renders: [NoteRenderPlugin] }}
  text="Note: save your changes before leaving."
/>
```

> 基类、参数类型、`createElement` 和 `createTypeOfSlot` 从 `@fluxdown/svelte-plugins/base` 导入。使用前安装 `@fluxdown/svelte-plugins`。

`match` 选择节点，`renderChildren` 处理其子节点。`current`、`parents` 和 `render` 保留插槽需要的上下文。

`createElement(组件, 属性, ...子内容)` 创建渲染描述，可以传入普通 Svelte 组件、标签名或 `createTypeOfSlot` 创建的插槽。Fluxdown 将这些描述交给 Svelte 渲染，组件里的子内容仍通过 `children` snippet 使用。

## 匹配顺序

更小的 `priority` 更早匹配；相同优先级下，后面的 render 插件先匹配，因此自定义插件优先于预设。未匹配的节点继续由预设处理。

只想修改组件或交互时，使用 [Slot 插件](./slot.md) 更直接。要先修改 HAST 内容，使用 [Rehype 插件](../../core/plugins/rehype.mdx)。
