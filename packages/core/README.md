# @fluxdown/core

A framework-independent Markdown engine for streaming content.

[Documentation](../../website/docs/en/guide/core/quick-start.md) · [简体中文](./docs/README.zh-CN.md)

`@fluxdown/core` turns changing Markdown into reactive content blocks backed by HAST, an HTML syntax tree. It handles parsing, syntax repair, and updates; your renderer decides what each block becomes.

Core runs without a browser. Use it to build a custom renderer or a framework integration. For a ready-to-use React component, use [`fluxdown`](../react).

## Install

```sh
pnpm add @fluxdown/core @fluxdown/types stative
pnpm add -D @types/hast
```

The example below imports public block and HAST types from `@fluxdown/types` and `@types/hast`.

## Read content blocks

This renderer returns each block unchanged so you can inspect its current syntax tree:

```ts
import type { BlockCompilerConfig, HastRoot } from "@fluxdown/core";
import type { IBlockState } from "@fluxdown/types";
import type { ElementContent, Parent } from "hast";

import { BaseRenderer, Core } from "@fluxdown/core";
import { D, MutableState, render, S } from "stative";

type MarkdownBlock = IBlockState<HastRoot>;

class BlocksRenderer extends BaseRenderer<HastRoot, ElementContent, Parent, MarkdownBlock> {
  protected renderItem(block: MarkdownBlock): MarkdownBlock {
    return block;
  }
}

const text = MutableState.of("# Hello, Fluxdown");
const build = MutableState.of<BlockCompilerConfig>({
  repair: true,
  repairEnding: true,
  footnote: false,
  tex: false,
  indentedCode: false,
  setextHeading: false,
});

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
text.next(text.value + "\n\nThe content **keeps growing");
console.log(readTrees());

// End trailing syntax repair when the stream finishes.
build.next({ ...build.value, repairEnding: false });

// Run when this content is no longer needed.
core.destroy();
text.destroy();
build.destroy();
```

`S` describes the computation, `render` creates it, and `D` passes the renderer class as a plain value. These come from [`stative`](../stative), Core's reactive foundation.

## Follow updates

Keep one Core instance for each message and pass the full current Markdown to `text.next()`. `core.value` tracks the block list, and each block's `value` tracks its content. In a live renderer, subscribe to both: an existing block can change without changing the list or block references. The [state and updates guide](../../website/docs/en/guide/core/streaming.md) covers subscriptions and cleanup.

Core manages the resources it creates. Clean up your own subscriptions and the `MutableState` inputs you created when they are no longer needed.

## Configure the pipeline

Use `build` to control syntax and repair. Parsing, HTML processing, repair, and mapping can be extended through plugins. Smooth output and trailing fade markers are available as presets and are disabled by default; the visual result depends on your renderer.

- [State and updates](../../website/docs/en/guide/core/streaming.md) — follow content changes and enable smooth output.
- [Configuration](../../website/docs/en/guide/core/configuration.md) — Core inputs and syntax switches.
- [Plugins](../../website/docs/en/guide/core/plugins.md) — remark, rehype, repair, and mapper plugins.

## Contributing and license

See [CONTRIBUTING.md](../../CONTRIBUTING.md). Licensed under [MIT](../../LICENSE).
