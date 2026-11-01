# Slot plugins

Slot plugins render prepared content such as code blocks, links, and headings. You choose their components and interactions.

## Declare and use

This standalone Angular component hides the code toolbar while keeping the existing highlighting and code styles:

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

> Import `BaseSlotPlugin` and `RenderOutlet` from `@fluxdown/angular-plugins/base`. Import slot types such as `CodeBlockProps` from `@fluxdown/angular-plugins/typings`. Install `@fluxdown/angular-plugins` first.

`key` identifies the plugin, `type` selects its slot, and `Component` references an Angular component. Each slot component receives properties through `readonly props = input.required<CodeBlockProps>()`. Fluxdown manages its creation, updates, and destruction.

## Keep existing behavior

`Raw` is the rendering function supplied by the previous plugin. Call `Raw(props)` to keep its highlighting or layout, changing only the properties you need. Render the result through `[fluxdownRender]`.

With equal priority, later plugins wrap earlier components through `Raw`. Check it before calling, as it may be `null`.

## Replace a component

Write your own template to replace the default presentation. Slots with children use `ng-content`; `tagName` selects the component's actual host tag:

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

Add `CalloutPlugin` to `plugins.slots` to use this component for blockquotes. Use ordinary Angular event bindings and dependency injection for interactions.
