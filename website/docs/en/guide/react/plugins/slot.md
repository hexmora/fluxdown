# Slot plugins

Slot plugins render slots. Content such as code, links, and headings is already prepared; you decide which components and interactions readers see. Start here for most interface changes.

## Declare and use a plugin

This example hides the code toolbar while keeping the default highlighting and code styles:

```tsx
import type { CodeBlockProps } from '@fluxdown/react-presets/base';

import { BaseSlotPlugin } from '@fluxdown/react-base-presets/base';
import { Fluxdown } from 'fluxdown';

function CompactCodeBlock({ Raw, ...props }: CodeBlockProps) {
  return Raw ? <Raw {...props} showHeader={false} /> : null;
}

class CompactCodeBlockPlugin extends BaseSlotPlugin<'CodeBlock'> {
  static readonly key = 'compact-code-block';

  readonly type = 'CodeBlock';

  readonly Component = CompactCodeBlock;
}

type MessageProps = {
  text: string;
};

export function Message({ text }: MessageProps) {
  return <Fluxdown plugins={{ slots: [CompactCodeBlockPlugin] }} text={text} />;
}
```

`key` identifies the plugin, `type` selects the slot, and `Component` provides its component. Add the plugin class to `slots`; Fluxdown manages its creation and cleanup.

> Import the shared base class from `@fluxdown/react-base-presets/base` and web prop types from `@fluxdown/react-presets/base`. Install both extension packages with `pnpm add @fluxdown/react-base-presets @fluxdown/react-presets` first.

## Keep the defaults

`Raw` is the component supplied by the previous plugin. Call it to keep the existing highlighting, copying, or link behavior, then adjust the props you want to change.

Several plugins can target the same slot. Later plugins wrap earlier components through `Raw`. To replace a slot entirely, return your own JSX.

> `Raw` can be `null`; check it before rendering.

## Choose a slot

| Slot                          | Common uses                                          |
| ----------------------------- | ---------------------------------------------------- |
| `CodeBlock`                   | Adjust the whole code block or hide its toolbar.     |
| `CodeHeader`                  | Change the toolbar or add actions alongside copying. |
| `CodeHighlighter`             | Provide your own code highlighting presentation.     |
| `Link`, `Image`               | Customize navigation and image interactions.         |
| `Heading`, `Paragraph`        | Change heading and paragraph components.             |
| `Table`, `List`, `Blockquote` | Customize tables, lists, and blockquotes.            |
| `Tex`                         | Provide your own formula presentation.               |

Each slot has a corresponding prop type, such as `LinkProps` or `HeadingProps`.

To change which slot a HAST node uses, continue with [Render plugins](./render.md).

## Built-in plugins

Fluxdown includes these plugins by default; no additional setup is needed.

These plugins are included in `PRESET_SLOT_PLUGINS` and exported from `@fluxdown/react-presets/slot`.

| Plugin                      | Purpose                                                                           |
| --------------------------- | --------------------------------------------------------------------------------- |
| `BlockquoteSlotPlugin`      | Provides the layout and styling for blockquotes.                                  |
| `BreakLineSlotPlugin`       | Displays line breaks.                                                             |
| `CodeBlockSlotPlugin`       | Combines the code toolbar and highlighted code area.                              |
| `CodeHeaderSlotPlugin`      | Displays the language and copy action, with support for custom actions.           |
| `CodeHighlighterSlotPlugin` | Highlights code by language and keeps source readable while highlighting loads.   |
| `EmphasisSlotPlugin`        | Displays italic text.                                                             |
| `HeadingSlotPlugin`         | Displays headings at each level.                                                  |
| `ImageSlotPlugin`           | Displays images with alternative text and dimensions, and checks image URLs.      |
| `LinkSlotPlugin`            | Displays links and handles usable URLs.                                           |
| `ListSlotPlugin`            | Provides the default layout for ordered, unordered, and task lists.               |
| `ParagraphSlotPlugin`       | Provides paragraph typography and spacing.                                        |
| `StrongSlotPlugin`          | Displays bold text.                                                               |
| `TableSlotPlugin`           | Provides the table container and layout.                                          |
| `TableCellSlotPlugin`       | Provides header and body cells with column alignment.                             |
| `NodeSlotPlugin`            | Renders remaining supported nodes, including plain text and inline code.          |
| `ShadSlotPlugin`            | Displays the fade at the end of streaming output.                                 |
| `TexSlotPlugin`             | Displays formulas, with a lightweight presentation while the full renderer loads. |

> The formula presets are included, but formula syntax still needs `build={{ tex: true }}`.
