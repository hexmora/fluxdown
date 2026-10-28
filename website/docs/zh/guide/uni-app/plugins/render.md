# Render 插件

Render 插件把 HAST 节点转换为 uni-app 渲染描述。描述中保存插槽名称、props 与子节点，由 `.uvue` 组件负责展示。只改变视觉样式时，优先使用 [Slot 插件](./slot.md)。

## 匹配与渲染

下面把引用节点交给 `Blockquote` 插槽：

```ts title="plugins/quote/render.ts"
import type {
  UniRenderMatchParams,
  UniRenderParams,
} from '@fluxdown/uni-app-plugins/base';

import {
  BaseUniRenderPlugin,
  createTypeOfSlot,
  isElementWithTag,
} from '@fluxdown/uni-app-plugins/base';

const Blockquote = /*#__PURE__*/ createTypeOfSlot('Blockquote');

export class QuoteRenderPlugin extends BaseUniRenderPlugin {
  static readonly key = 'render-custom-quote';

  match({ node }: UniRenderMatchParams) {
    return isElementWithTag(node, 'blockquote');
  }

  render({ node, getProps, renderChildren }: UniRenderParams) {
    if (!isElementWithTag(node, 'blockquote')) {
      return null;
    }

    return Blockquote(getProps(node), renderChildren(node));
  }
}
```

> `BaseUniRenderPlugin`、`createTypeOfSlot`、节点判断工具与 render 参数类型从 `@fluxdown/uni-app-plugins/base` 导入。

`match` 决定是否处理当前节点；`renderChildren` 继续渲染子节点。`getProps` 保留节点附带的属性。`createTypeOfSlot` 返回可直接调用的描述构造函数，不创建组件实例。

## 注册插件

```ts
import type { IPluginItem } from '@fluxdown/uni-app-plugins/typings';

import { QuoteRenderPlugin } from './render';

export const QuotePlugin: IPluginItem = {
  renders: [QuoteRenderPlugin],
};
```

将 `QuotePlugin` 传入组件的 `plugins`。Full 和 Lite 已提供 `Blockquote` 插槽；Raw 需要显式加入所需的 slot 插件。

## 返回值

`render` 可以返回文字、数字、`null`、上述内容的数组，或插槽描述。需要直接展示自己的 `.uvue` 组件时，返回 `{ component, props, key? }`：

```ts
return {
  component: Citation,
  props: { label: 'Reference' },
};
```

> `Citation` 是应用自己的 `.uvue` 组件。返回值类型 `UniRenderNode` 从 `@fluxdown/uni-app-plugins/typings` 导入。

相同优先级下，后注册的 render 先匹配；`priority` 数值较小的插件先处理。把相关 render、slot 与解析能力组合在一起，见[综合插件](./aggregate.md)。
