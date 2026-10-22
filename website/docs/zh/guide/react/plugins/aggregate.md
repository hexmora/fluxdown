# 聚合插件

聚合插件用 `IPluginItem` 把一个功能需要的 slot、render 和 Core 插件放在一起。应用只需传入一个对象，就能启用整套能力。

## 声明与使用

各列表都可省略，例如把引用块的渲染与组件组合起来：

```tsx
import type { IPluginItem } from '@fluxdown/react-presets/typings';

import {
  BlockquoteRenderPlugin,
  BlockquoteSlotPlugin,
} from '@fluxdown/react-presets/plugins/blockquote';
import { Fluxdown } from 'fluxdown';

export const QuotePlugin: IPluginItem = {
  renders: [BlockquoteRenderPlugin],
  slots: [BlockquoteSlotPlugin],
};

export function Message({ text }: { text: string }) {
  return <Fluxdown plugins={QuotePlugin} text={text} />;
}
```

> `IPluginItem` 从 `@fluxdown/react-presets/typings` 导入。

还可加入 `remarks`、`rehypes`、`repairs` 和 `mappers`。编写其中的 React 插件时，分别继承 `BaseSlotPlugin` 或 `BaseReactRenderPlugin`，具体见 [Slot 插件](./slot.md)和 [Render 插件](./render.md)。

## 派生与配置

`pluginExtends` 接收两个或更多聚合插件，返回一个 `IPluginItem`。先传基础插件，再追加需要覆盖的能力。例如，派生一个隐藏代码工具栏的插件：

```tsx
import { pluginExtends } from '@fluxdown/react-presets/base';
import {
  CodeHeaderSlotPlugin,
  CodePlugin,
} from '@fluxdown/react-presets/plugins/code';
import { FluxdownLite } from 'fluxdown/lite';

export const CompactCodePlugin = /*#__PURE__*/ pluginExtends(CodePlugin, {
  slots: [CodeHeaderSlotPlugin],
  config: {
    'slot-code-header': { disabled: true },
  },
});

export function Message({ text }: { text: string }) {
  return <FluxdownLite plugins={CompactCodePlugin} text={text} />;
}
```

> `pluginExtends` 从 `@fluxdown/react-presets/base` 导入。

`config` 只配置当前对象列表中的插件，按插件的 `key` 匹配；它会覆盖列表项 `[Plugin, options]` 中的同名选项。上例显式列出 `CodeHeaderSlotPlugin`，关闭继承的工具栏，保留代码容器和源码显示。

相同 `priority` 下，后传入的 render 先匹配；后传入的 slot 位于 `Raw` 链的外层，可以包裹或替换之前的组件。不同 `priority` 仍按数值从小到大处理。直接传入 `plugins={[FirstPlugin, SecondPlugin]}` 也使用相同顺序。
