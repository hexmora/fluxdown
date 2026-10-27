# Render plugins

Render plugins turn HAST nodes into slots, choosing which component handles the content. Slot plugins provide the appearance and interactions.

## Declare and use a plugin

This example sends paragraphs starting with “Note:” to the blockquote slot, leaving other paragraphs unchanged:

```ts
import type {
  VueRenderMatchParams,
  VueRenderParams,
} from '@fluxdown/vue-plugins/base';

import {
  BaseVueRenderPlugin,
  createTypeOfSlot,
  isElementWithTag,
} from '@fluxdown/vue-plugins/base';
import { h } from 'vue';

const Blockquote = /*#__PURE__*/ createTypeOfSlot('Blockquote');

export class NoteRenderPlugin extends BaseVueRenderPlugin {
  static readonly key = 'render-note';

  match({ node }: VueRenderMatchParams) {
    if (!isElementWithTag(node, 'p')) {
      return false;
    }

    const first = node.children[0];

    return first?.type === 'text' && first.value.startsWith('Note:');
  }

  render({ node, parents, render, renderChildren }: VueRenderParams) {
    if (!isElementWithTag(node, 'p')) {
      return null;
    }

    return h(
      Blockquote,
      { current: node, parents, render },
      { default: () => renderChildren(node) },
    );
  }
}
```

Use it in a single-file component:

```vue
<script setup lang="ts">
import { Fluxdown } from '@fluxdown/vue';

import { NoteRenderPlugin } from './plugins/note';

const plugins = { renders: [NoteRenderPlugin] };
</script>

<template>
  <Fluxdown text="Note: save your changes." :plugins="plugins" />
</template>
```

> Import the base class, parameter types and `createTypeOfSlot` from `@fluxdown/vue-plugins/base`. Install `@fluxdown/vue-plugins` first.

`match` selects nodes, and `renderChildren` renders their children. `current`, `parents` and `render` preserve the slot's context. This example uses Vue's `h`; a project configured for Vue JSX can return JSX instead.

## Matching order

A lower `priority` matches earlier. At the same priority, later render plugins match first, so custom plugins take precedence over presets. Other nodes continue through the preset renderers.

Use [Slot plugins](./slot.md) when you only need to change a component or interaction. Use [Rehype plugins](../../core/plugins/rehype.mdx) to transform HAST first.
