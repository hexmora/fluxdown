# Fluxdown for React Native

Streaming Markdown, ready for your React Native app.

`@fluxdown/react-native` renders Markdown with native components, base styles, and code highlighting. It supports GFM tables, task lists, strikethrough, and autolinks. During generation, it can smooth incoming text, repair unfinished syntax, and animate new characters with scale, trailing fade, chunk fade, or a suffix marker.

[Documentation](../../website/docs/en/guide/react-native/quick-start.md) · [简体中文](./docs/README.zh-CN.md)

## Install

Use React Native 0.76 or later and the React version supported by that release.

In an Expo app:

```sh
pnpm add @fluxdown/react-native
npx expo install react-native-svg
```

In a bare React Native app:

```sh
pnpm add @fluxdown/react-native react-native-svg
```

On iOS, install pods with your app's usual CocoaPods workflow, then rebuild the native app. Rebuild Android after installing the native dependency as well. Fluxdown requires `react-native-svg` 15 or later; choose a version compatible with your app's React Native version using the [SVG compatibility table](https://github.com/software-mansion/react-native-svg#supported-react-native-versions).

If you use an Expo development build, rebuild it after adding the native dependency. Expo Go already includes it.

## Render a message

```tsx
import { Fluxdown } from "@fluxdown/react-native";

type MessageProps = {
  text: string;

  isStreaming: boolean;
};

export function Message({ text, isStreaming }: MessageProps) {
  return <Fluxdown text={text} streaming={isStreaming} selectable />;
}
```

Pass the **full message received so far** as `text`, accumulating chunks in your request handler if necessary. Set `isStreaming` to `false` when the request completes, is cancelled, or fails. Fluxdown then shows all received text and stops its streaming effects. Your app handles the request, cancellation, and errors.

For static Markdown, use `<Fluxdown text={text} />`. In a message list, give each component a stable message ID as its `key`. Your app owns vertical scrolling; use its existing message list or place Fluxdown inside a `ScrollView`.

## Choose a preset

| Entry                               | Component      | Included capabilities                                                        |
| ----------------------------------- | -------------- | ---------------------------------------------------------------------------- |
| `@fluxdown/react-native` or `/full` | `Fluxdown`     | Native Markdown, all effects, Shiki highlighting, lazy MathJax SVG formulas. |
| `@fluxdown/react-native/lite`       | `FluxdownLite` | Native Markdown and all effects; code and formulas display source.           |
| `@fluxdown/react-native/raw`        | `FluxdownRaw`  | Native root and theme; supply the required `plugins` list.                   |

Lite does not load Shiki, MathJax, or SVG, and can be used without `react-native-svg`. Add individual capabilities through `@fluxdown/react-native-presets/plugins/<name>`. See [Reduce bundle size](../../website/docs/en/guide/react-native/bundle-size.md) for all plugin packs and examples.

## Make it your own

| Option       | Purpose                                                                        |
| ------------ | ------------------------------------------------------------------------------ |
| `streaming`  | Enable or configure trailing syntax repair, smooth output, and trailing fade.  |
| `theme`      | Use the light or dark preset, or override colors and syntax highlighting.      |
| `styles`     | Customize text, headings, code blocks, tables, and other Markdown elements.    |
| `build`      | Enable syntax such as formulas and footnotes.                                  |
| `plugins`    | Customize parsing, rendering, semantic slots, and interactions.                |
| `style`      | Set the root `View` layout and styling, including registered styles or arrays. |
| `selectable` | Enable native text selection.                                                  |

`streaming={true}` enables syntax repair, smoothing, and the default `scale` effect. Use `streaming.effect` to choose `shad`, `scale`, `chunk`, `suffix`, or combinations. For example, keep repair and smoothing while disabling visual effects:

```tsx
<Fluxdown
  text={text}
  streaming={isStreaming && { repairEnding: true, smooth: true, effect: false }}
/>
```

## Documentation

- [Quick start](../../website/docs/en/guide/react-native/quick-start.md)
- [Streaming effects and React Native Web comparison](../../website/docs/en/guide/react-native/streaming.mdx)
- [Full, Lite, and Raw](../../website/docs/en/guide/react-native/bundle-size.md)
- [Styling guide](../../website/docs/en/guide/react-native/customization.md)
- [Configuration](../../website/docs/en/guide/react-native/configuration.md)
- [Using and writing plugins](../../website/docs/en/guide/react-native/plugins.md)

For a web app, see [`fluxdown` for React](../react). For another React rendering platform, see [`@fluxdown/react-base`](../react-base).

## Contributing and license

See [CONTRIBUTING.md](../../CONTRIBUTING.md). Licensed under [MIT](../../LICENSE).
