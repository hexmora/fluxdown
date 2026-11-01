# 自定义配置

本页列出 Angular 组件的公开 inputs。除 `text` 外，顶层属性均可省略；`FluxdownRaw` 还需要显式传入 `plugins`。Full、Lite 和 Raw 的其他字段一致。

> `BaseBuildConfig`、`StreamingConfig`、`SmoothConfig`、`EffectItem`、`Theme` 和 `FluxdownRef` 从 `@fluxdown/angular` 导入；`IPluginItem` 和 `AngularRenderNode` 从 `@fluxdown/angular-plugins/typings` 导入。

## text {#text}

**类型:** `string` · **必选**

当前完整的 Markdown。收到新片段时，传入累积后的内容，不要只传最后一个片段。

```html
<fluxdown [text]="text()" />
```

## streaming {#streaming}

**类型:** `boolean | StreamingConfig` · **默认值:** `false`

`true` 开启末尾语法修复、平滑输出和默认 `scale` 动画；`false` 关闭流式行为。传对象可以分别调整各项：

```html
<fluxdown
  [text]="text()"
  [streaming]="{ repairEnding: true, smooth: true, effect: 'scale' }"
/>
```

连接数据源与结束流的示例见[流式内容](./streaming.md)。

### streaming.repairEnding {#streamingrepairending}

**类型:** `boolean` · **默认值:** `true`

修复仍在生成的末尾语法。设置为 `false` 只关闭末尾修复；`build.repair: false` 则关闭全部修复。

### streaming.smooth {#streamingsmooth}

**类型:** `boolean | SmoothConfig` · **默认值:** `true`

让新增内容逐步显示。`true` 使用内置弹簧调度；`false` 直接显示已收到的内容。传对象可以指定时钟和调度方式：

```html
<fluxdown
  [text]="text()"
  [streaming]="{
    smooth: { enabled: true, ticker: 'raf', scheduler: 'spring' },
  }"
/>
```

### smooth.enabled {#smoothenabled}

**类型:** `boolean` · **默认值:** `false`

使用 `smooth` 对象时，显式设为 `true` 开启平滑输出。

### smooth.ticker {#smoothticker}

**类型:** `'raf' | 'interval' | SmoothTickerClass` · **对象形式必选**

`raf` 跟随动画帧，`interval` 使用定时器，也可以传自定义时钟类。

### smooth.scheduler {#smoothscheduler}

**类型:** `'spring' | SmoothSchedulerClass` · **对象形式必选**

决定每次更新显示多少内容。`spring` 使用内置弹簧调度，也可以传自定义调度类。

> `SmoothTickerClass` 和 `SmoothSchedulerClass` 从 `@fluxdown/core-plugins/plugins/mapper/smooth` 导入。通常使用 `smooth: true` 即可。

### streaming.effect {#streamingeffect}

**类型:** `boolean | EffectItem | EffectItem[]` · **默认值:** `'scale'`

选择 `scale`、`shad`、`chunk`、`suffix`，或用数组组合效果。`true` 使用默认效果，`false` 关闭动画。效果参数与演示见[动画效果](../common/streaming-effects/animation/index.mdx)。

> 效果配置类型从对应的 mapper 子路径导入，例如 `ScaleConfig` 来自 `@fluxdown/core-plugins/plugins/mapper/scale`。

## build {#build}

**类型:** `BaseBuildConfig` · **默认值:** `{}`

选择 Markdown 编译能力。表格、任务列表、删除线、自动链接和普通换行默认可用。以下字段均可省略：

| 字段                     | 默认值   | 用途                                     |
| ------------------------ | -------- | ---------------------------------------- |
| `repair: boolean`        | `true`   | 启用语法修复。                           |
| `footnote: boolean`      | `false`  | 解析脚注，生成引用与回跳链接。           |
| `tex: boolean`           | `false`  | 解析行内与块级公式。                     |
| `indentedCode: boolean`  | `false`  | 解析缩进代码块；围栏代码块无需开启此项。 |
| `setextHeading: boolean` | `false`  | 解析用 `===` 或 `---` 作下划线的标题。   |
| `idPrefix: string`       | 自动生成 | 为脚注 ID 指定命名空间。                 |

```html
<fluxdown [text]="text()" [build]="{ tex: true, footnote: true }" />
```

> 通常无需设置 `idPrefix`。手动设置时，为不同实例提供不同值，避免脚注互相跳转。

Markdown 内的 HTML 会经过标签检查与清理，默认允许 `span`、`u`、`br`、`em` 和 `a`。调整方式见 [Rehype 插件](../core/plugins/rehype.mdx)。

## theme {#theme}

**类型:** `Theme` · **默认值:** `'light'`

支持三种形式：

- `'light'` 或 `'dark'`：使用内置主题。
- `PartialThemeConfig`：在浅色主题上覆盖 token。
- `['light' | 'dark', PartialThemeConfig]`：在指定主题上覆盖 token。

| 分组                   | 可调整的内容                            |
| ---------------------- | --------------------------------------- |
| `colors`               | 文字、背景、边框、强调色与交互状态。    |
| `typography`           | 正文与等宽字体、字号、字重和行高。      |
| `heading`              | `h1` 至 `h6` 的字号、字重、行高和间距。 |
| `paragraph`、`code`    | 段落间距、代码字号与行高。              |
| `inlineCode`           | 行内代码的字体、背景、边框和内边距。    |
| `divider`、`footnotes` | 分隔线和脚注区域的排版。                |
| `syntax`               | 代码高亮颜色。                          |
| `radius`、`spacing`    | 共用圆角与间距。                        |

> `ThemeTokens` 和 `PartialThemeConfig` 从 `@fluxdown/angular` 导入。完整例子见[样式指南](./customization.md)。

## plugins {#plugins}

**类型:** `IPluginItem | IPluginItem[]` · **默认值:** `[]`

Full 和 Lite 合并预设与传入的插件，后传入的优先级更高。Raw 的此参数必填。每个对象表示一个插件包：

| 字段      | 用途                            |
| --------- | ------------------------------- |
| `slots`   | 渲染插槽的 Angular 组件。       |
| `renders` | 将 HAST 转为渲染描述。          |
| `remarks` | 解析 Markdown 语法。            |
| `rehypes` | 对 HAST 做二次处理。            |
| `repairs` | 处理与修复 Markdown AST。       |
| `mappers` | 响应式映射 HAST。               |
| `config`  | 按 `key` 配置当前包列出的插件。 |

列表项可以是插件，也可以是 `[插件, 选项]`。`disabled: true` 停用插件，`priority` 越小越早执行。声明、组合与配置方式见[使用与编写插件](./plugins.md)。

## patches {#patches}

**类型:** `IPatchItem<AngularRenderNode>[]` · **默认值:** `[]`

用自定义内容替换指定文本，或在某个位置插入内容。适合把提及、引用等文本变成可交互元素：

```ts
import type { AngularRenderNode } from '@fluxdown/angular-plugins/typings';
import type { IPatchItem } from '@fluxdown/core';

import { Component } from '@angular/core';
import { Fluxdown } from '@fluxdown/angular';
import { createElement } from '@fluxdown/angular-plugins/base';

@Component({
  selector: 'app-message',
  imports: [Fluxdown],
  template: `<fluxdown [patches]="patches" text="欢迎，@Ada。" />`,
})
export class Message {
  readonly patches: IPatchItem<AngularRenderNode>[] = [
    {
      key: 'person-ada',
      range: [3, 7],
      render: () => {
        return createElement('a', { href: '/people/ada' }, '@Ada');
      },
    },
  ];
}
```

> `IPatchItem` 从 `@fluxdown/core` 导入，`AngularRenderNode` 从 `@fluxdown/angular-plugins/typings` 导入，`createElement` 从 `@fluxdown/angular-plugins/base` 导入。

| 字段     | 类型与用途                                                                 |
| -------- | -------------------------------------------------------------------------- |
| `key`    | 可选 `string`，补丁的稳定标识。                                            |
| `range`  | `number` 在指定位置插入；`[number, number]` 替换区间，包含起点、不含终点。 |
| `render` | `(text?: string) => AngularRenderNode`，返回插入内容，可读取被替换的文本。 |

位置按原始字符串索引计算。区间需要落在同一个内容块内，避免跨段落或相互重叠。也可以用 `createComponentNode` 或 `createTemplateNode` 返回 Angular 组件与模板，见 [Render 插件](./plugins/render.md)。

## 组件引用 {#ref}

使用 Angular 的 `viewChild` 读取组件。初始化完成后，`value` 提供 Core 渲染结果的响应式句柄；普通展示不需要读取它：

```ts
import { afterNextRender, Component, viewChild } from '@angular/core';
import { Fluxdown } from '@fluxdown/angular';

@Component({
  selector: 'app-article',
  imports: [Fluxdown],
  template: `<fluxdown text="# Hello" />`,
})
export class Article {
  readonly content = viewChild.required(Fluxdown);

  constructor() {
    afterNextRender(() => {
      const nodes = this.content().value.value;

      console.log(nodes);
    });
  }
}
```

Fluxdown 会随组件销毁清理内部订阅。自己建立的订阅需要在应用中取消。容器布局和样式见[样式指南](./customization.md)。
