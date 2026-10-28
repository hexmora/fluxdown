# Slot plugins

Slot plugins render components. Content such as code, links and headings is already prepared; you choose its presentation and interactions.

## Declare and use a plugin

This example hides the code toolbar while keeping the default highlighting and code styles. Declare the plugin in its own module:

```ts
import type { CodeBlockProps } from '@fluxdown/vue-plugins/base';

import { BaseSlotPlugin } from '@fluxdown/vue-plugins/base';
import { h } from 'vue';

function CompactCodeBlock({ Raw, ...props }: CodeBlockProps) {
  return Raw ? h(Raw, { ...props, showHeader: false }) : null;
}

export class CompactCodeBlockPlugin extends BaseSlotPlugin<'CodeBlock'> {
  static readonly key = 'compact-code-block';

  readonly type = 'CodeBlock';

  readonly Component = CompactCodeBlock;
}
```

Then pass it to the component:

```vue
<script setup lang="ts">
import { Fluxdown } from '@fluxdown/vue';

import { CompactCodeBlockPlugin } from './plugins/compact-code';

type MessageProps = {
  text: string;
};

const props = defineProps<MessageProps>();

const plugins = { slots: [CompactCodeBlockPlugin] };
</script>

<template>
  <Fluxdown :text="props.text" :plugins="plugins" />
</template>
```

> Import the plugin base class and prop types from `@fluxdown/vue-plugins/base`. Install `@fluxdown/vue-plugins` first.

`key` identifies the plugin, `type` selects a slot, and `Component` supplies a Vue component. A stateless component can be a function. Use `defineComponent` with explicit props when you need reactive state or lifecycle hooks.

## Keep the default behavior

`Raw` is the component supplied by the previous plugin. Call it to preserve existing highlighting or layout, then change individual props to adjust part of its behavior.

At the same priority, later plugins for a slot wrap earlier components through `Raw`. Return your own VNode to replace it entirely. Pass child content through the `children` prop or Vue's default slot.

> `Raw` can be `null`. Check it before use.

## Choose a slot

| Slot                                       | Common uses                                    |
| ------------------------------------------ | ---------------------------------------------- |
| `CodeBlock`                                | Adjust the code container, copying or toolbar. |
| `CodeHeader`                               | Change the toolbar or add actions.             |
| `CodeHighlighter`                          | Use your own code highlighting.                |
| `Link`, `Image`                            | Customize navigation and image interactions.   |
| `Heading`, `Paragraph`                     | Adjust heading and paragraph components.       |
| `Table`, `TableCell`, `List`, `Blockquote` | Customize content layout.                      |
| `Tex`                                      | Provide math rendering.                        |

Each slot has its own prop type, such as `LinkProps` or `HeadingProps`. Use [Render plugins](./render.md) to change which slot handles a HAST node.
