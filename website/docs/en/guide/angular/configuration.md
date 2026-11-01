# Configuration

This page lists the Angular components’ public inputs. Only `text` is required; `FluxdownRaw` also requires `plugins`. The remaining inputs are the same for Full, Lite, and Raw.

> Import `BaseBuildConfig`, `StreamingConfig`, `SmoothConfig`, `EffectItem`, `Theme`, and `FluxdownRef` from `@fluxdown/angular`. Import `IPluginItem` and `AngularRenderNode` from `@fluxdown/angular-plugins/typings`.

## text {#text}

**Type:** `string` · **Required**

The complete Markdown received so far. Append incoming chunks to the existing text instead of passing only the latest chunk.

```html
<fluxdown [text]="text()" />
```

## streaming {#streaming}

**Type:** `boolean | StreamingConfig` · **Default:** `false`

`true` enables ending repair, smooth output, and the default `scale` animation. `false` disables streaming behavior. Use an object to control them separately:

```html
<fluxdown
  [text]="text()"
  [streaming]="{ repairEnding: true, smooth: true, effect: 'scale' }"
/>
```

See [streaming](./streaming.md) for connecting a data source and ending a stream.

### streaming.repairEnding {#streamingrepairending}

**Type:** `boolean` · **Default:** `true`

Repairs unfinished syntax at the end of the stream. `false` only disables ending repair; `build.repair: false` disables all repair plugins.

### streaming.smooth {#streamingsmooth}

**Type:** `boolean | SmoothConfig` · **Default:** `true`

Reveals new content gradually. `true` uses the built-in spring interpolation and selects an available driver automatically; `false` displays received content immediately. Use an object to choose a driver and interpolation:

```html
<fluxdown
  [text]="text()"
  [streaming]="{
    smooth: { enabled: true, driver: 'raf', interpolation: 'spring' },
  }"
/>
```

### smooth.enabled {#smoothenabled}

**Type:** `boolean` · **Default:** `false`

When using a `smooth` object, explicitly set this to `true` to enable smoothing.

### smooth.driver {#smoothdriver}

**Type:** `'raf' | 'interval' | SmoothDriverClass` · **Default:** `'raf'` when animation frames are available, otherwise `'interval'`

Chooses the clock that drives output: `raf` follows animation frames and `interval` uses a timer. A custom driver class is also accepted.

### smooth.interpolation {#smoothinterpolation}

**Type:** `'spring' | SmoothInterpolatorClass` · **Default:** `'spring'`

Turns elapsed time into visible progress. `spring` uses the built-in closed-form spring; custom interpolator classes are also supported.

> Import `SmoothDriverClass` and `SmoothInterpolatorClass` from `@fluxdown/core-plugins/plugins/mapper/smooth`. In most cases, `smooth: true` is sufficient. The previous names `ticker` and `scheduler` still work for one release and are deprecated.

### streaming.effect {#streamingeffect}

**Type:** `boolean | EffectItem | EffectItem[]` · **Default:** `'scale'`

Choose `scale`, `shad`, `chunk`, or `suffix`, or combine effects in an array. `true` selects the default effect; `false` disables animations. See [animation effects](../common/streaming-effects/animation/index.mdx) for configuration and examples.

> Import effect configuration types from their mapper entry, such as `ScaleConfig` from `@fluxdown/core-plugins/plugins/mapper/scale`.

## build {#build}

**Type:** `BaseBuildConfig` · **Default:** `{}`

Selects Markdown compilation features. Tables, task lists, strikethrough, autolinks, and ordinary line breaks are available by default. All fields below are optional:

| Field                    | Default   | Purpose                                                   |
| ------------------------ | --------- | --------------------------------------------------------- |
| `repair: boolean`        | `true`    | Enables syntax repair.                                    |
| `footnote: boolean`      | `false`   | Parses footnotes and creates reference and return links.  |
| `tex: boolean`           | `false`   | Parses inline and block formulas.                         |
| `indentedCode: boolean`  | `false`   | Parses indented code blocks; fenced code needs no option. |
| `setextHeading: boolean` | `false`   | Parses headings underlined with `===` or `---`.           |
| `idPrefix: string`       | Generated | Provides a namespace for footnote IDs.                    |

```html
<fluxdown [text]="text()" [build]="{ tex: true, footnote: true }" />
```

> You usually do not need `idPrefix`. If you set it manually, use a different value for each instance so footnote links stay within their own content.

HTML in Markdown is checked and sanitized. The default allowed tags are `span`, `u`, `br`, `em`, and `a`. See [rehype plugins](../core/plugins/rehype.mdx) to adjust this.

## theme {#theme}

**Type:** `Theme` · **Default:** `'light'`

Accepts three forms:

- `'light'` or `'dark'`: a built-in theme.
- `PartialThemeConfig`: token overrides on top of the light theme.
- `['light' | 'dark', PartialThemeConfig]`: token overrides on the selected preset.

| Group                  | Controls                                                      |
| ---------------------- | ------------------------------------------------------------- |
| `colors`               | Text, backgrounds, borders, accents, and interaction states.  |
| `typography`           | Body and monospace fonts, size, weight, and line height.      |
| `heading`              | Size, weight, line height, and spacing for `h1` through `h6`. |
| `paragraph`、`code`    | Paragraph spacing, code size, and line height.                |
| `inlineCode`           | Inline code fonts, backgrounds, borders, and padding.         |
| `divider`、`footnotes` | Dividers and footnote layout.                                 |
| `syntax`               | Syntax highlighting colors.                                   |
| `radius`、`spacing`    | Shared border radii and spacing.                              |

> Import `ThemeTokens` and `PartialThemeConfig` from `@fluxdown/angular`. See [styling](./customization.md) for complete examples.

## plugins {#plugins}

**Type:** `IPluginItem | IPluginItem[]` · **Default:** `[]`

Full and Lite merge presets with your plugins, with later entries taking precedence. Raw requires this input. Each object describes a plugin pack:

| Field     | Purpose                                                |
| --------- | ------------------------------------------------------ |
| `slots`   | Angular components for rendering slots.                |
| `renders` | Converts HAST into rendering descriptions.             |
| `remarks` | Parses Markdown syntax.                                |
| `rehypes` | Transforms HAST.                                       |
| `repairs` | Transforms and repairs the Markdown AST.               |
| `mappers` | Maps HAST reactively.                                  |
| `config`  | Configures plugins listed in this pack by their `key`. |

Each list item can be a plugin or `[Plugin, options]`. `disabled: true` disables it; lower `priority` values run earlier. See [plugins](./plugins.md) for declarations, composition, and configuration.

## patches {#patches}

**Type:** `IPatchItem<AngularRenderNode>[]` · **Default:** `[]`

Replaces a text range or inserts custom content at a position. Use it to turn mentions or references into interactive elements:

```ts
import type { AngularRenderNode } from '@fluxdown/angular-plugins/typings';
import type { IPatchItem } from '@fluxdown/core';

import { Component } from '@angular/core';
import { Fluxdown } from '@fluxdown/angular';
import { createElement } from '@fluxdown/angular-plugins/base';

@Component({
  selector: 'app-message',
  imports: [Fluxdown],
  template: `<fluxdown [patches]="patches" text="欢迎，@Ada。" />`,
})
export class Message {
  readonly patches: IPatchItem<AngularRenderNode>[] = [
    {
      key: 'person-ada',
      range: [3, 7],
      render: () => {
        return createElement('a', { href: '/people/ada' }, '@Ada');
      },
    },
  ];
}
```

> Import `IPatchItem` from `@fluxdown/core`, `AngularRenderNode` from `@fluxdown/angular-plugins/typings`, and `createElement` from `@fluxdown/angular-plugins/base`.

| Field    | Type and purpose                                                                                    |
| -------- | --------------------------------------------------------------------------------------------------- |
| `key`    | Optional `string`, a stable patch identity.                                                         |
| `range`  | `number` inserts at a position; `[number, number]` replaces a start-inclusive, end-exclusive range. |
| `render` | `(text?: string) => AngularRenderNode`, returning content and optionally reading the replaced text. |

Positions use source-string indices. Keep ranges within one content block and avoid overlapping ranges. You can also return Angular components or templates with `createComponentNode` and `createTemplateNode`; see [render plugins](./plugins/render.md).

## Component references {#ref}

Use Angular’s `viewChild` to read the component. After initialization, `value` provides the reactive handle for Core’s rendered output. Ordinary rendering does not require it:

```ts
import { afterNextRender, Component, viewChild } from '@angular/core';
import { Fluxdown } from '@fluxdown/angular';

@Component({
  selector: 'app-article',
  imports: [Fluxdown],
  template: `<fluxdown text="# Hello" />`,
})
export class Article {
  readonly content = viewChild.required(Fluxdown);

  constructor() {
    afterNextRender(() => {
      const nodes = this.content().value.value;

      console.log(nodes);
    });
  }
}
```

Fluxdown cleans up its internal subscriptions when the component is destroyed. Unsubscribe from any subscriptions you create yourself. See [styling](./customization.md) for container layout and appearance.
