# Render plugins

Render plugins turn HAST nodes into slots, choosing which component handles the content. Slot plugins provide the appearance and interactions.

## Declare and use a plugin

This example sends paragraphs starting with “Note:” to the blockquote slot, leaving other paragraphs unchanged. Save the plugin in a `.tsx` module:

```tsx
import type {
  SolidRenderMatchParams,
  SolidRenderParams,
} from '@fluxdown/solid-plugins/base';

import {
  BaseSolidRenderPlugin,
  createTypeOfSlot,
  isElementWithTag,
} from '@fluxdown/solid-plugins/base';

const Blockquote = /*#__PURE__*/ createTypeOfSlot('Blockquote');

export class NoteRenderPlugin extends BaseSolidRenderPlugin {
  static readonly key = 'render-note';

  match({ node }: SolidRenderMatchParams) {
    if (!isElementWithTag(node, 'p')) {
      return false;
    }

    const first = node.children[0];

    return first?.type === 'text' && first.value.startsWith('Note:');
  }

  render(props: SolidRenderParams) {
    return (
      <Blockquote
        current={props.node}
        parents={props.parents}
        render={props.render}
      >
        {props.renderChildren()}
      </Blockquote>
    );
  }
}
```

Use the plugin in a component:

```tsx
import { Fluxdown } from '@fluxdown/solid';

import { NoteRenderPlugin } from './plugins/note';

const plugins = { renders: [NoteRenderPlugin] };

export function Article() {
  return <Fluxdown text="Note: save your changes." plugins={plugins} />;
}
```

> Import the base class, parameter types and `createTypeOfSlot` from `@fluxdown/solid-plugins/base`. Install `@fluxdown/solid-plugins` first.

`match` selects nodes. `renderChildren()` renders the current node's children, while `current`, `parents` and `render` preserve the slot's context. Read changing fields through `props` inside JSX so Solid can update the mounted content as more text arrives.

For an element node, `props.getProps(node)` converts its HAST properties into Solid attributes. Spread those attributes onto your slot when you want to preserve them. `render` and `renderChildren` also accept an accessor when rendering a changing node explicitly.

## Matching order

A lower `priority` matches earlier. At the same priority, later render plugins match first, so custom plugins take precedence over presets. Other nodes continue through the preset renderers.

Use [Slot plugins](./slot.md) when you only need to change a component or interaction. Use [Rehype plugins](../../core/plugins/rehype.mdx) to transform HAST first.
