# Fluxdown for React Native

Streaming Markdown, ready for your React Native app.

`@fluxdown/react-native` renders Markdown with native components, base styles, and code highlighting. It supports GFM tables, task lists, strikethrough, and autolinks. During generation, it can smooth incoming text, repair unfinished syntax, and fade in trailing characters.

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

`streaming={true}` enables all three effects. An object lets you choose them separately; omitted fields default to `true`. For example, keep trailing repair and smooth output while disabling the trailing fade:

```tsx
<Fluxdown
  text={text}
  streaming={isStreaming && { repairEnding: true, smooth: true, shad: false }}
/>
```

## Documentation

- [Quick start](../../website/docs/en/guide/react-native/quick-start.md)
- [Styling guide](../../website/docs/en/guide/react-native/customization.md)
- [Configuration](../../website/docs/en/guide/react-native/configuration.md)
- [Using and writing plugins](../../website/docs/en/guide/react-native/plugins.md)

For a web app, see [`fluxdown` for React](../react). For another React rendering platform, see [`@fluxdown/react-base`](../react-base).

## Contributing and license

See [CONTRIBUTING.md](../../CONTRIBUTING.md). Licensed under [MIT](../../LICENSE).
