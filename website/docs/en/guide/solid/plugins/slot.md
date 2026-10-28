# Slot plugins

Slot plugins render components. Content such as code, links and headings is already prepared; you choose its presentation and interactions.

## Declare and use a plugin

This example hides the code toolbar while keeping the default highlighting and code styles. Save it in a `.tsx` module:

```tsx
import type { CodeBlockProps } from '@fluxdown/solid-plugins/base';

import { BaseSlotPlugin } from '@fluxdown/solid-plugins/base';
import { splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';

function CompactCodeBlock(props: CodeBlockProps) {
  const [local, rest] = splitProps(props, ['Raw']);

  return (
    <Dynamic component={local.Raw ?? undefined} {...rest} showHeader={false} />
  );
}

export class CompactCodeBlockPlugin extends BaseSlotPlugin<'CodeBlock'> {
  static readonly key = 'compact-code-block';

  readonly type = 'CodeBlock';

  readonly Component = CompactCodeBlock;
}
```

Then pass it to the component:

```tsx
import { Fluxdown } from '@fluxdown/solid';

import { CompactCodeBlockPlugin } from './plugins/compact-code';

type MessageProps = {
  text: string;
};

const plugins = { slots: [CompactCodeBlockPlugin] };

export function Message(props: MessageProps) {
  return <Fluxdown text={props.text} plugins={plugins} />;
}
```

> Import the plugin base class and slot prop types from `@fluxdown/solid-plugins/base`. `splitProps` comes from `solid-js`, and `Dynamic` from `solid-js/web`.

`key` identifies the plugin, `type` selects a slot, and `Component` supplies a Solid component. Use signals, effects and cleanup inside it as you would in any Solid component. Keep changing props reactive with `props.field` or `splitProps`.

## Keep the default behavior

`Raw` is the component supplied by the previous plugin. Render it to preserve existing highlighting or layout, then override individual props to change part of its behavior.

At the same priority, later plugins for a slot wrap earlier components through `Raw`. Return your own JSX to replace it entirely. Slots with child content receive it through `props.children`.

> `Raw` can be `null`. Passing `Raw ?? undefined` to `Dynamic` renders nothing when there is no previous component.

## Choose a slot

| Slot                                            | Common uses                                    |
| ----------------------------------------------- | ---------------------------------------------- |
| `CodeBlock`                                     | Adjust the code container, copying or toolbar. |
| `CodeHeader`                                    | Change the toolbar or add actions.             |
| `CodeHighlighter`                               | Use your own code highlighting.                |
| `Link`, `Image`                                 | Customize navigation and image interactions.   |
| `Heading`, `Paragraph`                          | Adjust heading and paragraph components.       |
| `Table`, `TableCell`, `List`, `Blockquote`      | Customize content layout.                      |
| `Tex`                                           | Provide math rendering.                        |
| `Chunk`, `Scale`, `ScaleWord`, `Shad`, `Suffix` | Customize streaming effects.                   |
| `Element`, `BreakLine`, `Emphasis`, `Strong`    | Customize basic elements and inline content.   |
| `Wrapper`, `Fallback`                           | Wrap slot output or handle rendering errors.   |

Each slot has its own prop type, such as `LinkProps` or `HeadingProps`. Use [Render plugins](./render.md) to change which slot handles a HAST node.
