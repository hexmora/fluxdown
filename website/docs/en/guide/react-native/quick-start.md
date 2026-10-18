# Quick start

Add Fluxdown to a React Native app and pass it Markdown. Common syntax, code highlighting, and native base styles are already included. The component uses native views and text; Expo is optional.

## Install

### Expo

```sh
pnpm add @fluxdown/react-native
npx expo install react-native-svg
```

Expo Go includes the native SVG implementation. `expo install` selects the package version for your SDK. If you use a development build, rebuild it after adding the native dependency. See the [Expo SVG guide](https://docs.expo.dev/versions/latest/sdk/svg/).

### React Native without Expo

```sh
pnpm add @fluxdown/react-native react-native-svg
```

On iOS, install the pods using your project's usual CocoaPods command, for example:

```sh
cd ios
bundle exec pod install
```

Rebuild the iOS or Android app after installing the native dependency. Choose a `react-native-svg` version compatible with your React Native version; see its [installation guide](https://github.com/software-mansion/react-native-svg#installation) and [compatibility table](https://github.com/software-mansion/react-native-svg#supported-react-native-versions).

> Fluxdown's peer ranges are React `^18.2.0 || ^19.0.0`, React Native `>=0.76.0`, and react-native-svg `>=15.0.0`. Use the React version required by your React Native release and a compatible SVG version within those ranges.

## Render your first message

```tsx
import { Fluxdown } from '@fluxdown/react-native';
import { ScrollView } from 'react-native';

const markdown = `# Hello, Fluxdown

Keep **streaming content** easy to read.`;

export default function App() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Fluxdown text={markdown} />
    </ScrollView>
  );
}
```

Fluxdown does not create a vertical scroll container. Place it inside your app's `ScrollView`, message list, or other layout, and control scrolling there. Native styles are included; no CSS import is needed.

## Connect streaming text

If your request library already provides accumulated text, pass it to `text` and use the request status to control `streaming`:

```tsx
import { Fluxdown } from '@fluxdown/react-native';

type MessageProps = {
  text: string;

  isStreaming: boolean;
};

export function Message({ text, isStreaming }: MessageProps) {
  return <Fluxdown streaming={isStreaming} text={text} />;
}
```

`text` always contains the full message received so far. Append chunks in your app; do not replace `text` with only the newest chunk. When the request finishes, set `streaming` to `false` to reveal the complete result and end the streaming effects.

See [Streaming content](./streaming.mdx) for all four effects and a live React / React Native Web comparison. The effect configuration matches React.

## Choose a preset

The default import is Full: Shiki highlighting and on-demand MathJax SVG formulas. Use `FluxdownLite` from `@fluxdown/react-native/lite` for code and formula source without those engines, or `FluxdownRaw` from `@fluxdown/react-native/raw` to supply your own plugin list. Lite alone does not require `react-native-svg`.

See [Reduce bundle size](./bundle-size.md) for the presets and modular plugins.

## Next steps

- [Styling guide](./customization.md): match your app's colors, typography, and layout.
- [Configuration](./configuration.md): explore shared props and native options.
- [Using and writing plugins](./plugins.md): customize native components and interactions.
