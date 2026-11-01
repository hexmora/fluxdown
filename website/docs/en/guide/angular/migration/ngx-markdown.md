# ngx-markdown

For a basic view, replace `<markdown [data]="text">` with `<fluxdown [text]="text" />`. Fluxdown currently requires Angular 22; resolve framework compatibility first in older projects.

<details className="agent-assistance">
<summary>Migrate with an agent</summary>
<div className="agent-assistance-content">

Send this prompt to the agent working in your project:

```markdown
Migrate the project's ngx-markdown display components to @fluxdown/angular. Implement the changes.

# References

- Source: https://github.com/jfcere/ngx-markdown
- Target: https://hexmora.github.io/fluxdown/guide/angular/quick-start.html

# Steps

1. Confirm Angular 22 compatibility. Find markdown components/directives, pipes, MarkdownService, providers, and global assets. If incompatible, explain the framework upgrade before forcing dependencies.
2. Replace display components with Fluxdown, add it to component imports, and move data to text. Keep the original Markdown. Load remote src through the application's HttpClient, preserving loading and error states.
3. Use the target docs to migrate Marked extensions, custom renderers, math, diagrams, copy buttons, and styles. Prefer built-in features, then syntax or Slot plugins; do not copy the old providers.
4. Review special uses such as inline and ready, plus HTML rules. For streams, pass accumulated text and derive streaming from the request state.
5. Run existing checks and verify real pages. Remove old providers, scripts, styles, and dependencies only after migrating every use. Keep shared infrastructure such as HttpClient when other features need it.

Report changes and verification results. Identify behavior without an equivalent rather than silently removing features.
```

</div>
</details>

## Replace the display component

```sh
pnpm add @fluxdown/angular
```

Before, the component uses `MarkdownComponent` and the application has `provideMarkdown()` configured:

```ts
import { Component } from '@angular/core';
import { MarkdownComponent } from 'ngx-markdown';

@Component({
  selector: 'app-article',
  imports: [MarkdownComponent],
  template: `<markdown [data]="text" />`,
})
export class Article {
  readonly text = '# Hello\n\nAn article.';
}
```

After, no Markdown provider is needed:

```ts
import { Component } from '@angular/core';
import { Fluxdown } from '@fluxdown/angular';

@Component({
  selector: 'app-article',
  imports: [Fluxdown],
  template: `<fluxdown [text]="text" />`,
})
export class Article {
  readonly text = '# Hello\n\nAn article.';
}
```

Fluxdown includes component styles. Remove `provideMarkdown()` or `MarkdownModule` registrations after all old usages are gone.

## Move loading and extensions

Fluxdown accepts Markdown text and has no `src` download input. Fetch remote files through the application's `HttpClient` and pass the response body to `text`; move `load` and `error` handling into that request. Review calls to `MarkdownPipe` or `MarkdownService.parse()` as well: display views can use the component, while features that require HTML strings need a separate migration.

The full preset includes code highlighting and copy buttons. Pele renders Mermaid code blocks; check the [supported diagrams](../../react/features/diagrams.mdx). Existing Mermaid configuration cannot be reused directly. Enable math parsing with `build.tex`:

```html
<fluxdown [text]="text" [build]="{ tex: true }" />
```

Move custom Marked renderers to [Slot plugins](../plugins/slot.md), and syntax extensions to [Remark plugins](../../core/plugins/remark.mdx). There are no same-name replacements for `inline`, `ready`, or sanitizer settings; adapt each according to its purpose. See [Rehype plugins](../../core/plugins/rehype.mdx) for HTML handling.

Use [themes](../customization.md) for text and code colors. Check other consumers before removing global assets such as Prism. The [ngx-markdown documentation](https://github.com/jfcere/ngx-markdown) covers its providers and rendering APIs.

## Connect streaming content

```html
<fluxdown [text]="text()" [streaming]="pending()" />
```

Here, `text` and `pending` are existing application signals. Update `text` with accumulated content and set `pending` to `false` when the request finishes.
