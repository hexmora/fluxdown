# Configuration

This page covers the Solid component's props, defaults and container attributes. `Fluxdown` and `FluxdownLite` require only `text`. `FluxdownRaw` also requires `plugins`; the remaining props are shared by all three entries.

> Import component prop types, `BaseBuildConfig`, `StreamingConfig`, `SmoothConfig`, `EffectItem`, `Theme` and `FluxdownRef` from `@fluxdown/solid`. Import `IPluginItem` and `PluginConfigs` from `@fluxdown/solid-plugins/typings`.

## text <span className="field-tag">Required</span> {#text}

**Type:** `string`

The complete Markdown received so far. Append incoming chunks to your state and pass the accumulated string:

```tsx
<Fluxdown text={text()} />
```

Read signals and props in JSX so Solid can track changes. The component renders `text`; it does not use `children` as a Markdown input.

## streaming <span className="field-tag">Optional</span> {#streaming}

**Type:** `boolean | StreamingConfig`

**Default:** `false`

| Value              | Behavior                                                                                            |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| `false` or omitted | Render received content without trailing repair, smoothing or effects.                              |
| `true`             | Enable trailing repair, smoothing and the `scale` effect.                                           |
| An object          | Configure each feature. Omitted fields use `repairEnding: true`, `smooth: true`, `effect: 'scale'`. |

```tsx
<Fluxdown
  text={text()}
  streaming={
    pending() && {
      repairEnding: true,
      smooth: true,
      effect: 'scale',
    }
  }
/>
```

See [Streaming content](./streaming.md) for receiving and finishing a stream.

### streaming.repairEnding <span className="field-tag">Optional</span> {#streamingrepairending}

**Type:** `boolean`

**Default:** `true` when using a streaming object

Repair unfinished syntax at the end of the message. This only controls trailing repairs; `build.repair: false` disables all repairs.

### streaming.smooth <span className="field-tag">Optional</span> {#streamingsmooth}

**Type:** `boolean | SmoothConfig`

**Default:** `true` when using a streaming object

Reveal received content gradually. `true` uses the spring scheduler and selects `raf` when animation frames are available, otherwise `interval`. `false` reveals received content immediately.

Use an object to select a ticker and scheduler:

```tsx
<Fluxdown
  text={text()}
  streaming={{
    smooth: {
      enabled: true,
      ticker: 'raf',
      scheduler: 'spring',
    },
  }}
/>
```

| Field       | Type                                       | Default  | Meaning                                         |
| ----------- | ------------------------------------------ | -------- | ----------------------------------------------- |
| `enabled`   | `boolean`                                  | `false`  | Enable progressive output when using an object. |
| `ticker`    | `'raf' \| 'interval' \| SmoothTickerClass` | Required | Clock that drives output.                       |
| `scheduler` | `'spring' \| SmoothSchedulerClass`         | Required | Decide how much content to reveal on each tick. |

> Import `SmoothConfig` from `@fluxdown/solid`. Custom ticker and scheduler types come from `@fluxdown/core-plugins/plugins/mapper/smooth`.

### streaming.effect <span className="field-tag">Optional</span> {#streamingeffect}

**Type:** `boolean | EffectItem | EffectItem[]`

**Default:** `'scale'` when streaming is enabled

| Input                           | Meaning                                                            |
| ------------------------------- | ------------------------------------------------------------------ |
| `false`                         | Disable visual effects while keeping the other streaming settings. |
| `true`                          | Use `scale` with its default settings.                             |
| An effect name                  | Use `scale`, `shad`, `chunk` or `suffix`.                          |
| `[name, options]`               | Configure one named effect.                                        |
| A mapper or `[Mapper, options]` | Use a custom mapper.                                               |
| An array of effects             | Combine named or custom effects in order.                          |

For example, combine an entrance effect and a trailing dot:

```tsx
<Fluxdown
  text={text()}
  streaming={
    pending() && {
      effect: [
        ['scale', { duration: 250, from: 0.4 }],
        ['suffix', { type: 'dot' }],
      ],
    }
  }
/>
```

Named effects are enabled automatically. Each also accepts `enabled: false` to turn it off. `disabled: true` excludes a plugin, and a lower `priority` makes it run earlier.

| Effect   | Option      | Type                          | Default    | Meaning                                                           |
| -------- | ----------- | ----------------------------- | ---------- | ----------------------------------------------------------------- |
| `scale`  | `duration`  | `number`                      | `200`      | Entrance duration in milliseconds.                                |
| `scale`  | `from`      | `number`                      | `0`        | Starting scale, between `0` and `1`.                              |
| `scale`  | `blur`      | `number`                      | `0.08`     | Starting blur in `em`.                                            |
| `shad`   | `length`    | `number`                      | `10`       | Maximum number of characters in the shaded tail.                  |
| `shad`   | `maskWidth` | `number`                      | `15`       | Gradient width in pixels.                                         |
| `chunk`  | `duration`  | `number`                      | `400`      | Fade-in duration in milliseconds. Use with `smooth: false`.       |
| `suffix` | `type`      | `'cursor' \| 'dot' \| string` | `'cursor'` | Marker shape. Custom strings need a matching slot implementation. |

Effect fields can also receive readable closures, following the Core mapper configuration model. See [Animation](../common/streaming-effects/animation/index.mdx) for demos and [Mapper plugins](../core/plugins/mapper.mdx) for writing a custom effect.

> Import `EffectItem` from `@fluxdown/solid`. Import `ScaleConfig`, `ShadConfig`, `ChunkConfig` or `SuffixConfig` from the corresponding `@fluxdown/core-plugins/plugins/mapper/<effect>` subpath.

## build <span className="field-tag">Optional</span> {#build}

**Type:** `BaseBuildConfig`

**Default:** `{}`

Choose Markdown compilation features. Core's default pipeline includes tables, task lists, strikethrough, autolinks and plain line breaks. All fields below are optional.

```tsx
<Fluxdown text={text()} build={{ tex: true, footnote: true }} />
```

| Field           | Type      | Default                | Meaning                                                                          |
| --------------- | --------- | ---------------------- | -------------------------------------------------------------------------------- |
| `repair`        | `boolean` | `true`                 | Enable syntax repairs. `false` disables all repairs, including trailing repairs. |
| `footnote`      | `boolean` | `false`                | Parse footnotes and generate reference and return links.                         |
| `tex`           | `boolean` | `false`                | Parse inline and display formulas.                                               |
| `indentedCode`  | `boolean` | `false`                | Parse indented code blocks. Fenced blocks work without this option.              |
| `setextHeading` | `boolean` | `false`                | Parse headings underlined with `===` or `---`. `#` headings are unaffected.      |
| `idPrefix`      | `string`  | Generated per instance | Namespace for generated footnote IDs.                                            |

Full includes formula rendering. Lite displays formula source unless you add a math plugin. Set `build.tex: true` in either case to enable the syntax.

`idPrefix` normally needs no configuration. If you set it, use a different value for each instance on a page. Trailing repair is configured through `streaming.repairEnding`, not `build`.

HTML in Markdown goes through tag filtering and sanitization. The default allowed tags are `span`, `u`, `br`, `em` and `a`. See [Rehype plugins](../core/plugins/rehype.mdx) to adjust the pipeline.

## theme <span className="field-tag">Optional</span> {#theme}

**Type:** `Theme`

**Default:** `'light'`

Three forms are supported:

- `'light'` or `'dark'`: use a built-in theme.
- `PartialThemeConfig`: override selected tokens in the light theme.
- `['light' | 'dark', PartialThemeConfig]`: override the selected preset.

```tsx
<Fluxdown
  text={text()}
  theme={[
    'dark',
    {
      tokens: {
        colors: { accent: '#82d8cf', bg: 'transparent' },
        typography: { fontSans: 'Inter, sans-serif' },
      },
    },
  ]}
/>
```

The theme follows the value you pass; it does not select a system theme automatically. Omitted tokens inherit from the selected preset.

| Token group            | What you can adjust                                                     |
| ---------------------- | ----------------------------------------------------------------------- |
| `colors`               | Text, backgrounds, borders, accents and interaction states.             |
| `typography`           | Fonts, sizes, weights, line heights and font smoothing.                 |
| `heading`              | Size, weight, line height and spacing for each level from `h1` to `h6`. |
| `paragraph`, `code`    | Paragraph spacing and code block typography.                            |
| `inlineCode`           | Inline code fonts, borders, backgrounds, padding and whitespace.        |
| `divider`, `footnotes` | Dividers and the footnote section.                                      |
| `syntax`               | Highlighting colors for comments, keywords, strings and other tokens.   |
| `radius`, `spacing`    | Shared corner radii and spacing.                                        |

The [styling guide](./customization.md#style-fields) lists every token field.

> Import `Theme`, `ThemeTokens`, `ThemeConfig`, `PartialThemeConfig` and `PresetKeys` from `@fluxdown/solid`.

## plugins <span className="field-tag">Optional; required for Raw</span> {#plugins}

**Type:** `IPluginItem | IPluginItem[]`

**Default:** No additional plugins for Full and Lite

Full and Lite keep their presets and apply your plugins afterward. Raw requires an explicit pack or array and supplies no preset render or slot plugins; Core's Markdown pipeline is still available.

Each pack can contain the following fields:

| Field     | Contents                                                      |
| --------- | ------------------------------------------------------------- |
| `slots`   | Plugins that render slots.                                    |
| `renders` | Plugins that render HAST nodes through slots.                 |
| `remarks` | Markdown syntax parsing plugins.                              |
| `rehypes` | Plugins that post-process HAST.                               |
| `repairs` | Plugins that repair the Markdown AST.                         |
| `mappers` | Plugins that reactively transform HAST.                       |
| `config`  | Options keyed by plugin name for plugins listed in this pack. |

Each list item can be a plugin or `[Plugin, options]`. `config` supplies options to plugins explicitly listed in that pack and takes precedence over their tuple options.

```tsx
import type { IPluginItem } from '@fluxdown/solid-plugins/typings';

import { Fluxdown } from '@fluxdown/solid';
import { CodeHeaderSlotPlugin } from '@fluxdown/solid-plugins/plugins/code';

type MessageProps = {
  text: string;
};

const plugins: IPluginItem = {
  slots: [CodeHeaderSlotPlugin],
  config: {
    'slot-code-header': { disabled: true },
  },
};

export function Message(props: MessageProps) {
  return <Fluxdown text={props.text} plugins={plugins} />;
}
```

This disables the default code toolbar. Lower `priority` values run first. At the same priority, later render plugins match first, and later slot plugins wrap earlier components through `Raw`.

> Import `IPluginItem` and `PluginConfigs` from `@fluxdown/solid-plugins/typings`. Import individual plugins from `@fluxdown/solid-plugins/plugins/<lowercase-kebab-name>`.

See [Using and writing plugins](./plugins.md) for declaration and composition examples.

## patches <span className="field-tag">Optional</span> {#patches}

**Type:** `IPatchItem<JSX.Element>[]`

**Default:** `[]`

Replace a source range with Solid content, or insert content at a position. This is useful for mentions, citations and inline controls:

```tsx
import type { IPatchItem } from '@fluxdown/core';
import type { JSX } from 'solid-js';

import { Fluxdown } from '@fluxdown/solid';

const patches: IPatchItem<JSX.Element>[] = [
  {
    key: 'person-ada',
    range: [7, 11],
    render: () => {
      return <a href="/people/ada">@Ada</a>;
    },
  },
];

export function Message() {
  return <Fluxdown text="Hello, @Ada." patches={patches} />;
}
```

> Import `IPatchItem` from `@fluxdown/core` and `JSX` from `solid-js`.

| Field    | Type                             | Required | Meaning                                                                                          |
| -------- | -------------------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `key`    | `string`                         | No       | Stable identity for the patch.                                                                   |
| `range`  | `number \| [number, number]`     | Yes      | A position inserts content; a range replaces text from its inclusive start to its exclusive end. |
| `render` | `(text?: string) => JSX.Element` | Yes      | Return the inserted or replacement content. `text` contains the replaced source when available.  |

Positions use source string indices. Keep a range within one content block, without crossing paragraphs or overlapping another range.

## class and classList <span className="field-tag">Optional</span> {#class}

**Types:** `class?: string`, `classList?: Record<string, boolean | undefined>`

**Default:** `undefined`

Both apply to the outer container. Use `class` for a class name and `classList` for reactive toggles:

```tsx
<Fluxdown
  text={text()}
  class="conversation-message"
  classList={{ 'is-pending': pending() }}
/>
```

The component keeps its built-in classes alongside yours.

## style <span className="field-tag">Optional</span> {#style}

**Type:** `JSX.CSSProperties | string`

**Default:** `undefined`

Inline styles are merged with the theme's CSS variables on the outer container. Use them for layout and spacing around the component:

```tsx
<Fluxdown
  text={text()}
  style={{
    'max-width': '72ch',
    'margin-inline': 'auto',
  }}
/>
```

Solid style objects use kebab-case CSS property names. Use `theme` for Markdown typography and colors, and plugins for components and interactions.

> Import `JSX` from `solid-js` for `JSX.CSSProperties` and `JSX.HTMLAttributes<HTMLDivElement>`.

Other `div` attributes, including `id`, `aria-*`, `data-*` and event handlers, pass through to the container. `children` is excluded, and `ref` has the component-specific meaning below.

## ref <span className="field-tag">Optional</span> {#ref}

**Type:** `(core: FluxdownRef) => void`

**Default:** `undefined`

The callback receives the readable Core handle when the component is created. Its type is `IReadableClosure<unknown[]>`: `core.value` is reactive state, and `core.value.value` is its current array of internal renderer blocks. Those entries are opaque; do not render them as JSX or depend on their structure.

For example, observe the block count without inspecting block internals:

```tsx
import type { FluxdownRef } from '@fluxdown/solid';

import { Fluxdown } from '@fluxdown/solid';
import { createSignal, onCleanup } from 'solid-js';

type MessageProps = {
  text: string;
};

export function Message(props: MessageProps) {
  const [blockCount, setBlockCount] = createSignal(0);

  function observe(core: FluxdownRef) {
    const subscription = core.value.subscribe((blocks) => {
      setBlockCount(blocks.length);
    });

    onCleanup(() => subscription.unsubscribe());
  }

  return (
    <section>
      <Fluxdown text={props.text} ref={observe} />
      <output>{blockCount()} blocks</output>
    </section>
  );
}
```

The handle is not the container element, and the callback is not called with `null` on unmount. Fluxdown destroys its Core instance on cleanup; unsubscribe from subscriptions you create. Ordinary rendering does not need a `ref`.

> Import `FluxdownRef` from `@fluxdown/solid`. The underlying `IReadableClosure` type is defined in `stative`.
