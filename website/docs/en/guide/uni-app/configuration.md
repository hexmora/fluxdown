# Configuration

This page lists the public props and fallthrough attributes of the uni-app `Fluxdown` component. Only `text` is required at the top level; `FluxdownRaw` also requires explicit `plugins`. All other fields are shared by Full, Lite, and Raw.

> Import `BaseBuildConfig`, `StreamingConfig`, `EffectItem`, `SmoothConfig`, and `FluxdownRef` from `@fluxdown/uni-app`. Import `Theme`, `ThemeTokens`, `IPluginItem`, and `UniRenderNode` from `@fluxdown/uni-app-plugins/typings`.

## text <span className="field-tag">Required</span> {#text}

**Type:** `string`

The complete Markdown received so far. When a new chunk arrives, pass the accumulated content rather than only that chunk.

```vue
<Fluxdown text="# Hello, Fluxdown" />
```

## streaming <span className="field-tag">Optional</span> {#streaming}

**Type:** `boolean | StreamingConfig`

**Default:** `false`

`true` enables trailing syntax repair, smooth output, and the default `scale` animation; `false` disables streaming behavior. Pass an object to choose visual effects and control each feature. `repairEnding` and `smooth` default to `true`, while `effect` defaults to `'scale'`.

```vue
<Fluxdown
  :streaming="{
    repairEnding: true,
    smooth: true,
    effect: 'scale',
  }"
  :text="text"
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

```vue
<Fluxdown
  :streaming="{
    smooth: {
      enabled: true,
      ticker: 'raf',
      scheduler: 'spring',
    },
  }"
  :text="text"
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

> Usually, `smooth: true` is enough. Import `SmoothConfig` from `@fluxdown/uni-app`, and `SmoothTickerClass` and `SmoothSchedulerClass` from `@fluxdown/core-plugins/plugins/mapper/smooth`.

### streaming.effect <span className="field-tag">Optional</span> {#streamingeffect}

**Type:** `boolean | EffectItem | EffectItem[]`

**Default:** `'scale'` (when streaming is enabled)

Choose an animation effect or combine multiple effects. See [Animation](../common/streaming-effects/animation/index.mdx) for the supported input forms, available effects, live demos, and their configuration fields.

> Import `EffectItem` from `@fluxdown/uni-app`. Effect configuration types come from their plugin entry points, such as `ScaleConfig` from `@fluxdown/core-plugins/plugins/mapper/scale`. See [Mapper plugins](../core/plugins/mapper.mdx#supported-plugins) for the available subpaths.

## build <span className="field-tag">Optional</span> {#build}

**Type:** `BaseBuildConfig`

**Default:** `{}`

Choose Markdown compilation features. Tables, task lists, strikethrough, autolinks, and plain line breaks are available by default. Every field below is optional.

```vue
<Fluxdown
  :build="{
    tex: true,
    footnote: true,
  }"
  :text="text"
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

Whether to parse inline and display formula syntax. Full typesets formulas with MathJax; Lite preserves the formula source.

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

```vue
<Fluxdown
  :theme="[
    'dark',
    {
      tokens: {
        colors: { accent: '#82d8cf' },
        typography: { fontSans: '' },
      },
    },
  ]"
  :text="text"
/>
```

`fontSans` defaults to an empty string, inheriting the platform font. Set a font name to override it.

Every group under `tokens` supports partial overrides:

| Group               | What you can adjust                                                           |
| ------------------- | ----------------------------------------------------------------------------- |
| `colors`            | Text, backgrounds, borders, accents, and interaction states.                  |
| `typography`        | Sans and monospace fonts, sizes, weights, line heights.                       |
| `heading`           | Font size, weight, line height, and spacing for each level from `h1` to `h6`. |
| `paragraph`, `code` | Paragraph spacing, code block font size, and line height.                     |
| `syntax`            | Highlighting colors for comments, keywords, strings, and other tokens.        |
| `radius`, `spacing` | Shared corner radii and spacing.                                              |

> Import `ThemeTokens` from `@fluxdown/uni-app-plugins/typings`. See the [styling guide](./customization.md) for color and typography examples.

## plugins <span className="field-tag">Optional</span> {#plugins}

**Type:** `IPluginItem | IPluginItem[]`

**Default:** `[]`

> `IPluginItem` is exported from `@fluxdown/uni-app-plugins/typings`. Lite and Full merge supplied plugins with their presets, giving supplied plugins precedence. This prop is required for `FluxdownRaw`; see [Plugin matrix](./plugins/matrix.mdx) for entry point differences.

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

```vue
<script setup lang="ts">
import { Fluxdown } from '@fluxdown/uni-app';
import { CodeHeaderSlotPlugin } from '@fluxdown/uni-app-plugins/plugins/code';

type MessageProps = {
  text: string;
};

const props = defineProps<MessageProps>();
</script>

<template>
  <Fluxdown
    :plugins="{
      slots: [CodeHeaderSlotPlugin],
      config: {
        'slot-code-header': { disabled: true },
      },
    }"
    :text="props.text"
  />
</template>
```

This example disables the default code toolbar. Use `disabled: true` to disable a plugin. Lower `priority` values run first. At the same priority, later render plugins match first, and the last slot plugin of a given type supplies its component.

> `config` belongs to a plugin pack and applies to plugins explicitly listed in that pack. Other presets remain in place.

See [Using and writing plugins](./plugins.md) for declaration, composition, and configuration examples.

## patches <span className="field-tag">Optional</span> {#patches}

**Type:** `IPatchItem<UniRenderNode>[]`

**Default:** `[]`

Replace selected source text with your own uni-app components, or insert content at a position. Use this to turn mentions or references into interactive elements.

> Import `IPatchItem` from `@fluxdown/core` and `UniRenderNode` from `@fluxdown/uni-app-plugins/typings`.

```vue title="components/mention/main.uvue"
<script setup lang="ts">
type MentionProps = {
  name: string;
};

const props = defineProps<MentionProps>();
</script>

<template>
  <text :style="{ color: '#3182ce' }">@{{ props.name }}</text>
</template>
```

```ts title="components/mention/index.ts"
export { default as Mention } from './main.uvue';
```

```vue
<script setup lang="ts">
import type { IPatchItem } from '@fluxdown/core';
import type { UniRenderNode } from '@fluxdown/uni-app-plugins/typings';

import { Fluxdown } from '@fluxdown/uni-app';

import { Mention } from './components/mention';

const patches: IPatchItem<UniRenderNode>[] = [
  {
    key: 'person-ada',
    range: [7, 11],
    render: () => ({
      component: Mention,
      props: { name: 'Ada' },
    }),
  },
];
</script>

<template>
  <Fluxdown :patches="patches" text="Hello, @Ada." />
</template>
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

**Type:** `(text?: string) => UniRenderNode`

Return the inserted or replacement content. Use `text` when the replacement needs the text it replaces.

## class and style <span className="field-tag">Optional</span> {#style}

The outer container is a `view`. Use `class` and `style` for its dimensions and spacing, and `theme` for the content's typography:

```vue
<Fluxdown class="message" :style="{ padding: '16px' }" :text="text" />
```

Style properties follow the platform support documented in [uni-app x CSS](https://doc.dcloud.net.cn/uni-app-x/css/).

## ref <span className="field-tag">Optional</span> {#ref}

**Type:** `Ref<FluxdownRef | null>`

**Default:** `undefined`

A Vue template ref providing a reactive handle to the rendered output. `FluxdownRef` is `IReadableClosure<UniRenderNode[]>`; the exposed `value` provides the current content and subscriptions. It is not a page element. The template ref is `null` before mounting and after unmounting.

```vue
<script setup lang="ts">
import type { FluxdownRef } from '@fluxdown/uni-app';

import { Fluxdown } from '@fluxdown/uni-app';
import { shallowRef } from 'vue';

type MessageProps = {
  text: string;
};

const props = defineProps<MessageProps>();

const content = shallowRef<FluxdownRef | null>(null);
</script>

<template>
  <Fluxdown ref="content" :text="props.text" />
</template>
```

> In scripts, `content.value` is the component handle, and `content.value?.value` is the reactive Core output. Ordinary rendering does not need a `ref`. Fluxdown manages the handle's lifetime; unsubscribe from any subscriptions you create.
