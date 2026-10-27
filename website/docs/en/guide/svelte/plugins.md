# Plugins

Plugins divide the content pipeline into stages. Start with slots to change components and interactions. Use render plugins to change which slots a node uses. Core plugins handle parsing, repair and streaming transforms.

| Type     | Purpose                                          | Guide                                        |
| -------- | ------------------------------------------------ | -------------------------------------------- |
| `slot`   | Components and interactions for rendering slots. | [Slot plugins](./plugins/slot.md)            |
| `render` | Maps HAST nodes to rendering slots.              | [Render plugins](./plugins/render.md)        |
| `mapper` | Reactively transforms HAST and reveals content.  | [Mapper plugins](../core/plugins/mapper.mdx) |
| `remark` | Parses Markdown syntax.                          | [Remark plugins](../core/plugins/remark.mdx) |
| `rehype` | Processes HAST.                                  | [Rehype plugins](../core/plugins/rehype.mdx) |
| `repair` | Repairs incomplete Markdown AST content.         | [Repair plugins](../core/plugins/repair.mdx) |

## Use a plugin pack

`plugins` accepts an `IPluginItem` or an array. Each object can contain any combination of `slots`, `renders`, `remarks`, `rehypes`, `repairs` and `mappers`.

> Import `IPluginItem` from `@fluxdown/svelte-plugins/typings`. To add plugins individually, install `@fluxdown/svelte-plugins` and import from its `plugins/<kebab-case-directory>` subpaths.

```svelte
<script lang="ts">
  import { FluxdownLite } from '@fluxdown/svelte/lite';
  import { CodeShikiPlugin } from '@fluxdown/svelte-plugins/plugins/code-shiki';

  type MessageProps = {
    text: string;
  };

  let { text }: MessageProps = $props();
</script>

<FluxdownLite plugins={CodeShikiPlugin} {text} />
```

This adds code highlighting to Lite. Pass several packs in an ordered array. At equal priority, later render plugins match first; later slot plugins wrap earlier components through `Raw`.

## Configure and extend

`config` supplies options by plugin `key` and only affects plugins explicitly listed in the same object. See [plugin packs](./plugins/aggregate.md) for declaration and composition examples.

The [plugin matrix](./plugins/matrix.mdx) lists built-in plugins and the Full/Lite split. Use `FluxdownRaw` with a complete `plugins` list to assemble everything yourself.
