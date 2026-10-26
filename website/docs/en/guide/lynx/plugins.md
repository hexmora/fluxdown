# Using and writing plugins

Plugins divide the content pipeline into stages. Start with slots to change components and interactions; use render plugins to change which slot handles a node. Core plugins handle parsing, repair and streaming transforms.

| Type     | Purpose                                                    | Guide                                        |
| -------- | ---------------------------------------------------------- | -------------------------------------------- |
| `slot`   | Render slots with components and interactions.             | [Slot plugins](./plugins/slot.md)            |
| `render` | Render HAST nodes into slots.                              | [Render plugins](./plugins/render.md)        |
| `mapper` | Reactively transform HAST to reveal content progressively. | [Mapper plugins](../core/plugins/mapper.mdx) |
| `remark` | Parse Markdown syntax.                                     | [Remark plugins](../core/plugins/remark.mdx) |
| `rehype` | Post-process HAST.                                         | [Rehype plugins](../core/plugins/rehype.mdx) |
| `repair` | Process Markdown AST and repair incomplete content.        | [Repair plugins](../core/plugins/repair.mdx) |

## Use a plugin pack

`plugins` accepts an `IPluginItem` or an array of them. Each object can contain `slots`, `renders`, `remarks`, `rehypes`, `repairs` and `mappers` lists.

> Import `IPluginItem` from `@fluxdown/lynx-plugins/typings`.

```tsx
import { FluxdownLite } from '@fluxdown/lynx/lite';
import { CodeShikiPlugin } from '@fluxdown/lynx-plugins/plugins/code-shiki';

type MessageProps = {
  text: string;
};

export function Message({ text }: MessageProps) {
  return <FluxdownLite plugins={CodeShikiPlugin} text={text} />;
}
```

This adds syntax highlighting to Lite. Put multiple packs in an ordered array. At equal priority, later render plugins match first, while later slots wrap earlier components through `Raw`.

> To add plugins individually, install `@fluxdown/lynx-plugins` and import from its `plugins/<lowercase-hyphenated-directory>` subpaths.

## Configure and extend

`config` supplies options by a plugin's `key`. It applies only to plugins explicitly listed in the same object. See [composite plugins](./plugins/aggregate.md) for declaration and composition examples.

The [plugin matrix](./plugins/matrix.mdx) lists built-in plugins and the differences between Full and Lite. Use `FluxdownRaw` from `@fluxdown/lynx/raw` to choose every plugin yourself.

## Custom parser plugins

Built-in presets and packs handle the background-thread boundary. If a custom module imports Core or parser libraries, load it only on the background thread: add `import 'background-only'` to that module, then use `plugins={__BACKGROUND__ ? customPlugins : []}` at the call site.

This keeps parsing on the background thread while components use ordinary ReactLynx elements. Slot-only customization does not need parser imports.
