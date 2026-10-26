# Configuration

Component props control content, streaming, styling and plugins.

| Prop        | Type                           | Default and purpose                                |
| ----------- | ------------------------------ | -------------------------------------------------- |
| `text`      | `string`                       | Required; the complete current Markdown.           |
| `streaming` | `boolean \| StreamingConfig`   | `false`; trailing repair, smoothing and effects.   |
| `build`     | `BaseBuildConfig`              | `{}`; parsing features such as footnotes and math. |
| `theme`     | `Theme`                        | `'light'`; a preset or partial overrides.          |
| `className` | `string`                       | Class name on the outer `view`.                    |
| `style`     | `CSSProperties`                | Styles on the outer `view`.                        |
| `plugins`   | `IPluginItem \| IPluginItem[]` | Extends the preset; required for Raw.              |
| `patches`   | `IPatchItem<ReactNode>[]`      | Inserts or replaces text with Lynx content.        |
| `getProps`  | `GetPropsFunction \| null`     | Converts element properties from the syntax tree.  |
| `ref`       | `Ref<FluxdownRef>`             | A handle to the reactive rendered result.          |

> Import `BaseBuildConfig`, `StreamingConfig` and `FluxdownRef` from `@fluxdown/lynx`; `Theme`, `IPluginItem` and `GetPropsFunction` from `@fluxdown/lynx-plugins/typings`; `CSSProperties` from `@lynx-js/types`; and `ReactNode` from `@lynx-js/react`.

## Compilation and streaming

`build`, `streaming` and `patches` use Core's processing pipeline. See [React configuration](../react/configuration.md) for shared fields, defaults and range rules. The [plugin matrix](./plugins/matrix.mdx) describes the presentation supported by Lynx.

`build.tex` defaults to `false`. Enabling it parses math syntax; the built-in `Tex` slot displays the source. Replace that slot to provide typeset math.

## Insert interactive content

A patch's `render` returns ReactLynx content. Use a `text` element for text inserted into a paragraph:

```tsx
<Fluxdown
  patches={[
    {
      key: 'person-ada',
      range: [6, 10],
      render: () => <text bindtap={() => openProfile('ada')}>@Ada</text>,
    },
  ]}
  text="Hello @Ada."
/>
```

Your app supplies `openProfile`. Positions use indices into the original string. A range includes its start, excludes its end and should stay within one content block.

## Element properties

By default, `getProps` converts supported properties such as `id`, `className`, dimensions, list state and `data-*`. Pass a function to replace this conversion, or `null` to forward no element properties from the syntax tree.

```tsx
<Fluxdown getProps={null} text={text} />
```

Prefer the [theme](./customization.md) for internal fonts and spacing. Use [slot plugins](./plugins/slot.md) for interactions such as navigation and code copying.

## Read the rendered result

`FluxdownRef` is a handle to the reactive rendered result, not a `view` reference. Normal rendering does not require it. Cancel any subscriptions you create yourself.

```tsx
import type { FluxdownRef } from '@fluxdown/lynx';

import { Fluxdown } from '@fluxdown/lynx';
import { useRef } from '@lynx-js/react';

type MessageProps = {
  text: string;
};

export function Message({ text }: MessageProps) {
  const content = useRef<FluxdownRef>(null);

  return <Fluxdown ref={content} text={text} />;
}
```
