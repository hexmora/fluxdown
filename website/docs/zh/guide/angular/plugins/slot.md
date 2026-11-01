# Slot 插件

Slot 插件负责渲染插槽。代码块、链接、标题等内容已经准备好，你只需要决定它们的组件和交互。

## 声明与使用

下面通过一个独立 Angular 组件隐藏代码工具栏，保留默认高亮和代码样式：

```ts
import type { CodeBlockProps } from '@fluxdown/angular-plugins/typings';

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { BaseSlotPlugin, RenderOutlet } from '@fluxdown/angular-plugins/base';

@Component({
  selector: 'app-compact-code-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RenderOutlet],
  template: `<ng-container [fluxdownRender]="content()" />`,
  host: { style: 'display: contents' },
})
export class CompactCodeBlock {
  readonly props = input.required<CodeBlockProps>();

  protected readonly content = computed(() => {
    const { Raw, ...props } = this.props();

    return Raw?.({ ...props, showHeader: false });
  });
}

export class CompactCodeBlockPlugin extends BaseSlotPlugin<'CodeBlock'> {
  static readonly key = 'compact-code-block';

  readonly type = 'CodeBlock';

  readonly Component = CompactCodeBlock;
}
```

```ts
import { Component, input } from '@angular/core';
import { Fluxdown } from '@fluxdown/angular';

import { CompactCodeBlockPlugin } from './plugins';

@Component({
  selector: 'app-message',
  imports: [Fluxdown],
  template: `<fluxdown [plugins]="plugins" [text]="text()" />`,
})
export class Message {
  readonly text = input.required<string>();

  readonly plugins = { slots: [CompactCodeBlockPlugin] };
}
```

> `BaseSlotPlugin` 和 `RenderOutlet` 从 `@fluxdown/angular-plugins/base` 导入；`CodeBlockProps` 等插槽类型从 `@fluxdown/angular-plugins/typings` 导入。先安装 `@fluxdown/angular-plugins`。

`key` 标识插件，`type` 选择插槽，`Component` 指向 Angular 组件。每个插槽组件通过 `props = input.required<对应类型>()` 接收属性，Fluxdown 管理它的创建、更新和销毁。

## 保留默认功能

`Raw` 是前一个插件提供的渲染函数。调用 `Raw(props)` 保留已有的高亮或排版，修改传入属性即可调整其中一部分，再通过 `[fluxdownRender]` 呈现返回值。

相同优先级下，同一插槽后面的插件通过 `Raw` 包裹前面的组件。`Raw` 可能为 `null`，调用前需要检查。

## 替换组件

直接编写自己的模板即可替换默认呈现。有子内容的插槽使用 `ng-content`，`tagName` 指定组件实际使用的标签：

```ts
import type { BlockquoteProps } from '@fluxdown/angular-plugins/typings';

import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BaseSlotPlugin } from '@fluxdown/angular-plugins/base';

@Component({
  selector: 'app-callout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: { class: 'callout' },
  styles: `
    :host {
      border-inline-start: 3px solid #3b9189;
      padding-inline-start: 16px;
    }
  `,
})
export class Callout {
  readonly props = input.required<BlockquoteProps>();
}

export class CalloutPlugin extends BaseSlotPlugin<'Blockquote'> {
  static readonly key = 'slot-callout';

  readonly type = 'Blockquote';

  readonly Component = Callout;

  override readonly tagName = 'blockquote';
}
```

把 `CalloutPlugin` 加入 `plugins.slots` 后，引用块将使用这个组件。需要交互时，直接使用 Angular 的事件绑定与依赖注入。
