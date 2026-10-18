# Quick start

Add Fluxdown to a React app and pass it Markdown. Common syntax, code highlighting, copy buttons, and base styles are already included.

For native apps, use the [React Native quick start](../react-native/quick-start.md).

## Install

```sh
pnpm add fluxdown
```

> Your project needs React 18 or 19.

## Render your first message

```tsx
import { Fluxdown } from 'fluxdown';

const markdown = `# Hello, Fluxdown

Keep **streaming content** easy to read.`;

export default function App() {
  return <Fluxdown text={markdown} />;
}
```

> If your bundler does not load the component styles automatically, import them in your app's global style entry:

```ts
import 'fluxdown/styles.css';
```

## Connect streaming text

If your request library already gives you the accumulated text, pass it to `text` and use the request status to control `streaming`:

```tsx
import { Fluxdown } from 'fluxdown';

type MessageProps = {
  text: string;
  isStreaming: boolean;
};

export function Message({ text, isStreaming }: MessageProps) {
  return <Fluxdown streaming={isStreaming} text={text} />;
}
```

`text` always contains the full message received so far. When the request finishes, set `streaming` to `false` to show the complete result and end the streaming effects.

## Next steps

- [Streaming content](./streaming.md): connect a stream and adjust the reveal and trailing effects.
- [Styling guide](./customization.md): match your app's colors, typography, and layout.
- [Configuration](./configuration.md): explore all props, syntax switches, and configuration forms.
- [Using and writing plugins](./plugins.md): add your own components and interactions to code blocks, links, and more.
