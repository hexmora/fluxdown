# Render plugins

Render plugins turn HAST nodes into slots. They choose which nodes use each slot and what content to pass along; slot plugins still provide the components.

## Declare and use a plugin

This example sends ordinary paragraphs starting with “Note:” to the blockquote slot, leaving other paragraphs unchanged:

```tsx
import type {
  ReactRenderMatchParams,
  ReactRenderParams,
} from '@fluxdown/react-presets/base';

import {
  BaseReactRenderPlugin,
  createTypeOfSlot,
  isElementWithTag,
} from '@fluxdown/react-presets/base';
import { Fluxdown } from 'fluxdown';

const Blockquote = createTypeOfSlot('Blockquote');

class NoteRenderPlugin extends BaseReactRenderPlugin {
  static readonly key = 'render-note';

  readonly config = { priority: -1 };

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

Lower `priority` values match first. Here, `-1` lets note paragraphs match before the default paragraph plugin. Presets continue to handle unmatched nodes.

> This example requires `pnpm add @fluxdown/react-presets`.

For component, style, or interaction changes, use a [slot plugin](./slot.md). To change HAST content before rendering, use a [rehype plugin](../../core/plugins/rehype.md).

## Built-in plugins

Fluxdown includes these plugins by default; no additional setup is needed.

These plugins are included in `PRESET_RENDER_PLUGINS` and exported from `@fluxdown/react-presets/render`.

| Plugin                   | Purpose                                                                                   |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| `PatchRenderPlugin`      | Renders app-provided replacement content at specified text ranges.                        |
| `ShadRenderPlugin`       | Displays the fade at the end of streaming output.                                         |
| `CodeRenderPlugin`       | Passes code, language, and metadata to the code block slot.                               |
| `EmphasisRenderPlugin`   | Sends italic content to the `Emphasis` slot.                                              |
| `ImageRenderPlugin`      | Sends image URLs, descriptions, and dimensions to the `Image` slot.                       |
| `LinkRenderPlugin`       | Sends link URLs, titles, and content to the `Link` slot.                                  |
| `ListRenderPlugin`       | Sends ordered, unordered, and task lists to the `List` slot.                              |
| `ParagraphRenderPlugin`  | Sends paragraphs to the `Paragraph` slot.                                                 |
| `StrongRenderPlugin`     | Sends bold content to the `Strong` slot.                                                  |
| `TableRenderPlugin`      | Sends tables to the `Table` slot.                                                         |
| `TableCellRenderPlugin`  | Renders header and body cells while preserving column alignment.                          |
| `TexRenderPlugin`        | Sends formulas to the `Tex` slot, preserving inline or display mode.                      |
| `HeadingRenderPlugin`    | Sends level-one through level-six headings to the `Heading` slot.                         |
| `BreakLineRenderPlugin`  | Sends line breaks to the `BreakLine` slot.                                                |
| `BlockquoteRenderPlugin` | Sends quoted content to the `Blockquote` slot.                                            |
| `FallbackRenderPlugin`   | Provides basic rendering for other supported nodes, including plain text and inline code. |
