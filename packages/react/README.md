# Fluxdown for React

Streaming Markdown, ready for your React app.

`fluxdown` renders Markdown with base styles, code highlighting, and copy buttons included. It supports GFM tables, task lists, strikethrough, and autolinks. During generation, it can smooth incoming text, repair unfinished syntax, and fade in trailing characters.

[Documentation](../../website/docs/en/guide/react/quick-start.md) · [Playground](https://hexmora.github.io/fluxdown/playground.html) · [简体中文](./docs/README.zh-CN.md)

## Install

In a React 18 or 19 app:

```sh
pnpm add fluxdown
```

## Render a message

```tsx
import { Fluxdown } from "fluxdown";

type MessageProps = {
  text: string;
  isStreaming: boolean;
};

export function Message({ text, isStreaming }: MessageProps) {
  return <Fluxdown text={text} streaming={isStreaming} />;
}
```

Pass the **full message received so far** as `text`, accumulating chunks in your request handler if necessary. Set `isStreaming` to `false` when the request completes, is cancelled, or fails. Fluxdown then shows all received text and stops its streaming effects. Your app handles the request, cancellation, and errors.

For static Markdown, use `<Fluxdown text={text} />`. In a message list, give each component a stable message ID as its `key`.

If your bundler does not load the styles automatically, add this to your app's global style entry:

```ts
import "fluxdown/styles.css";
```

## Choose a preset

Use `Fluxdown` from `fluxdown` or `fluxdown/full` for Shiki highlighting and on-demand formula typesetting. Use `FluxdownLite` from `fluxdown/lite` for code and formula source without those engines, or `FluxdownRaw` from `fluxdown/raw` to supply the required plugin list. All presets support the same streaming configuration.

See [Reduce bundle size](../../website/docs/en/guide/react/bundle-size.mdx) for the plugin packs and examples.

## Make it your own

| Option               | Purpose                                                                       |
| -------------------- | ----------------------------------------------------------------------------- |
| `streaming`          | Configure trailing syntax repair, smooth output, and optional visual effects. |
| `theme`              | Use the light or dark preset, or override colors, typography, and spacing.    |
| `build`              | Enable syntax such as formulas and footnotes.                                 |
| `plugins`            | Customize parsing, rendering, semantic slots, and interactions.               |
| `className`, `style` | Set container layout and styling.                                             |

`streaming={true}` enables trailing repair, smooth output, and the default `scale` effect. Choose another effect with `streaming.effect`:

```tsx
<Fluxdown text={text} streaming={isStreaming && { effect: "shad" }} />
```

## Documentation

- [Quick start](../../website/docs/en/guide/react/quick-start.md)
- [Streaming content](../../website/docs/en/guide/react/streaming.md)
- [Styling guide](../../website/docs/en/guide/react/customization.md)
- [Configuration](../../website/docs/en/guide/react/configuration.md)
- [Using and writing plugins](../../website/docs/en/guide/react/plugins.md)

For native apps, use [`@fluxdown/react-native`](../react-native). For a custom renderer outside React, see [`@fluxdown/core`](../core).

## Contributing and license

See [CONTRIBUTING.md](../../CONTRIBUTING.md). Licensed under [MIT](../../LICENSE).
