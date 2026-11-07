# Render plugins - Fluxdown React Lynx {#render-plugins}

Render plugins turn HAST nodes into slots, deciding which component receives each piece of content. Slot plugins provide the styling and interactions.

## Declare and use

This example sends paragraphs beginning with “Note:” to the blockquote slot and leaves other paragraphs unchanged:

```tsx
import type {
  ReactLynxRenderMatchParams,
  ReactLynxRenderParams,
} from '@fluxdown/react-lynx-plugins/base';

import { Fluxdown } from '@fluxdown/react-lynx';
import {
  BaseReactLynxRenderPlugin,
  createTypeOfSlot,
  isElementWithTag,
} from '@fluxdown/react-lynx-plugins/base';

const Blockquote = /*#__PURE__*/ createTypeOfSlot('Blockquote');

const Paragraph = /*#__PURE__*/ createTypeOfSlot('Paragraph');

function renderNote({
  node,
  parents,
  render,
  renderChildren,
}: ReactLynxRenderParams) {
  if (!isElementWithTag(node, 'p')) {
    return null;
  }

  return (
    <Blockquote current={node} parents={parents} render={render}>
      <Paragraph
        current={node}
        parents={parents}
        render={render}
        style={{ marginTop: '0px', marginBottom: '0px' }}
      >
        {renderChildren(node)}
      </Paragraph>
    </Blockquote>
  );
}

class NoteRenderPlugin extends BaseReactLynxRenderPlugin {
  static readonly key = 'render-note';

  match({ node }: ReactLynxRenderMatchParams) {
    if (!isElementWithTag(node, 'p')) {
      return false;
    }

    const first = node.children[0];

    return first?.type === 'text' && first.value.startsWith('Note:');
  }

  readonly render = renderNote;
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

> Import the base class, parameter types and `createTypeOfSlot` from `@fluxdown/react-lynx-plugins/base`. Install `@fluxdown/react-lynx-plugins` first.

`match` selects a node; `renderChildren` renders its children. `current`, `parents` and `render` retain the context needed by the slot.

Keep the JSX render function outside the class and assign it to `readonly render`. This prevents the React Lynx compiler from treating the plugin's `render` method as a class component.

## Matching order

Lower `priority` values match first. At equal priority, later render plugins match first, so your custom plugins take precedence over the preset. Unmatched nodes continue through the preset.

Use [slot plugins](./slot.md) for changes to components or interactions. To transform HAST first, use a [Rehype plugin](../../core/plugins/rehype.mdx).
