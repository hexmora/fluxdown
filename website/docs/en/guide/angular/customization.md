# Styling

Themes control Markdown colors, fonts, and spacing. An outer container controls page layout. Use [slot plugins](./plugins/slot.md) to change components or interactions.

## Follow the application theme

```html
<fluxdown [text]="text()" [theme]="dark() ? 'dark' : 'light'" />
```

> The default is `light`; it does not automatically follow the system theme. Pass your application's existing theme state.

## Adjust fonts and colors

Start from a preset and override only the tokens you need:

```ts
import type { Theme } from '@fluxdown/angular';

import { Component, input } from '@angular/core';
import { Fluxdown } from '@fluxdown/angular';

@Component({
  selector: 'app-article',
  imports: [Fluxdown],
  template: `<fluxdown [text]="text()" [theme]="theme" />`,
})
export class Article {
  readonly text = input.required<string>();

  readonly theme: Theme = [
    'dark',
    {
      tokens: {
        colors: { accent: '#82d8cf' },
        typography: { fontSans: 'Inter, sans-serif', fontSize: { md: '16px' } },
      },
    },
  ];
}
```

> Import `Theme`, `ThemeTokens`, and `PartialThemeConfig` from `@fluxdown/angular`.

A plain token configuration object inherits the light theme. Overrides apply to built-in headings, paragraphs, code, tables, and other components. See [configuration](./configuration.md#theme) for the fields.

## Layout and spacing

Use an application container for width and page spacing:

```html
<article class="message-body" style="max-width: 72ch; margin-inline: auto">
  <fluxdown [text]="text()" />
</article>
```

Prefer theme tokens for typography inside the content. Use plugins when you need different link behavior, a custom code toolbar, or a replacement component.

## Compare renderers

The [renderer comparison](../common/features/renderers.mdx) uses the same content and streaming settings. Select Angular alongside other renderers to compare them.
