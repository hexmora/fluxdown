# 综合插件

综合插件用 `IPluginItem` 把一个功能需要的 slot、render 和 Core 插件放在一起。应用只需传入一个对象，就能启用整套能力。

## 声明与使用

各列表都可省略，例如组合引用块的渲染与插槽：

```tsx
import type { IPluginItem } from '@fluxdown/lynx-plugins/typings';

import { Fluxdown } from '@fluxdown/lynx';
import {
  BlockquoteRenderPlugin,
  BlockquoteSlotPlugin,
} from '@fluxdown/lynx-plugins/plugins/blockquote';

export const QuotePlugin: IPluginItem = {
  renders: [BlockquoteRenderPlugin],
  slots: [BlockquoteSlotPlugin],
};

type MessageProps = {
  text: string;
};

export function Message({ text }: MessageProps) {
  return <Fluxdown plugins={QuotePlugin} text={text} />;
}
```

> `IPluginItem` 从 `@fluxdown/lynx-plugins/typings` 导入。内置 render 和 slot 从对应插件的子路径导入。

还可加入 `remarks`、`rehypes`、`repairs` 和 `mappers`。编写自己的界面插件时，分别继承 `BaseSlotPlugin` 或 `BaseLynxRenderPlugin`，具体见 [Slot 插件](./slot.md)和 [Render 插件](./render.md)。

## 派生与配置

`pluginExtends` 接收两个或更多综合插件。先传基础插件，再追加需要覆盖的能力。例如，派生一个隐藏代码工具栏的插件：

```tsx
import { FluxdownLite } from '@fluxdown/lynx/lite';
import { pluginExtends } from '@fluxdown/lynx-plugins/base';
import {
  CodeHeaderSlotPlugin,
  CodePlugin,
} from '@fluxdown/lynx-plugins/plugins/code';

export const CompactCodePlugin = /*#__PURE__*/ pluginExtends(CodePlugin, {
  slots: [CodeHeaderSlotPlugin],
  config: {
    'slot-code-header': { disabled: true },
  },
});

type MessageProps = {
  text: string;
};

export function Message({ text }: MessageProps) {
  return <FluxdownLite plugins={CompactCodePlugin} text={text} />;
}
```

> `pluginExtends` 从 `@fluxdown/lynx-plugins/base` 导入。

`config` 只配置当前对象列表中的插件，按插件的 `key` 匹配。它会覆盖 `[Plugin, options]` 中的同名选项。上例显式列出 `CodeHeaderSlotPlugin`，关闭继承的工具栏，保留代码容器和源码显示。

`priority` 数值越小越早处理。相同优先级下，后传入的 render 先匹配；后传入的 slot 位于 `Raw` 链的外层，可以包裹或替换之前的组件。直接传入 `plugins={[FirstPlugin, SecondPlugin]}` 也使用相同顺序。
