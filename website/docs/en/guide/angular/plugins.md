# Using and writing plugins

Plugins follow the content pipeline. Start with slot plugins to change components and interactions; use render plugins to choose a slot for a node. Core plugins handle parsing, repair and streaming transforms.

| Type     | Purpose                                         | Guide                                        |
| -------- | ----------------------------------------------- | -------------------------------------------- |
| `slot`   | Render a slot with components and interactions. | [Slot plugins](./plugins/slot.md)            |
| `render` | Render HAST nodes through slots.                | [Render plugins](./plugins/render.md)        |
| `mapper` | Reactively transform HAST to reveal content.    | [Mapper plugins](../core/plugins/mapper.mdx) |
| `remark` | Parse Markdown syntax.                          | [Remark plugins](../core/plugins/remark.mdx) |
| `rehype` | Post-process HAST.                              | [Rehype plugins](../core/plugins/rehype.mdx) |
| `repair` | Post-process and repair the Markdown AST.       | [Repair plugins](../core/plugins/repair.mdx) |

## Add a capability

Install the plugin package:

```bash
pnpm add @fluxdown/angular-plugins
```

For example, add Shiki code highlighting to Lite:

```ts
import { Component, input } from '@angular/core';
import { FluxdownLite } from '@fluxdown/angular/lite';
import { CodeShikiPlugin } from '@fluxdown/angular-plugins/plugins/code-shiki';

@Component({
  selector: 'app-message',
  imports: [FluxdownLite],
  template: `<fluxdown-lite [text]="text()" [plugins]="plugins" />`,
})
export class Message {
  readonly text = input.required<string>();

  readonly plugins = CodeShikiPlugin;
}
```

> Import plugins from `@fluxdown/angular-plugins/plugins/<plugin-directory>`. Directories use lowercase kebab case. See the [plugin matrix](./plugins/matrix.mdx) for the complete list.

## Compose and configure

`plugins` accepts one aggregate plugin or an array. Each object can combine `slots`, `renders`, `remarks`, `rehypes`, `repairs` and `mappers`. Its `config` configures the plugins listed in that object.

> Import `IPluginItem` from `@fluxdown/angular-plugins/typings`.

Full and Lite apply your plugins after their presets. Raw uses the supplied rendering plugins while retaining Core's Markdown pipeline. At the same priority, later render plugins match first, and later slot plugins wrap the earlier component through `Raw`.

See [aggregate plugins](./plugins/aggregate.md) for declaration and extension examples. You can also pass a mapper directly to `streaming.effect`; see [configuration](./configuration.md#streamingeffect).
