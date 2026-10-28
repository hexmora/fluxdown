# Quick start

Fluxdown for React Native renders Markdown with native `Text` and `View` components. It shares parsing, streaming repairs, and the plugin system with React. The same component code runs on iOS, Android, and React Native Web.

## Install

```sh
pnpm add @fluxdown/react-native react-native-svg
```

Use React 19 and React Native 0.83 or later in an existing Expo or React Native app.

Full and Lite use `react-native-svg` 15.16 or later for streaming effects. Full also uses it for math and diagrams. In Expo, run `npx expo install react-native-svg` and check that the installed version meets this requirement. For bare iOS projects, run `pod install` after installation. See the [plugin matrix](./plugins/matrix.mdx) to choose a component.

## Display your first message

```tsx
import { Fluxdown } from '@fluxdown/react-native';
import { ScrollView } from 'react-native';

const markdown = `# Hello, Fluxdown

Make an answer **easy to read**, even while it is arriving.`;

export default function App() {
  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Fluxdown text={markdown} />
    </ScrollView>
  );
}
```

Fluxdown lays out the content; the surrounding screen handles scrolling. In a chat list, use it directly as the message body.

## Connect streaming text

```tsx
<Fluxdown streaming={isStreaming} text={text} />
```

Pass the full text received so far. Set `streaming` to `false` when the request finishes.

## Next steps

- [Streaming content](./streaming.md): control smoothing and end-of-stream effects.
- [Styling guide](./customization.md): change native colors, fonts, and layout.
- [Plugin matrix](./plugins/matrix.mdx): choose Full, Lite, or your own set.
- [Side-by-side demo](../common/features/renderers.mdx): explore static and streaming output in React, Vue, Solid, React Native, and Lynx together.
