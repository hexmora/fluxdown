# Configuration

This page lists the public `Fluxdown` props. Only `text` is required at the top level. Import `BaseBuildConfig`, `StreamingConfig`, `Theme`, `IPluginItem`, and `FluxdownRef` from `fluxdown` when you need their types.

## text <span className="field-tag">Required</span> {#text}

**Type:** `string`

The complete Markdown received so far. When a new chunk arrives, pass the accumulated content rather than only that chunk.

```tsx
<Fluxdown text="# Hello, Fluxdown" />
```

## streaming <span className="field-tag">Optional</span> {#streaming}

**Type:** `boolean | StreamingConfig`

**Default:** `false`

`true` enables trailing syntax repair and smooth output; `false` disables streaming behavior. Pass an object to choose visual effects and control each feature. `repairEnding` and `smooth` default to `true`, while `effect` defaults to `'scale'`.

```tsx
<Fluxdown
  streaming={{
    repairEnding: true,
    smooth: true,
    effect: 'scale',
  }}
  text={text}
/>
```

See [Streaming content](./streaming.md) for connecting a source and finishing a stream.

### streaming.repairEnding <span className="field-tag">Optional</span> {#streamingrepairending}

**Type:** `boolean`

**Default:** `true` (when `streaming` is an object)

Repair unfinished syntax at the streaming tail. Set this to `false` to disable trailing repairs only; `build.repair: false` disables all repairs.

### streaming.smooth <span className="field-tag">Optional</span> {#streamingsmooth}

**Type:** `boolean | SmoothConfig`

**Default:** `true` (when `streaming` is an object)

Reveal new content gradually. `true` uses the built-in spring scheduler and selects an available ticker automatically; `false` immediately reveals all received content. Pass an object to choose the ticker and scheduler:

```tsx
<Fluxdown
  streaming={{
    smooth: {
      enabled: true,
      ticker: 'raf',
      scheduler: 'spring',
    },
  }}
  text={text}
/>
```

### smooth.enabled <span className="field-tag">Optional</span> {#smoothenabled}

**Type:** `boolean`

**Default:** `false`

Set this to `true` when using a `smooth` object to enable progressive output. Disabling it immediately reveals all content received so far.

### smooth.ticker <span className="field-tag">Required</span> {#smoothticker}

**Type:** `'raf' | 'interval' | SmoothTickerClass`

Choose the clock that drives output: `'raf'` follows animation frames, `'interval'` uses a timer, and a custom ticker class can provide your own timing.

### smooth.scheduler <span className="field-tag">Required</span> {#smoothscheduler}

**Type:** `'spring' | SmoothSchedulerClass`

Determine how much content to reveal on each update. Use `'spring'` for the built-in spring scheduler, or pass a custom scheduler class.

> Usually, `smooth: true` is enough. Import `SmoothConfig` from `fluxdown`, and `SmoothTickerClass` and `SmoothSchedulerClass` from `@fluxdown/core-presets/mapper`.

### streaming.effect <span className="field-tag">Optional</span> {#streamingeffect}

**Type:** `boolean | EffectItem | EffectItem[]`

**Default:** `'scale'` (when streaming is enabled)

Choose an animation effect or combine multiple effects. See [Animation](../common/streaming-effects/animation/index.mdx) for the supported input forms, available effects, live demos, and their configuration fields. Import `EffectItem` from `fluxdown` and effect configuration types from `@fluxdown/core-presets/mapper`.

## build <span className="field-tag">Optional</span> {#build}

**Type:** `BaseBuildConfig`

**Default:** `{}`

Choose Markdown compilation features. Tables, task lists, strikethrough, autolinks, and plain line breaks are available by default. Every field below is optional.

```tsx
<Fluxdown
  build={{
    tex: true,
    footnote: true,
  }}
  text={text}
/>
```

HTML in Markdown goes through tag filtering and sanitization. The default allowed tags are `span`, `u`, `br`, `em`, and `a`. See [Rehype plugins](../core/plugins/rehype.md) to adjust this behavior.

### build.repair <span className="field-tag">Optional</span> {#buildrepair}

**Type:** `boolean`

**Default:** `true`

Enable syntax repair. `false` disables all repairs; use `streaming.repairEnding` to control the streaming tail alone.

### build.footnote <span className="field-tag">Optional</span> {#buildfootnote}

**Type:** `boolean`

**Default:** `false`

Whether to parse footnote syntax and generate references and return links.

### build.tex <span className="field-tag">Optional</span> {#buildtex}

**Type:** `boolean`

**Default:** `false`

Whether to parse inline and display formula syntax. When enabled, the built-in renderer loads formula rendering support.

### build.indentedCode <span className="field-tag">Optional</span> {#buildindentedcode}

**Type:** `boolean`

**Default:** `false`

Whether to parse indented code block syntax. Fenced code blocks work without this option.

### build.setextHeading <span className="field-tag">Optional</span> {#buildsetextheading}

**Type:** `boolean`

**Default:** `false`

Whether to parse headings underlined with `===` or `---`. Headings starting with `#` are unaffected.

### build.idPrefix <span className="field-tag">Optional</span> {#buildidprefix}

**Type:** `string`

**Default:** generated automatically

Set a namespace for footnote IDs.

> You normally do not need `idPrefix`. If you set it, give each instance on the page a different value so footnote links stay within the right content.

## theme <span className="field-tag">Optional</span> {#theme}

**Type:** `Theme`

**Default:** `'light'`

Three forms are supported:

- `'light'` or `'dark'`: use a built-in theme.
- `PartialThemeConfig`: override selected tokens in the light theme.
- `['light' | 'dark', PartialThemeConfig]`: override tokens in the selected preset.

```tsx
<Fluxdown
  theme={[
    'dark',
    {
      tokens: {
        colors: { accent: '#82d8cf' },
        typography: { fontSans: 'Inter, sans-serif' },
      },
    },
  ]}
  text={text}
/>
```

Every group under `tokens` supports partial overrides:

| Group                  | What you can adjust                                                           |
| ---------------------- | ----------------------------------------------------------------------------- |
| `colors`               | Text, backgrounds, borders, accents, and interaction states.                  |
| `typography`           | Sans and monospace fonts, sizes, weights, line heights, and font smoothing.   |
| `heading`              | Font size, weight, line height, and spacing for each level from `h1` to `h6`. |
| `paragraph`, `code`    | Paragraph spacing, code block font size, and line height.                     |
| `inlineCode`           | Inline code fonts, borders, backgrounds, padding, and whitespace.             |
| `divider`, `footnotes` | Divider and footnote section presentation.                                    |
| `syntax`               | Highlighting colors for comments, keywords, strings, and other tokens.        |
| `radius`, `spacing`    | Shared corner radii and spacing.                                              |

The full token type is `ThemeTokens`, also exported from `fluxdown`. See the [styling guide](./customization.md) for matching your product's theme.

## plugins <span className="field-tag">Optional</span> {#plugins}

**Type:** `IPluginItem | IPluginItem[]`

**Default:** `[]`

An object provides one plugin pack; an array combines several packs. Each pack can contain these lists:

| Field     | Contents                                                                                   |
| --------- | ------------------------------------------------------------------------------------------ |
| `slots`   | Plugins that render slots.                                                                 |
| `renders` | Plugins that render HAST into slots.                                                       |
| `remarks` | Markdown syntax parsing plugins.                                                           |
| `rehypes` | Plugins that further process HAST.                                                         |
| `repairs` | Plugins that further process and repair the Markdown AST.                                  |
| `mappers` | Plugins that reactively map HAST.                                                          |
| `config`  | Options keyed by plugin name for plugins listed in this pack. Its type is `PluginConfigs`. |

Each list item can be a plugin or `[Plugin, options]`. With `config`, you can keep options out of the individual list entries:

```tsx
import { CodeHeaderSlotPlugin } from '@fluxdown/react-presets/slot';
import { Fluxdown } from 'fluxdown';

<Fluxdown
  plugins={{
    slots: [CodeHeaderSlotPlugin],
    config: {
      'slot-code-header': { disabled: true },
    },
  }}
  text={text}
/>;
```

This example disables the default code toolbar. Use `disabled: true` to disable a plugin. `priority` controls execution order; lower values run first.

> `config` belongs to a plugin pack and applies to plugins explicitly listed in that pack. Other presets remain in place.

See [Using and writing plugins](./plugins.md) for declaration, composition, and configuration examples.

## patches <span className="field-tag">Optional</span> {#patches}

**Type:** `IPatchItem<ReactNode>[]`

**Default:** `[]`

Replace selected source text with your own React content, or insert content at a position. Use this to turn mentions or references into interactive elements.

```tsx
<Fluxdown
  patches={[
    {
      key: 'person-ada',
      range: [7, 11],
      render: () => <a href="/people/ada">@Ada</a>,
    },
  ]}
  text="Hello, @Ada."
/>
```

### patches[].key <span className="field-tag">Optional</span> {#patcheskey}

**Type:** `string`

**Default:** `undefined`

A stable identifier for the patch.

### patches[].range <span className="field-tag">Required</span> {#patchesrange}

**Type:** `number | [number, number]`

A number inserts content at that position. A range replaces text from its start, inclusive, to its end, exclusive.

> Positions use source string indices. Keep each range within one content block, without crossing paragraphs or overlapping other ranges.

### patches[].render <span className="field-tag">Required</span> {#patchesrender}

**Type:** `(text?: string) => ReactNode`

Return the inserted or replacement content. Use `text` when the replacement needs the text it replaces.

## className <span className="field-tag">Optional</span> {#classname}

**Type:** `string`

**Default:** `undefined`

A class name added to the outer container, for integrating with your app's styles.

```tsx
<Fluxdown className="conversation-message" text={text} />
```

## style <span className="field-tag">Optional</span> {#style}

**Type:** `CSSProperties`

**Default:** `undefined`

React inline styles for the outer container. Use these for width, layout, or spacing relative to the parent:

```tsx
<Fluxdown
  style={{
    maxWidth: '72ch',
    marginInline: 'auto',
  }}
  text={text}
/>
```

Use `theme` for content typography and plugins for components and interactions.

## ref <span className="field-tag">Optional</span> {#ref}

**Type:** `Ref<FluxdownRef>`

**Default:** `undefined`

A reactive handle to the rendered output. `FluxdownRef` is `IReadableClosure<ReactNode[]>`; its `value` provides the current content and subscriptions. It is not a DOM element.

```tsx
import type { FluxdownRef } from 'fluxdown';

import { Fluxdown } from 'fluxdown';
import { useRef } from 'react';

type MessageProps = {
  text: string;
};

export function Message({ text }: MessageProps) {
  const content = useRef<FluxdownRef>(null);

  return <Fluxdown ref={content} text={text} />;
}
```

> Ordinary rendering does not need a `ref`. Fluxdown manages the handle's lifetime; unsubscribe from any subscriptions you create.
