# Render 插件

Render 插件把 HAST 节点转换为 Angular 渲染描述，决定哪些内容交给哪个插槽。样式和交互由 slot 插件负责。

## 声明与使用

下面把以“Note:”开头的段落交给引用块插槽，其余段落保持原样：

```ts
import type {
  AngularRenderMatchParams,
  AngularRenderParams,
} from '@fluxdown/angular-plugins/typings';

import {
  BaseAngularRenderPlugin,
  createTypeOfSlot,
  isElementWithTag,
} from '@fluxdown/angular-plugins/base';

const Blockquote = /*#__PURE__*/ createTypeOfSlot('Blockquote');

const Paragraph = /*#__PURE__*/ createTypeOfSlot('Paragraph');

export class NoteRenderPlugin extends BaseAngularRenderPlugin {
  static readonly key = 'render-note';

  match({ node }: AngularRenderMatchParams) {
    if (!isElementWithTag(node, 'p')) {
      return false;
    }

    const first = node.children[0];

    return first?.type === 'text' && first.value.startsWith('Note:');
  }

  render({ node, parents, render, renderChildren }: AngularRenderParams) {
    if (!isElementWithTag(node, 'p')) {
      return null;
    }

    const props = { current: node, parents, render };

    return Blockquote({
      ...props,
      children: Paragraph({
        ...props,
        style: { marginTop: 0, marginBottom: 0 },
        children: renderChildren(node),
      }),
    });
  }
}
```

```ts
import { Component } from '@angular/core';
import { Fluxdown } from '@fluxdown/angular';

import { NoteRenderPlugin } from './plugins';

@Component({
  selector: 'app-message',
  imports: [Fluxdown],
  template: `<fluxdown
    [plugins]="plugins"
    text="Note: save your changes before leaving."
  />`,
})
export class Message {
  readonly plugins = { renders: [NoteRenderPlugin] };
}
```

> 基类、`createTypeOfSlot` 和 HAST 工具从 `@fluxdown/angular-plugins/base` 导入；参数类型从 `@fluxdown/angular-plugins/typings` 导入。使用前安装 `@fluxdown/angular-plugins`。

`match` 选择节点，`renderChildren` 处理其子节点。`current`、`parents` 和 `render` 保留插槽需要的上下文。`createTypeOfSlot` 创建的函数接受属性并返回插槽描述，子内容放在 `children` 中。

## 渲染内容

除插槽外，render 也可以返回字符串、数组或空值。需要其他内容时，可以创建以下描述：

| 工具                                             | 用途                                                |
| ------------------------------------------------ | --------------------------------------------------- |
| `createElement(tagName, props, children)`        | 创建一个标签及其子内容。                            |
| `createComponentNode(Component, props, options)` | 渲染 Angular 组件，将属性传给组件的 `props` input。 |
| `createTemplateNode(template, context, key?)`    | 渲染 `TemplateRef`，通过 context 传入模板变量。     |

> 三个工具都从 `@fluxdown/angular-plugins/base` 导入；返回值类型 `AngularRenderNode` 从 `@fluxdown/angular-plugins/typings` 导入。

组件通过 `ng-content` 接收投影的子内容。模板仍使用 Angular 的 `let-` 变量和依赖注入。给同级、可移动的描述设置稳定 `key`，可以保留组件与模板的状态。

## 匹配顺序

更小的 `priority` 更早匹配；相同优先级下，后面的 render 插件先匹配，因此自定义插件优先于预设。未匹配的节点继续由预设处理。

只想修改组件或交互时，使用 [Slot 插件](./slot.md) 更直接。要先修改 HAST 内容，使用 [Rehype 插件](../../core/plugins/rehype.mdx)。
