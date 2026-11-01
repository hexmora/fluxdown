# Streamdown

When migrating from [Streamdown](https://streamdown.ai/docs/usage), keep your existing data stream and message state. Pass Markdown through `text`, then adapt plugins, styling, and interactions.

<details className="agent-assistance">
<summary>Migrate with an agent</summary>
<div className="agent-assistance-content">

Give this prompt to an agent with access to your project:

```markdown
# Goal

Migrate this React project's Streamdown usage to fluxdown, preserving content, streaming state, and interactions.

# References

- Fluxdown: https://hexmora.github.io/fluxdown/guide/react/quick-start.html
- Configuration and extensions: https://hexmora.github.io/fluxdown/guide/react/configuration.html
- Streamdown: https://streamdown.ai/docs/configuration

# Steps

1. Inspect dependency versions, Streamdown usages, and wrappers. Identify active plugins, component overrides, styles, and link behavior.
2. Install fluxdown, move children to text, and drive streaming from the real request state. Preserve the network layer and message model.
3. Map existing needs to Fluxdown: prefer presets for standard features, enable build.tex for math, use Slot plugins for components and theme for styling. Check Mermaid, HTML, and link policies explicitly; do not copy similarly named options unchanged.
4. Keep required client boundaries and load styles through the project's existing setup. Remove dependencies and styles only after confirming they are unused.

# Acceptance

Run the project's type checks, tests, and build. Verify static messages, partial and completed streams, and the code blocks, math, diagrams, and custom interactions in use. Implement the migration, report validation results and remaining differences, and do not silently drop features.
```

</div>
</details>

## Replace the component

```sh
pnpm add fluxdown
```

Before:

```tsx
import { Streamdown } from 'streamdown';

type MessageProps = {
  text: string;
  pending: boolean;
};

export function Message({ text, pending }: MessageProps) {
  return <Streamdown isAnimating={pending}>{text}</Streamdown>;
}
```

After:

```tsx
import { Fluxdown } from 'fluxdown';

type MessageProps = {
  text: string;
  pending: boolean;
};

export function Message({ text, pending }: MessageProps) {
  return <Fluxdown streaming={pending} text={text} />;
}
```

`text` is still the complete Markdown received so far. Set `pending` to `false` when the request finishes or stops. For static articles, omit `streaming`.

Fluxdown's streaming mode enables ending repair, smooth output, and a scale effect by default. To keep ending repair without those visual effects:

```tsx
<Fluxdown
  streaming={pending ? { smooth: false, effect: false } : false}
  text={text}
/>
```

## Adapt existing options

| Streamdown usage                  | Fluxdown equivalent                                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `plugins.code`, `plugins.cjk`     | The default Full preset includes syntax highlighting and CJK support.                                         |
| `plugins.math`                    | Enable math parsing with `build={{ tex: true }}`.                                                             |
| `plugins.mermaid`                 | Keep `mermaid` fences; Pele renders them by default. Check [diagram compatibility](../features/diagrams.mdx). |
| `components`                      | Port the components you need to [Slot plugins](../plugins/slot.md).                                           |
| `shikiTheme`, Tailwind typography | Use [theme](../customization.md) for colors, code palettes, and typography.                                   |
| `controls`, `linkSafety`          | Recreate the needed behavior through `CodeHeader`, `Table`, or `Link` slots. These are not drop-in options.   |

Streamdown plugin objects cannot be passed directly to Fluxdown. Wrap existing remark / rehype extensions in the corresponding plugins; see [Remark](../../core/plugins/remark.mdx) and [Rehype](../../core/plugins/rehype.mdx).

HTML allowlists and link handling also differ. If your application uses `allowedTags`, `urlTransform`, or a link confirmation dialog, preserve those behaviors explicitly.

The component loads its base styles. If your bundler does not load them automatically, add this to the application entry:

```ts
import 'fluxdown/styles.css';
```

Check copying code, math, and diagrams with existing messages before removing unused `streamdown`, `@streamdown/*`, and their dedicated styles.
