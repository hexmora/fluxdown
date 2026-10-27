# Configuration

This page lists the public props of the Svelte `Fluxdown` component. Only `text` is required at the top level; `FluxdownRaw` also requires explicit `plugins`. All other fields are shared by Full, Lite, and Raw.

> Import `BaseBuildConfig`, `StreamingConfig`, and `Theme` from `@fluxdown/svelte`, and `IPluginItem` from `@fluxdown/svelte-plugins/typings`.

## text <span className="field-tag">Required</span> {#text}

**Type:** `string`

The complete Markdown received so far. When a new chunk arrives, pass the accumulated content rather than only that chunk.

```svelte
<Fluxdown text="# Hello, Fluxdown" />
```

## streaming <span className="field-tag">Optional</span> {#streaming}

**Type:** `boolean | StreamingConfig`

**Default:** `false`

`true` enables trailing syntax repair, smooth output, and the default `scale` animation; `false` disables streaming behavior. Pass an object to choose visual effects and control each feature. `repairEnding` and `smooth` default to `true`, while `effect` defaults to `'scale'`.

```svelte
<Fluxdown
  streaming={{
    repairEnding: true,
    smooth: true,
    effect: 'scale',
  }}
  {text}
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

```svelte
<Fluxdown
  streaming={{
    smooth: {
      enabled: true,
      ticker: 'raf',
      scheduler: 'spring',
    },
  }}
  {text}
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

> Usually, `smooth: true` is enough. Import `SmoothConfig` from `@fluxdown/svelte`, and `SmoothTickerClass` and `SmoothSchedulerClass` from `@fluxdown/core-plugins/plugins/mapper/smooth`.

### streaming.effect <span className="field-tag">Optional</span> {#streamingeffect}

**Type:** `boolean | EffectItem | EffectItem[]`

**Default:** `'scale'` (when streaming is enabled)

Choose an animation effect or combine multiple effects. See [Animation](../common/streaming-effects/animation/index.mdx) for the supported input forms, available effects, live demos, and their configuration fields.

> Import `EffectItem` from `@fluxdown/svelte`. Effect configuration types come from their plugin entry points, such as `ScaleConfig` from `@fluxdown/core-plugins/plugins/mapper/scale`. See [Mapper plugins](../core/plugins/mapper.mdx#supported-plugins) for the available subpaths.

## build <span className="field-tag">Optional</span> {#build}

**Type:** `BaseBuildConfig`

**Default:** `{}`

Choose Markdown compilation features. Tables, task lists, strikethrough, autolinks, and plain line breaks are available by default. Every field below is optional.

```svelte
<Fluxdown
  build={{
    tex: true,
    footnote: true,
  }}
  {text}
/>
```

HTML in Markdown goes through tag filtering and sanitization. The default allowed tags are `span`, `u`, `br`, `em`, and `a`. See [Rehype plugins](../core/plugins/rehype.mdx) to adjust this behavior.

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

```svelte
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
  {text}
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

> Import `PartialThemeConfig` and the full token type `ThemeTokens` from `@fluxdown/svelte`. See the [styling guide](./customization.md) for matching your product's theme.

## plugins <span className="field-tag">Optional</span> {#plugins}

**Type:** `IPluginItem | IPluginItem[]`

**Default:** `[]`

> `IPluginItem` is exported from `@fluxdown/svelte-plugins/typings`. Lite and Full merge supplied plugins with their presets, giving supplied plugins precedence. This prop is required for `FluxdownRaw`; see [Plugin matrix](./plugins/matrix.mdx) for entry point differences.

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

```svelte
<script lang="ts">
  import { Fluxdown } from '@fluxdown/svelte';
  import { CodeHeaderSlotPlugin } from '@fluxdown/svelte-plugins/plugins/code';

  type MessageProps = {
    text: string;
  };

  let { text }: MessageProps = $props();
</script>

<Fluxdown
  plugins={{
    slots: [CodeHeaderSlotPlugin],
    config: {
      'slot-code-header': { disabled: true },
    },
  }}
  {text}
/>
```

This example disables the default code toolbar. Use `disabled: true` to disable a plugin. Lower `priority` values run first. At the same priority, later render plugins match first, and later slot plugins wrap earlier components through the `Raw` snippet.

> Import `PluginConfigs` from `@fluxdown/svelte-plugins/typings`. `config` belongs to a plugin pack and applies to plugins explicitly listed in that pack. Other presets remain in place.

See [Using and writing plugins](./plugins.md) for declaration, composition, and configuration examples.

## patches <span className="field-tag">Optional</span> {#patches}

**Type:** `IPatchItem<SvelteNode>[]`

**Default:** `[]`

Replace selected source text with your own Svelte content, or insert content at a position. Use this to turn mentions or references into interactive elements.

> Import `IPatchItem` from `@fluxdown/core`, and `SvelteNode` and `createElement` from `@fluxdown/svelte-plugins/base`.

```svelte
<script lang="ts">
  import type { IPatchItem } from '@fluxdown/core';
  import type { SvelteNode } from '@fluxdown/svelte-plugins/base';

  import { Fluxdown } from '@fluxdown/svelte';
  import { createElement } from '@fluxdown/svelte-plugins/base';

  const patches: IPatchItem<SvelteNode>[] = [
    {
      key: 'person-ada',
      range: [7, 11],
      render: () => createElement('a', { href: '/people/ada' }, '@Ada'),
    },
  ];
</script>

<Fluxdown {patches} text="Hello, @Ada." />
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

**Type:** `(text?: string) => SvelteNode`

Return the inserted or replacement content. Use `text` when the replacement needs the text it replaces.

## class <span className="field-tag">Optional</span> {#class}

**Type:** `string`

**Default:** `undefined`

A class name on the outer element for applying styles from your app. Svelte scopes component styles by default; use `:global` when styling this container through its class. See [page layout](./customization.md#page-layout).

```svelte
<Fluxdown class="conversation-message" {text} />
```

## style <span className="field-tag">Optional</span> {#style}

**Type:** `string`

**Default:** `undefined`

A CSS style string on the outer element, commonly used for width, layout and spacing from its parent:

```svelte
<Fluxdown
  class="conversation-message"
  style="padding: 16px; max-width: 720px"
  {text}
/>
```

See the [styling guide](./customization.md) for colors and typography within the content, and [slot plugins](./plugins/slot.md) to change components or interactions.

## getProps <span className="field-tag">Optional</span> {#getprops}

**Type:** `GetPropsFunction | null`

**Default:** `undefined`

> Import `GetPropsFunction` from `@fluxdown/svelte-plugins/typings`. Its signature is `(node?: Element) => Record<string, unknown>`; `Element` comes from `hast`.

By default, the component converts properties from the syntax tree. Pass a `getProps` function to replace that conversion, or `null` to forward no properties from the syntax tree. Prefer [themes](./customization.md) and [slot plugins](./plugins/slot.md) for typography, spacing and interactions.

```svelte
<Fluxdown getProps={null} {text} />
```

## bind:this <span className="field-tag">Optional</span> {#bindthis}

**Type:** `ReturnType<typeof Fluxdown> | undefined`

**Default:** `undefined`

Obtain the component through `bind:this`, then call `getCore()` for its reactive rendered result. The returned `FluxdownCore` is an `IReadableClosure<SvelteNode[]>`, providing current content and subscriptions.

> Import `FluxdownCore` from `@fluxdown/svelte`. Normal rendering does not require a component reference. Cancel any subscriptions you create yourself.

```svelte
<script lang="ts">
  import { Fluxdown } from '@fluxdown/svelte';

  type MessageProps = {
    text: string;
  };

  let { text }: MessageProps = $props();

  let content = $state<ReturnType<typeof Fluxdown>>();

  function inspect() {
    console.log(content?.getCore());
  }
</script>

<Fluxdown bind:this={content} {text} />
<button onclick={inspect}>Inspect rendered result</button>
```

The `bind:this` value is available after mounting. Read it in an event handler or effect.
