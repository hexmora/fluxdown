# react-markdown

Keep your Markdown content when migrating from [react-markdown](https://github.com/remarkjs/react-markdown). The main changes are the input prop, component overrides, and syntax plugin configuration.

<details className="agent-assistance">
<summary>Migrate with an agent</summary>
<div className="agent-assistance-content">

Give this prompt to an agent with access to your project:

```markdown
# Goal

Migrate this React project's react-markdown usage to fluxdown while preserving content, styling, and interactions.

# References

- Fluxdown: https://hexmora.github.io/fluxdown/guide/react/quick-start.html
- Configuration and extensions: https://hexmora.github.io/fluxdown/guide/react/configuration.html
- react-markdown: https://github.com/remarkjs/react-markdown

# Steps

1. Inspect dependency versions and all Markdown wrappers. Identify how components, remarkPlugins, rehypePlugins, HTML policies, and styles are used.
2. Install fluxdown and move children to text. Leave streaming off for static content; for streams, pass accumulated text and drive completion from the request state.
3. Prefer presets and build options. Port component overrides to Slot plugins, and wrap any remaining unified extensions as Remark or Rehype plugins. Do not copy old plugin arrays directly into plugins.
4. Check differences in line breaks, footnotes, indented code, Setext headings, and HTML. Preserve client boundaries, routing, and URL policies. Adapt typography through theme, and remove only unused dependencies.

# Acceptance

Run the project's type checks, tests, and build. Use real Markdown to check code blocks, links, tables, math, raw HTML, and custom components. Implement the changes, report validation results and remaining behavior differences, and do not silently drop features.
```

</div>
</details>

## Replace the component

```sh
pnpm add fluxdown
```

Before:

```tsx
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type ArticleProps = {
  text: string;
};

export function Article({ text }: ArticleProps) {
  return <Markdown remarkPlugins={[remarkGfm]}>{text}</Markdown>;
}
```

After:

```tsx
import { Fluxdown } from 'fluxdown';

type ArticleProps = {
  text: string;
};

export function Article({ text }: ArticleProps) {
  return (
    <Fluxdown
      build={{ footnote: true, indentedCode: true, setextHeading: true }}
      text={text}
    />
  );
}
```

In Next.js App Router, put Fluxdown in a wrapper file starting with `'use client';`. Keep data fetching in the server page, and define plugin classes and callbacks on the client side instead of passing them through server props.

Tables, task lists, strikethrough, and autolinks are built in. This example also enables footnotes, indented code blocks, and Setext headings to retain common article syntax. Fluxdown renders ordinary newlines as line breaks by default; check existing content that relies on CommonMark soft breaks.

For math, enable `build.tex`. The default Full component does not need separate `remark-math` and `rehype-katex` configuration:

```tsx
<Fluxdown build={{ tex: true, footnote: true }} text={text} />
```

## Port custom components

Links, images, and code blocks in `components` map to slots such as `Link`, `Image`, and `CodeBlock`. Install the extension package first:

```sh
pnpm add @fluxdown/react-plugins
```

For example, add a class to links while keeping the default link handling:

```tsx
import type { LinkProps } from '@fluxdown/react-plugins/base';

import { BaseSlotPlugin } from '@fluxdown/react-plugins/base';
import { Fluxdown } from 'fluxdown';

type ArticleProps = {
  text: string;
};

function ArticleLink({ Raw, ...props }: LinkProps) {
  return Raw ? <Raw {...props} className="article-link" /> : null;
}

class ArticleLinkPlugin extends BaseSlotPlugin<'Link'> {
  static readonly key = 'article-link';

  readonly type = 'Link';
  readonly Component = ArticleLink;
}

export function Article({ text }: ArticleProps) {
  return <Fluxdown plugins={{ slots: [ArticleLinkPlugin] }} text={text} />;
}
```

Slot props differ from `components` props; adapt them using the types in [Slot plugins](../plugins/slot.md). Existing `urlTransform`, element filtering, and router behavior also need an explicit port.

## Keep the extensions you need

- Syntax and AST transforms: wrap existing unified extensions as [Remark](../../core/plugins/remark.mdx) or [Rehype](../../core/plugins/rehype.mdx) plugins.
- Raw HTML: Fluxdown parses allowed tags and sanitizes the output by default, whereas react-markdown escapes HTML by default. Review `skipHtml` or `rehype-raw` usage and adapt the tag and attribute allowlists.
- Styling: the default component includes styles. Start with [theme](../customization.md), then check CSS that targets `prose` or the old output structure. If necessary, import `fluxdown/styles.css` in the application entry.

For streamed responses, see [Streaming content](../streaming.md). Remove `react-markdown` and obsolete plugins once no other components use them.
