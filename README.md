<p align="center">
  <img src="./docs/assets/logo.png" alt="Fluxdown" width="480" />
</p>

# Fluxdown — Streaming Markdown for AI apps

[Website](https://hexmora.github.io/fluxdown/) · [Playground](https://hexmora.github.io/fluxdown/playground.html) · [Documentation](https://hexmora.github.io/fluxdown/guide/index.html) · [简体中文](./docs/README.zh-CN.md)

Fluxdown renders streaming Markdown for AI chat and live writing in React, Vue 3, Svelte 5, Angular, React Native, Lynx, SolidJS, and Taro. Its shared core keeps content readable from unfinished syntax to the final response.

- **Smooth streaming.** Reveal incoming text gradually and handle unfinished links, emphasis, and code.
- **Less repeated work.** Block-level caching reuses stable content as the message grows.
- **Familiar Markdown.** Render GFM tables, task lists, strikethrough, and autolinks, with code highlighting and optional math.
- **Adaptable presentation.** Customize themes, replace components, or extend parsing and rendering with plugins.
- **A framework-independent core.** Share parsing, syntax repair, and reactive content blocks across frameworks, or build your own renderer.

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

See the quick starts for [React](https://hexmora.github.io/fluxdown/guide/react/quick-start.html), [Vue 3](https://hexmora.github.io/fluxdown/guide/vue/quick-start.html), [Svelte 5](https://hexmora.github.io/fluxdown/guide/svelte/quick-start.html), [Angular](https://hexmora.github.io/fluxdown/guide/angular/quick-start.html), [React Native](https://hexmora.github.io/fluxdown/guide/react-native/quick-start.html), [Lynx / ReactLynx](https://hexmora.github.io/fluxdown/guide/lynx/quick-start.html), [SolidJS](https://hexmora.github.io/fluxdown/guide/solid/quick-start.html), and [Taro React](https://hexmora.github.io/fluxdown/guide/taro/quick-start.html) for more examples.

## Packages

| Package                                             | Use it for                                                          |
| --------------------------------------------------- | ------------------------------------------------------------------- |
| [`fluxdown`](./packages/react)                      | Ready-to-use Markdown rendering in React.                           |
| [`@fluxdown/vue`](./packages/vue)                   | Ready-to-use Markdown rendering in Vue 3.                           |
| [`@fluxdown/svelte`](./packages/svelte)             | Ready-to-use Markdown rendering in Svelte 5.                        |
| [`@fluxdown/angular`](./packages/angular)           | Ready-to-use Markdown rendering in Angular.                         |
| [`@fluxdown/react-native`](./packages/react-native) | Ready-to-use Markdown rendering in React Native.                    |
| [`@fluxdown/lynx`](./packages/lynx)                 | Ready-to-use Markdown rendering in ReactLynx.                       |
| [`@fluxdown/solid`](./packages/solid)               | Ready-to-use Markdown rendering in SolidJS.                         |
| [`@fluxdown/taro`](./packages/taro)                 | Ready-to-use Markdown rendering in Taro React.                      |
| [`@fluxdown/core`](./packages/core)                 | Parsing, repair, and reactive content blocks for a custom renderer. |
| [`stative`](./packages/stative)                     | Composable state and derived computations, also used by Core.       |

## Documentation

- [React streaming](https://hexmora.github.io/fluxdown/guide/react/streaming.html) — connect incoming text and control streaming effects.
- [React styling](https://hexmora.github.io/fluxdown/guide/react/customization.html) — adjust themes, typography, and layout.
- [React plugins](https://hexmora.github.io/fluxdown/guide/react/plugins.html) — customize syntax, content, and interactions.
- [Core](https://hexmora.github.io/fluxdown/guide/core/quick-start.html) — work with reactive content blocks directly.
- [Stative](https://hexmora.github.io/fluxdown/stative/getting-started.html) — create and compose state flows.

## Contributing

Bug reports, documentation improvements, and pull requests are welcome. Use [issues](https://github.com/hexmora/fluxdown/issues) to report bugs or discuss ideas. A minimal reproduction helps us investigate a problem.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and pull request guidelines. Report vulnerabilities privately as described in [SECURITY.md](./SECURITY.md).

## Contributors

Thanks to everyone who contributes code, documentation, bug reports, and ideas.

[![Contributors](https://contrib.rocks/image?repo=hexmora/fluxdown)](https://github.com/hexmora/fluxdown/graphs/contributors)

## License

[MIT](./LICENSE)
