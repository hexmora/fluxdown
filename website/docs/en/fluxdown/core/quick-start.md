# Quick start

`@fluxdown/core` turns changing Markdown into content blocks you can subscribe to. It is framework independent and works without a browser. You decide whether each block becomes a component, data, or another kind of output.

Use it to build a framework integration, a custom renderer, or a reactive Markdown pipeline.

## Install

```sh
pnpm add @fluxdown/core @fluxdown/types stative
pnpm add -D @types/hast
```

> This example also installs the packages that provide the public content block and HAST types.

## Get content blocks

Start with a minimal renderer that returns each content block unchanged. This lets you inspect its HTML syntax tree, or HAST.

```ts
import type { HastRoot } from '@fluxdown/core';
import type { IBlockState } from '@fluxdown/types';
import type { ElementContent, Parent } from 'hast';

import { BaseRenderer, Core } from '@fluxdown/core';
import { D, MutableState, render, S } from 'stative';

type MarkdownBlock = IBlockState<HastRoot>;

class BlocksRenderer extends BaseRenderer<
  HastRoot,
  ElementContent,
  Parent,
  MarkdownBlock
> {
  protected renderItem(block: MarkdownBlock): MarkdownBlock {
    return block;
  }
}

const text = MutableState.of('# Hello, Fluxdown');

const build = {
  repair: true,
  repairEnding: true,
  footnote: false,
  tex: false,
  indentedCode: false,
  setextHeading: false,
};

const core = render(
  S([
    Core<MarkdownBlock>,
    {
      Renderer: D(BlocksRenderer),
      text,
      build,
      patches: [],
      renders: [],
    },
  ]),
);

const readTrees = () => core.value.value.map((block) => block.value.value);

console.log(readTrees());

text.next(text.value + '\n\nThe content **keeps growing');
console.log(readTrees());

core.destroy();
text.destroy();
```

There are three parts to this example:

- `text` holds the full Markdown received so far. Calling `next` updates the output.
- `BlocksRenderer` decides the output format. Here it preserves content blocks; an app could return components for its target framework.
- `core` connects input and output. `core.value.value` is the current output list, and `block.value.value` is a block's current HAST.

`S` and `render` create this reactive data flow. `D` passes the renderer class as a plain value. All three come from [stative](../../stative/index.md).

## What is included

Core includes presets for Markdown syntax, HTML processing, syntax repair, and streaming transformations. `build` controls compilation features. Smooth output and the trailing fade are off by default and can be [enabled separately](./streaming.md#enable-smooth-output).

Core does not provide a default UI. In the example, `renders: []` means that this renderer works directly with blocks and does not need node-level render plugins.

## Next steps

Read [State and updates](./streaming.md) to connect changing text and subscribe to content blocks in your own interface.
