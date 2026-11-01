# 样式指南

主题控制 Markdown 的颜色、字体和间距，外层容器负责布局。需要改变组件或交互时，使用 [Slot 插件](./plugins/slot.md)。

## 跟随应用主题

```html
<fluxdown [text]="text()" [theme]="dark() ? 'dark' : 'light'" />
```

> 默认主题为 `light`，不会自动跟随系统。传入应用已有的主题状态即可。

## 调整字体与颜色

以预设为起点，只覆盖需要改变的 token：

```ts
import type { Theme } from '@fluxdown/angular';

import { Component, input } from '@angular/core';
import { Fluxdown } from '@fluxdown/angular';

@Component({
  selector: 'app-article',
  imports: [Fluxdown],
  template: `<fluxdown [text]="text()" [theme]="theme" />`,
})
export class Article {
  readonly text = input.required<string>();

  readonly theme: Theme = [
    'dark',
    {
      tokens: {
        colors: { accent: '#82d8cf' },
        typography: { fontSans: 'Inter, sans-serif', fontSize: { md: '16px' } },
      },
    },
  ];
}
```

> `Theme`、`ThemeTokens` 和 `PartialThemeConfig` 从 `@fluxdown/angular` 导入。

也可以直接传 token 配置对象，未指定的值继承浅色主题。主题覆盖会作用于标题、段落、代码、表格等内置组件，完整字段见[自定义配置](./configuration.md#theme)。

## 布局与间距

用应用的容器控制宽度和页面间距：

```html
<article class="message-body" style="max-width: 72ch; margin-inline: auto">
  <fluxdown [text]="text()" />
</article>
```

内容内部的排版优先使用主题。改变链接行为、代码工具栏或替换某个组件时，再通过插件扩展。

## 对比呈现

[横向演示](../common/features/renderers.mdx)使用同一份内容和流式参数，可以选择 Angular 与其他渲染库对照。
