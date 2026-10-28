# 综合插件

综合插件用 `IPluginItem` 把一个功能需要的 slot、render 与 Core 插件放在一起。应用只需传入一个对象，就能启用整套能力。

## 声明与使用

各列表都可省略，例如组合引用块的渲染与插槽：

```ts
import type { IPluginItem } from '@fluxdown/solid-plugins/typings';

import {
  BlockquoteRenderPlugin,
  BlockquoteSlotPlugin,
} from '@fluxdown/solid-plugins/plugins/blockquote';

export const QuotePlugin: IPluginItem = {
  renders: [BlockquoteRenderPlugin],
  slots: [BlockquoteSlotPlugin],
};
```

> `IPluginItem` 从 `@fluxdown/solid-plugins/typings` 导入。内置 render 和 slot 从对应插件的子路径导入。

然后传给组件：

```tsx
import { Fluxdown } from '@fluxdown/solid';

import { QuotePlugin } from './plugins/quote';

type MessageProps = {
  text: string;
};

export function Message(props: MessageProps) {
  return <Fluxdown text={props.text} plugins={QuotePlugin} />;
}
```

还可加入 `remarks`、`rehypes`、`repairs` 和 `mappers`。自定义界面插件分别继承 `BaseSlotPlugin` 或 `BaseSolidRenderPlugin`，具体见 [Slot 插件](./slot.md)和 [Render 插件](./render.md)。

## 派生与配置

`pluginExtends` 接收两个或更多综合插件。先传基础插件，再追加需要覆盖的能力。例如，派生一个隐藏代码工具栏的插件：

```ts
import { pluginExtends } from '@fluxdown/solid-plugins/base';
import {
  CodeHeaderSlotPlugin,
  CodePlugin,
} from '@fluxdown/solid-plugins/plugins/code';

export const CompactCodePlugin = /*#__PURE__*/ pluginExtends(CodePlugin, {
  slots: [CodeHeaderSlotPlugin],
  config: {
    'slot-code-header': { disabled: true },
  },
});
```

> `pluginExtends` 从 `@fluxdown/solid-plugins/base` 导入。

把 `CompactCodePlugin` 传入 `FluxdownLite` 的 `plugins` 即可。`config` 只配置当前对象列表中的插件，按插件 `key` 匹配，并覆盖 `[Plugin, options]` 中的同名选项。上例显式列出 `CodeHeaderSlotPlugin`，关闭继承的工具栏，保留代码容器和源码显示。

`priority` 数值越小越早处理。相同优先级下，后传入的 render 先匹配；后传入的 slot 位于 `Raw` 链外层，可以包裹或替换之前的组件。使用 `plugins={[FirstPlugin, SecondPlugin]}` 也遵循相同顺序。
