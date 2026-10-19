# Using and writing plugins

Plugins work at different stages of content processing. Start with slots to change components and interactions, or use render plugins to choose which slots nodes use. Core plugins handle parsing, repairs, and streaming transformations.

For a streaming visual effect, you can pass a mapper directly through [`streaming.effect`](./configuration.md#streamingeffect). It accepts the same mapper and options as `plugins.mappers`, without requiring a plugin pack.

| Type     | Purpose                                                        | Guide                                       |
| -------- | -------------------------------------------------------------- | ------------------------------------------- |
| `slot`   | Render slots with components and interactions.                 | [Slot plugins](./plugins/slot.md)           |
| `render` | Render HAST into slots.                                        | [Render plugins](./plugins/render.md)       |
| `mapper` | Reactively map HAST to control how content appears.            | [Mapper plugins](../core/plugins/mapper.md) |
| `remark` | Parse Markdown syntax.                                         | [Remark plugins](../core/plugins/remark.md) |
| `rehype` | Further process HAST.                                          | [Rehype plugins](../core/plugins/rehype.md) |
| `repair` | Further process the Markdown AST to repair unfinished content. | [Repair plugins](../core/plugins/repair.md) |

## Use one plugin pack

`plugins` accepts an `IPluginItem` or an array of them. A plugin pack can contain several lists: `slots`, `renders`, `remarks`, `rehypes`, `repairs`, and `mappers`.

> Import the `IPluginItem` type from `@fluxdown/react-presets/typings`.

```tsx
import { Fluxdown } from 'fluxdown';

import { HighlightedPlugin } from './plugins/highlighted';

type MessageProps = {
  text: string;
};

export function Message({ text }: MessageProps) {
  return <Fluxdown plugins={HighlightedPlugin} text={text} />;
}
```

`HighlightedPlugin` is an [aggregate plugin](./plugins/aggregate.md) exported by your app. It combines slot, render, and Core plugins into one feature.

## Combine plugin packs

Pass plugin packs to `Fluxdown` in an array. At the same priority, later render plugins match first, and later slot plugins wrap earlier components through `Raw`:

```tsx
import { Fluxdown } from 'fluxdown';

import { HighlightedPlugin } from './plugins/highlighted';
import { CommentPlugin } from '../plugins/comment';

type MessageProps = {
  text: string;
};

export function Message({ text }: MessageProps) {
  return <Fluxdown plugins={[HighlightedPlugin, CommentPlugin]} text={text} />;
}
```

## Configure presets

List the preset you want to configure, then supply its options in `config`, keyed by the plugin’s `key`. For example, hide an image while its URL is still being generated:

```tsx
import { IncompleteImageRepairPlugin } from '@fluxdown/core-presets/repair';
import { Fluxdown } from 'fluxdown';

type MessageProps = {
  text: string;
};

export function Message({ text }: MessageProps) {
  return (
    <Fluxdown
      plugins={{
        repairs: [IncompleteImageRepairPlugin],
        config: {
          'repair-incomplete-image': { strategy: 'discard' },
        },
      }}
      streaming
      text={text}
    />
  );
}
```

> This example requires `pnpm add @fluxdown/core-presets`. The default image strategy is `placeholder`, which displays placeholder content.

`config` applies to the plugins listed in the same pack. Other presets remain in place. See [Aggregate plugins](./plugins/aggregate.md#built-in-plugins) for built-in React plugins, and the [Core plugin guides](../core/plugins.md) for parsing and mapping presets. See [Configuration](./configuration.md#plugins) for the full prop.
