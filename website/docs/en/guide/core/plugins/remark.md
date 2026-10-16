# Remark plugins

Remark plugins run while Markdown is parsed into its syntax tree, MDAST. Use them to add a syntax extension or adapt an existing unified remark plugin.

## Declare a plugin

For example, `remark-cjk-friendly` improves emphasis parsing around Chinese, Japanese, and Korean punctuation:

```sh
pnpm add @fluxdown/core-presets remark-cjk-friendly
```

```ts
import { BaseRemarkPlugin } from '@fluxdown/core-presets/remark';
import remarkCjkFriendly from 'remark-cjk-friendly';

class CjkSyntaxPlugin extends BaseRemarkPlugin {
  static readonly key = 'remark-cjk-syntax';

  readonly plugin = remarkCjkFriendly;
}

const remarks = [CjkSyntaxPlugin];
```

`key` identifies the plugin. `plugin` is the unified plugin that registers the syntax extension. Core already supplies the Markdown parser.

## Use it

Add `remarks` to the Core inputs from the [quick start](../quick-start.md). Existing presets stay enabled.

If your unified plugin needs options, accept them in the class constructor and create a `plugin` function that closes over those options. Pass them as `[YourPlugin, options]`.

> remark extensions can also transform MDAST. Use [repair](./repair.md) when the change should follow Core's repair switches or target the streaming tail.

## Built-in plugins

Core includes these plugins by default; no registration is needed.

`PRESET_REMARK_PLUGINS`, exported from `@fluxdown/core-presets/remark`.

| Plugin                            | Purpose                                                                                  |
| --------------------------------- | ---------------------------------------------------------------------------------------- |
| `ApplyRepairsRemarkPlugin`        | Applies repair plugins so unfinished Markdown has a suitable presentation at each stage. |
| `CodeMetaRemarkPlugin`            | Preserves metadata after a fenced code block's language label for renderers.             |
| `PatchesRemarkPlugin`             | Marks text ranges that the app will replace with custom content.                         |
| `SyntaxAutolinkRemarkPlugin`      | Converts recognized URLs and email addresses into links.                                 |
| `SyntaxFootnoteRemarkPlugin`      | Supports footnote references and definitions; requires `build.footnote`.                 |
| `SyntaxHtmlAllowedRemarkPlugin`   | Controls which raw HTML tags are allowed and treats other tags as text.                  |
| `SyntaxMathRemarkPlugin`          | Supports formulas and their intermediate streaming states; requires `build.tex`.         |
| `SyntaxPolicyRemarkPlugin`        | Controls whether indented code blocks and Setext headings are enabled.                   |
| `SyntaxSoftEndlineRemarkPlugin`   | Displays plain newlines as line breaks.                                                  |
| `SyntaxStrikethroughRemarkPlugin` | Supports strikethrough.                                                                  |
| `SyntaxTableRemarkPlugin`         | Supports Markdown tables.                                                                |
| `SyntaxTaskListRemarkPlugin`      | Supports task lists with checkboxes.                                                     |
| `TableNoralizerRemarkPlugin`      | Fills in table column alignment as the number of columns changes.                        |
