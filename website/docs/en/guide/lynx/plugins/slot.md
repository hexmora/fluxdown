# Slot plugins

Slot plugins render slots. The code blocks, links, headings and other content are already prepared; you choose their components and interactions.

## Declare and use

This example hides the code toolbar while preserving highlighting and code styles:

```tsx
import type { CodeBlockProps } from '@fluxdown/lynx-plugins/base';

import { Fluxdown } from '@fluxdown/lynx';
import { BaseSlotPlugin } from '@fluxdown/lynx-plugins/base';

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

`key` identifies the plugin, `type` selects the slot and `Component` supplies its component. Fluxdown manages plugin creation and cleanup.

> Import the base class and prop types from `@fluxdown/lynx-plugins/base`. Install `@fluxdown/lynx-plugins` first.

## Preserve existing behavior

`Raw` is the component supplied by the previous plugin. Call it to retain highlighting or layout, and change its props to customize part of that behavior.

At equal priority, later plugins for the same slot wrap earlier components through `Raw`. Return your own JSX to replace the component entirely.

> `Raw` can be `null`; check it before rendering.

## Connect host interactions

Your app supplies link navigation. Use the `Link` slot to connect taps to an existing navigation method:

```tsx
import type { LinkProps } from '@fluxdown/lynx-plugins/base';

import { BaseSlotPlugin } from '@fluxdown/lynx-plugins/base';

import { openUrl } from './native-bridge';

function HostLink({ Raw, ...props }: LinkProps) {
  return Raw ? <Raw {...props} onTap={({ href }) => openUrl(href)} /> : null;
}

export class HostLinkPlugin extends BaseSlotPlugin<'Link'> {
  static readonly key = 'host-link';

  readonly type = 'Link';

  readonly Component = HostLink;
}
```

Add `HostLinkPlugin` to `plugins.slots`. Here, `openUrl` comes from your app's bridge module and can also handle anchors such as footnote links.

Connect code copying through the `CodeBlock` slot's `onCopy({ code, language, meta })`. The callback can return `void` or `Promise<void>`; supplying it enables the toolbar's copy button. The image slot exposes `onTap({ src, event })` for opening an image preview.

## Choose a slot

| Slot                                       | Common uses                                                 |
| ------------------------------------------ | ----------------------------------------------------------- |
| `CodeBlock`                                | Customize code blocks, connect copying or hide the toolbar. |
| `CodeHeader`                               | Customize the toolbar and add actions such as sharing.      |
| `CodeHighlighter`                          | Provide syntax highlighting.                                |
| `Link`, `Image`                            | Customize navigation and image interactions.                |
| `Heading`, `Paragraph`                     | Customize heading and paragraph components.                 |
| `Table`, `TableCell`, `List`, `Blockquote` | Customize content layout.                                   |
| `Tex`                                      | Provide math rendering.                                     |

Each slot has a corresponding prop type, such as `LinkProps` or `HeadingProps`. Use a [render plugin](./render.md) to change which slot handles a HAST node.
