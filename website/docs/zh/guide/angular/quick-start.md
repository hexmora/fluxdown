---
title: Angular Markdown 渲染器
description: 在 Angular 项目中接入 Fluxdown 独立组件，渲染 Markdown 与流式文本。了解安装、模板输入，以及主题和插件的使用方式。
---

# Angular Markdown 渲染器快速开始 {#快速开始}

Fluxdown 为 Angular 提供独立组件。它基于同一个 Core，支持静态内容、流式修复、平滑输出和末尾效果，用主题与插件调整呈现方式。

## 安装

```bash
pnpm add @fluxdown/angular
```

项目需要 Angular 22。把组件加入 `imports`，在模板中传入 Markdown：

```ts
import { Component } from '@angular/core';
import { Fluxdown } from '@fluxdown/angular';

@Component({
  selector: 'app-article',
  imports: [Fluxdown],
  template: `<fluxdown [text]="text" />`,
})
export class Article {
  readonly text = '# Hello, Fluxdown\n\nLet the words unfold.';
}
```

> 组件内置样式，无需额外引入样式文件。`Fluxdown` 从 `@fluxdown/angular` 导入。

## 接收流式内容

`text` 始终是截至目前收到的完整文本。内容还在增长时传入 `streaming`，结束时改为 `false`：

```ts
import { Component, input } from '@angular/core';
import { Fluxdown } from '@fluxdown/angular';

@Component({
  selector: 'app-message',
  imports: [Fluxdown],
  template: `<fluxdown [text]="text()" [streaming]="pending()" />`,
})
export class Message {
  readonly text = input.required<string>();

  readonly pending = input(false);
}
```

Angular 会在输入更新时同步内容。网络请求和消息状态由应用管理，组件负责呈现。

## 选择规格

| 组件           | 入口                     | 选择器          | 用途                                         |
| -------------- | ------------------------ | --------------- | -------------------------------------------- |
| `Fluxdown`     | `@fluxdown/angular`      | `fluxdown`      | 完整预设，包含代码高亮、公式和图表。         |
| `FluxdownLite` | `@fluxdown/angular/lite` | `fluxdown-lite` | 基础 Markdown 与四种末尾效果，按需添加插件。 |
| `FluxdownRaw`  | `@fluxdown/angular/raw`  | `fluxdown-raw`  | 自行传入 `plugins`，决定全部能力。           |

完整列表见[插件矩阵](./plugins/matrix.mdx)。需要调整输出节奏，继续阅读[流式内容](./streaming.md)；需要调整外观，阅读[样式指南](./customization.md)。

[横向演示](../common/features/renderers.mdx)可对照 Angular 与其他渲染库的静态与流式表现。
