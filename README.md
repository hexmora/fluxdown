<p align="center">
  <img src="./docs/assets/logo.png" alt="Fluxdown" width="480" />
</p>

**A Markdown renderer built for streaming.**

[Website](https://hexmora.github.io/fluxdown/) · [Playground](https://hexmora.github.io/fluxdown/playground.html) · [Documentation](./website/docs/en/guide/index.md) · [简体中文](./docs/README.zh-CN.md)

Fluxdown keeps streaming Markdown readable, from unfinished syntax to the final response. Use it for AI conversations, live writing, and other interfaces where text keeps growing.

- **Smooth streaming.** Reveal incoming text gradually and handle unfinished links, emphasis, and code.
- **Less repeated work.** Block-level caching reuses stable content as the message grows.
- **Familiar Markdown.** Render GFM tables, task lists, strikethrough, and autolinks, with code highlighting and optional math.
- **Adaptable presentation.** Customize themes, replace components, or extend parsing and rendering with plugins.
- **A framework-independent core.** Use built-in components for React, Vue 3, Svelte 5, React Native, Lynx, Solid, and Taro, or build your own renderer.

## Get started

In a React 18 or 19 app:

```sh
pnpm add fluxdown
```

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

Pass the **full message received so far** as `text`. Set `isStreaming` to `false` when generation finishes, is cancelled, or fails. For static content, omit `streaming`.

If your bundler does not load the styles automatically, add this to your app's global style entry:

```ts
import "fluxdown/styles.css";
```

See the quick starts for [React](./website/docs/en/guide/react/quick-start.md), [Vue 3](./website/docs/en/guide/vue/quick-start.md), [Svelte 5](./website/docs/en/guide/svelte/quick-start.md), [React Native](./website/docs/en/guide/react-native/quick-start.md), [Lynx](./website/docs/en/guide/lynx/quick-start.md), [Solid](./website/docs/en/guide/solid/quick-start.md), and [Taro](./website/docs/en/guide/taro/quick-start.md) for more examples.

## Packages

| Package                                             | Use it for                                                          |
| --------------------------------------------------- | ------------------------------------------------------------------- |
| [`fluxdown`](./packages/react)                      | Ready-to-use Markdown rendering in React.                           |
| [`@fluxdown/vue`](./packages/vue)                   | Ready-to-use Markdown rendering in Vue 3.                           |
| [`@fluxdown/svelte`](./packages/svelte)             | Ready-to-use Markdown rendering in Svelte 5.                        |
| [`@fluxdown/react-native`](./packages/react-native) | Ready-to-use Markdown rendering in React Native.                    |
| [`@fluxdown/lynx`](./packages/lynx)                 | Ready-to-use Markdown rendering in ReactLynx.                       |
| [`@fluxdown/solid`](./packages/solid)               | Ready-to-use Markdown rendering in Solid.                           |
| [`@fluxdown/taro`](./packages/taro)                 | Ready-to-use Markdown rendering in Taro.                            |
| [`@fluxdown/core`](./packages/core)                 | Parsing, repair, and reactive content blocks for a custom renderer. |
| [`stative`](./packages/stative)                     | Composable state and derived computations, also used by Core.       |

## Documentation

- [Streaming](./website/docs/en/guide/react/streaming.md) — connect incoming text and control streaming effects.
- [Styling](./website/docs/en/guide/react/customization.md) — adjust themes, typography, and layout.
- [Plugins](./website/docs/en/guide/react/plugins.md) — customize syntax, content, and interactions.
- [Core](./website/docs/en/guide/core/quick-start.md) — work with reactive content blocks directly.
- [Stative](./website/docs/en/stative/getting-started.md) — create and compose state flows.

## Contributing

Bug reports, documentation improvements, and pull requests are welcome. Use [issues](https://github.com/hexmora/fluxdown/issues) to report bugs or discuss ideas. A minimal reproduction helps us investigate a problem.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and pull request guidelines. Report vulnerabilities privately as described in [SECURITY.md](./SECURITY.md).

## Contributors

Thanks to everyone who contributes code, documentation, bug reports, and ideas.

[![Contributors](https://contrib.rocks/image?repo=hexmora/fluxdown)](https://github.com/hexmora/fluxdown/graphs/contributors)

## License

[MIT](./LICENSE)
