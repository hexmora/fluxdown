# Quick start

Fluxdown renders Markdown in Solid applications. Static content and streaming messages share the same component, with themes and plugins for changing its presentation.

## Install

```bash
pnpm add @fluxdown/solid
```

Use it in a Solid `.tsx` component:

```tsx
import { Fluxdown } from '@fluxdown/solid';

export function Article() {
  return <Fluxdown text={'# Hello, Fluxdown\n\nGive words room to unfold.'} />;
}
```

> The browser entry loads the component styles. For server rendering, import `@fluxdown/solid/styles.css` in your application entry so the initial page uses the same styles.

## Receive streaming content

Pass the complete text received so far to `text`. Enable `streaming` while the response is arriving, then set it to `false` when it ends:

```tsx
import { Fluxdown } from '@fluxdown/solid';

type MessageProps = {
  text: string;

  pending: boolean;
};

export function Message(props: MessageProps) {
  return <Fluxdown text={props.text} streaming={props.pending} />;
}
```

Read changing values through `props` or a signal accessor in JSX. Solid tracks those reads and updates the existing content. Your application handles the request and message state; Fluxdown handles the Markdown.

## Choose a preset

| Component      | Entry                                       | Purpose                                                        |
| -------------- | ------------------------------------------- | -------------------------------------------------------------- |
| `Fluxdown`     | `@fluxdown/solid` or `@fluxdown/solid/full` | Full preset with code highlighting, math and diagrams.         |
| `FluxdownLite` | `@fluxdown/solid/lite`                      | Basic Markdown and all four trailing effects, ready to extend. |
| `FluxdownRaw`  | `@fluxdown/solid/raw`                       | Supply `plugins` to choose every rendering capability.         |

Full uses Shiki for code, KaTeX with a MathJax fallback for formulas, and Pele for diagrams. Set `build={{ tex: true }}` when you want to parse formula syntax.

See the [plugin matrix](./plugins/matrix.mdx) for the complete list. Continue with [streaming content](./streaming.md) to adjust the output pace, or the [styling guide](./customization.md) to change its appearance.
