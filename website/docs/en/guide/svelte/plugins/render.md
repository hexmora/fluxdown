# Render plugins

Render plugins turn HAST nodes into Svelte render descriptions and select the slots used for each node. Slot plugins provide their appearance and interactions.

## Declare and use

This example renders paragraphs beginning with “Note:” through the blockquote slot, leaving other paragraphs unchanged:

```ts title="plugins.ts"
import type {
  SvelteRenderMatchParams,
  SvelteRenderParams,
} from '@fluxdown/svelte-plugins/base';

import {
  BaseSvelteRenderPlugin,
  createElement,
  createTypeOfSlot,
  isElementWithTag,
} from '@fluxdown/svelte-plugins/base';

const Blockquote = /*#__PURE__*/ createTypeOfSlot('Blockquote');

const Paragraph = /*#__PURE__*/ createTypeOfSlot('Paragraph');

export class NoteRenderPlugin extends BaseSvelteRenderPlugin {
  static readonly key = 'render-note';

  match({ node }: SvelteRenderMatchParams) {
    if (!isElementWithTag(node, 'p')) {
      return false;
    }

    const first = node.children[0];

    return first?.type === 'text' && first.value.startsWith('Note:');
  }

  render({ node, parents, render, renderChildren }: SvelteRenderParams) {
    if (!isElementWithTag(node, 'p')) {
      return null;
    }

    const props = { current: node, parents, render };

    return createElement(
      Blockquote,
      props,
      createElement(
        Paragraph,
        { ...props, style: 'margin-top: 0; margin-bottom: 0' },
        renderChildren(node),
      ),
    );
  }
}
```

```svelte
<script lang="ts">
  import { Fluxdown } from '@fluxdown/svelte';

  import { NoteRenderPlugin } from './plugins';
</script>

<Fluxdown
  plugins={{ renders: [NoteRenderPlugin] }}
  text="Note: save your changes before leaving."
/>
```

> Import the base, parameter types, `createElement` and `createTypeOfSlot` from `@fluxdown/svelte-plugins/base`. Install `@fluxdown/svelte-plugins` first.

`match` selects a node, and `renderChildren` processes its children. `current`, `parents` and `render` preserve the context needed by slots.

`createElement(component, props, ...children)` creates a render description. It accepts an ordinary Svelte component, a tag name or a slot from `createTypeOfSlot`. Fluxdown renders these descriptions through Svelte; components receive nested content through a `children` snippet.

## Matching order

Lower `priority` values match earlier. At equal priority, later render plugins match first, so custom plugins take precedence over the preset. Unmatched nodes continue through the preset.

Use [slot plugins](./slot.md) when you only need to change a component or its interactions. Use [rehype plugins](../../core/plugins/rehype.mdx) to transform HAST first.
