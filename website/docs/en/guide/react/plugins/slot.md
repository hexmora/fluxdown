# Slot plugins

Slot plugins render slots. Content such as code, links, and headings is already prepared; you decide which components and interactions readers see. Start here for most interface changes.

## Declare and use a plugin

This example hides the code toolbar while keeping the default highlighting and code styles:

```tsx
import type { CodeBlockProps } from '@fluxdown/react-presets/base';

import { BaseSlotPlugin } from '@fluxdown/react-presets/base';
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

> Import base classes and prop types from `@fluxdown/react-presets/base`. Install the extension package with `pnpm add @fluxdown/react-presets` first.

## Keep the defaults

`Raw` is the component supplied by the previous plugin. Call it to keep the existing highlighting, copying, or link behavior, then adjust the props you want to change.

Several plugins can target the same slot. At the same priority, later plugins wrap earlier components through `Raw`. To replace a slot entirely, return your own JSX.

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
