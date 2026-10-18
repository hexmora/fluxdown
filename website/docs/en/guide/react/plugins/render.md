# Render plugins

Render plugins turn HAST nodes into slots. They choose which nodes use each slot and what content to pass along; slot plugins still provide the components.

React and React Native use the same render plugins from `@fluxdown/react-base-presets`. The example below uses the web component; for a native app, import `Fluxdown` from `@fluxdown/react-native`. Platform slots provide the actual elements, and `getProps` supplies the appropriate platform attributes.

## Declare and use a plugin

This example sends ordinary paragraphs starting with “Note:” to the blockquote slot, leaving other paragraphs unchanged:

```tsx
import type {
  ReactRenderMatchParams,
  ReactRenderParams,
} from '@fluxdown/react-base-presets/base';

import {
  BaseReactRenderPlugin,
  createTypeOfSlot,
  isElementWithTag,
} from '@fluxdown/react-base-presets/base';
import { Fluxdown } from 'fluxdown';

const Blockquote = createTypeOfSlot('Blockquote');

const Paragraph = createTypeOfSlot('Paragraph');

class NoteRenderPlugin extends BaseReactRenderPlugin {
  static readonly key = 'render-note';

  match({ node }: ReactRenderMatchParams) {
    if (!isElementWithTag(node, 'p')) {
      return false;
    }

    const first = node.children[0];

    return first?.type === 'text' && first.value.startsWith('Note:');
  }

  render({
    getProps,
    node,
    parents,
    render,
    renderChildren,
  }: ReactRenderParams) {
    if (!isElementWithTag(node, 'p')) {
      return null;
    }

    return (
      <Blockquote
        {...getProps(node)}
        current={node}
        parents={parents}
        render={render}
      >
        <Paragraph current={node} parents={parents} render={render}>
          {renderChildren(node)}
        </Paragraph>
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

`match` selects nodes, and `render` passes their content to a slot. `getProps` maps node attributes to platform props. `renderChildren` renders child nodes; `current`, `parents`, and `render` preserve the context the slot needs.

Lower `priority` values match first. With equal priorities, later render plugins match first, so this custom plugin takes precedence over the preset. Presets continue to handle unmatched nodes.

> This example requires `pnpm add @fluxdown/react-base-presets`.

For component, style, or interaction changes, use a [slot plugin](./slot.md). To change HAST content before rendering, use a [rehype plugin](../../core/plugins/rehype.md).
