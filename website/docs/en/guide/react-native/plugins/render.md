# Render plugins

Render plugins turn HAST nodes into slots. They choose which nodes use each slot and what content to pass along; slot plugins still provide the components.

## Declare and use a plugin

This example sends ordinary paragraphs starting with “Note:” to the blockquote slot, leaving other paragraphs unchanged:

```tsx
import type {
  ReactRenderMatchParams,
  ReactRenderParams,
} from '@fluxdown/react-native-plugins/base';

import {
  BaseReactRenderPlugin,
  createTypeOfSlot,
  isElementWithTag,
} from '@fluxdown/react-native-plugins/base';
import { Fluxdown } from '@fluxdown/react-native';

const Blockquote = createTypeOfSlot('Blockquote');

class NoteRenderPlugin extends BaseReactRenderPlugin {
  static readonly key = 'render-note';

  match({ node }: ReactRenderMatchParams) {
    if (!isElementWithTag(node, 'p')) {
      return false;
    }

    const first = node.children[0];

    return first?.type === 'text' && first.value.startsWith('Note:');
  }

  render({ node, parents, render, renderChildren }: ReactRenderParams) {
    if (!isElementWithTag(node, 'p')) {
      return null;
    }

    return (
      <Blockquote current={node} parents={parents} render={render}>
        {renderChildren(node)}
      </Blockquote>
    );
  }
}

export function Note() {
  return (
    <Fluxdown
      plugins={{ renders: [NoteRenderPlugin] }}
      text="Note: Save your changes."
    />
  );
}
```

`match` selects nodes, and `render` passes their content to a slot. `renderChildren` renders child nodes; `current`, `parents`, and `render` preserve the context the slot needs.

Lower `priority` values match first. With equal priorities, later render plugins match first, so this custom plugin takes precedence over the preset. Presets continue to handle unmatched nodes.

> This example requires `pnpm add @fluxdown/react-native-plugins`.

For component, style, or interaction changes, use a [slot plugin](./slot.md). To change HAST content before rendering, use a [rehype plugin](../../core/plugins/rehype.mdx).
