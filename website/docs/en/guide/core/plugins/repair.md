# Repair plugins

Repair plugins post-process the Markdown AST before it becomes HAST. They can repair incomplete syntax, tidy node boundaries, or add temporary presentation without changing the source string.

## Declare a plugin

Add a small indicator after the content while a response is arriving, then remove it when the response finishes:

```ts
import type {
  RepairPluginRunner,
  RepairPluginSystemConfig,
} from '@fluxdown/types';

import { BaseRepairPlugin } from '@fluxdown/core-presets/repair';
import { PluginPriority } from '@fluxdown/types';

class StreamingIndicatorPlugin extends BaseRepairPlugin {
  static readonly key = 'repair-streaming-indicator';

  readonly config: RepairPluginSystemConfig = {
    ending: true,
    priority: PluginPriority.Lowest,
  };

  readonly runner: RepairPluginRunner = ({ node, break: stop }) => {
    if (node.type !== 'root' || !('children' in node)) {
      return;
    }

    node.children.push({
      type: 'html',
      value: '<span class="indicator"></span>',
    });

    stop();
  };
}

const repairs = [StreamingIndicatorPlugin];
```

After the built-in repairs, this plugin appends an HTML node with the `indicator` class to the current trailing block. `stop()` ends the traversal so it is inserted just once.

## Connect to Core

Add `repairs` to the Core inputs from the [quick start](../quick-start.md), and enable `build.repair` and `build.repairEnding`.

`ending: true` limits the plugin to the last block while it is still being generated. Set `repairEnding` to `false` when the response finishes to remove the indicator. The original Markdown stays unchanged.

The built-in HTML processing already allows the `class` attribute on `span`. With an HTML renderer, a little CSS gives the indicator its shape:

```css
.indicator {
  display: inline-block;
  width: 0.5em;
  height: 0.5em;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.45;
}
```

> Put traversal settings in `config` and keep constructor options in a separate field. Core runs the plugin and manages its lifecycle.

## Built-in plugins

Core includes these plugins by default; no registration is needed.

`PRESET_REPAIR_PLUGINS`, exported from `@fluxdown/core-presets/repair`.

`build.repair` controls repairs. The first group below handles temporary states at the end of a stream and also requires `build.repairEnding`.

### The streaming tail

| Plugin                               | Purpose                                                                                              |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `TrailingEscapeRepairPlugin`         | Temporarily hides a trailing backslash that has not yet formed an escape sequence.                   |
| `TrailingEmptyCodeBlockRepairPlugin` | Hides a trailing code fence that has no language or content yet.                                     |
| `IncompleteCodeFenceRepairPlugin`    | Hides unfinished trailing fence backticks so they do not appear inside the code.                     |
| `IncompleteInlineCodeRepairPlugin`   | Presents unfinished inline code as code before its closing backtick arrives.                         |
| `IncompleteImageRepairPlugin`        | Creates a placeholder for an unfinished image, or hides it with `strategy: 'discard'`.               |
| `IncompleteLinkRepairPlugin`         | Presents an unfinished link's text while waiting for the URL to complete.                            |
| `TrailingEmptyHeadingRepairPlugin`   | Hides a trailing level-one heading that contains only `#` and no text.                               |
| `IncompleteStrongRepairPlugin`       | Presents bold content before its closing delimiter arrives.                                          |
| `IncompleteEmphasisRepairPlugin`     | Presents italic content opened with an asterisk before it is closed.                                 |
| `IncompleteListMarkerRepairPlugin`   | Hides a trailing list marker while waiting for the item's content.                                   |
| `DanglingFootnoteRepairPlugin`       | Temporarily hides unresolved and incomplete trailing footnote references; requires `build.footnote`. |

### Formatting boundaries

These plugins run when `build.repair` is enabled and do not require `repairEnding`.

| Plugin                                 | Purpose                                                                       |
| -------------------------------------- | ----------------------------------------------------------------------------- |
| `IncompleteHtmlTagRepairPlugin`        | Hides an unfinished HTML tag fragment at the end of the content.              |
| `RedundantBreakBeforeHtmlRepairPlugin` | Removes redundant line-break nodes before HTML fragments.                     |
| `HtmlBoundaryLineBreakRepairPlugin`    | Preserves intended line breaks where text meets HTML.                         |
| `ParagraphHtmlClosureRepairPlugin`     | Closes HTML tags in completed paragraphs so they do not affect later content. |
| `RedundantTrailingBreakRepairPlugin`   | Removes redundant trailing line breaks.                                       |
| `AdjacentTextRepairPlugin`             | Merges adjacent text and removes empty text after repairs.                    |

Repairs affect the current presentation, not the original Markdown stored by your app.
