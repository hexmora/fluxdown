---
title: Angular Markdown Renderer
description: Add Fluxdown standalone components to an Angular app. Render Markdown, connect streaming text, and customize presentation with themes and plugins.
---

# Angular Markdown renderer quick start {#quick-start}

Fluxdown provides standalone Angular components for Markdown. They share the same Core, with static rendering, streaming repair, smooth output, and entrance effects. Themes and plugins let you adjust the presentation.

## Install

```bash
pnpm add @fluxdown/angular
```

Use Angular 22. Add the component to `imports` and pass Markdown through its template input:

```ts
import { Component } from '@angular/core';
import { Fluxdown } from '@fluxdown/angular';

@Component({
  selector: 'app-article',
  imports: [Fluxdown],
  template: `<fluxdown [text]="text" />`,
})
export class Article {
  readonly text = '# Hello, Fluxdown\n\nLet the words unfold.';
}
```

> Component styles are included; no separate stylesheet import is needed. Import `Fluxdown` from `@fluxdown/angular`.

## Receive streaming content

`text` always contains everything received so far. Enable `streaming` while content is growing, then set it to `false` when the stream ends:

```ts
import { Component, input } from '@angular/core';
import { Fluxdown } from '@fluxdown/angular';

@Component({
  selector: 'app-message',
  imports: [Fluxdown],
  template: `<fluxdown [text]="text()" [streaming]="pending()" />`,
})
export class Message {
  readonly text = input.required<string>();

  readonly pending = input(false);
}
```

Angular synchronizes content when inputs change. Your application manages requests and message state; the component handles presentation.

## Choose a preset

| Component      | Entry                    | Selector        | Purpose                                                      |
| -------------- | ------------------------ | --------------- | ------------------------------------------------------------ |
| `Fluxdown`     | `@fluxdown/angular`      | `fluxdown`      | Full preset, including highlighting, formulas, and diagrams. |
| `FluxdownLite` | `@fluxdown/angular/lite` | `fluxdown-lite` | Basic Markdown and all four effects, with optional plugins.  |
| `FluxdownRaw`  | `@fluxdown/angular/raw`  | `fluxdown-raw`  | Supply `plugins` to choose every capability.                 |

See the [plugin matrix](./plugins/matrix.mdx) for the complete list. Continue with [streaming](./streaming.md) to control output, or [styling](./customization.md) to adjust appearance.

Use the [side-by-side demo](../common/features/renderers.mdx) to compare static and streaming output with other renderers.
