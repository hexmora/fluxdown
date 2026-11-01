# Render plugins

Render plugins convert HAST nodes into Angular rendering descriptions and choose which slot handles each node. Slot plugins provide the styling and interactions.

## Declare and use

This example sends paragraphs starting with “Note:” to the blockquote slot, leaving other paragraphs unchanged:

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

> Import the base class, `createTypeOfSlot`, and HAST helpers from `@fluxdown/angular-plugins/base`. Import parameter types from `@fluxdown/angular-plugins/typings`. Install `@fluxdown/angular-plugins` first.

`match` selects nodes and `renderChildren` handles their children. `current`, `parents`, and `render` preserve the slot's context. A function created by `createTypeOfSlot` accepts props and returns a slot description; pass child content through `children`.

## Render content

A render plugin can also return strings, arrays, or empty values. These helpers describe other content:

| Helper                                           | Purpose                                                                |
| ------------------------------------------------ | ---------------------------------------------------------------------- |
| `createElement(tagName, props, children)`        | Creates a tag with child content.                                      |
| `createComponentNode(Component, props, options)` | Renders an Angular component, passing properties to its `props` input. |
| `createTemplateNode(template, context, key?)`    | Renders a `TemplateRef` with template variables supplied by context.   |

> Import all three helpers from `@fluxdown/angular-plugins/base`, and the `AngularRenderNode` return type from `@fluxdown/angular-plugins/typings`.

Components receive projected children through `ng-content`. Templates retain Angular's `let-` variables and dependency injection. A stable `key` lets movable sibling descriptions preserve component or template state.

## Matching order

Lower `priority` values match first. With equal priority, later render plugins match first, so custom plugins override presets. Unmatched nodes continue through the preset.

Use [slot plugins](./slot.md) when only a component or interaction needs to change. Use [rehype plugins](../../core/plugins/rehype.mdx) to transform HAST first.
