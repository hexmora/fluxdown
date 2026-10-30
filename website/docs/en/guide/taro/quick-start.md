# Quick start

Use Fluxdown in a Taro React project to render Markdown with Taro components. Parsing, streaming and plugin configuration follow the same API as the React renderer.

## Install

```sh
pnpm add @fluxdown/taro @tarojs/components-react@4.3.1
```

> Use Taro 4.3 with React 18, matching your app’s Taro React integration. Keep the `@tarojs/*` packages in your app on the same version.

Import the component styles in your app's global style entry:

```ts
import '@fluxdown/taro/styles.css';
```

## Render your first message

```tsx
import { Fluxdown } from '@fluxdown/taro';
import { View } from '@tarojs/components';

const markdown = `# Hello, Fluxdown

Keep **streaming content** easy to read.`;

export default function Article() {
  return (
    <View>
      <Fluxdown text={markdown} />
    </View>
  );
}
```

Build the page with your project's usual Taro command, such as `taro build --type h5` or `taro build --type weapp`.

## Taro 4.3.1 H5 builds

Enable Taro's official React-compatible components to keep H5 animations continuous as text updates. For Webpack 5 production builds, also disable quoted property names so the minifier preserves JavaScript private methods in dependencies:

```ts
import { defineConfig } from '@tarojs/cli';

export default defineConfig({
  h5: {
    useHtmlComponents: true,
  },
  terser: {
    config: {
      output: { quote_keys: false },
    },
  },
});
```

## Connect streaming text

Pass the complete text received so far, and use the request status to control `streaming`:

```tsx
import { Fluxdown } from '@fluxdown/taro';

type MessageProps = {
  text: string;
  pending: boolean;
};

export function Message({ text, pending }: MessageProps) {
  return <Fluxdown streaming={pending} text={text} />;
}
```

Set `pending` to `false` when the request ends. Fluxdown finishes any remaining smooth output before removing the trailing effect.

## Choose a component

| Component      | Entry                 | Preset                                         |
| -------------- | --------------------- | ---------------------------------------------- |
| `Fluxdown`     | `@fluxdown/taro`      | Full preset.                                   |
| `FluxdownLite` | `@fluxdown/taro/lite` | Basic Markdown and all four streaming effects. |
| `FluxdownRaw`  | `@fluxdown/taro/raw`  | Supply your own required `plugins` list.       |

The [plugin matrix](./plugins/matrix.mdx) lists the capabilities included in each preset.

## Next steps

- [Streaming content](./streaming.md): receive text and choose a trailing effect.
- [Styling guide](./customization.md): adjust themes, typography and spacing.
- [Configuration](./configuration.md): all props and their defaults.
- [Using and writing plugins](./plugins.md): customize components and interactions.
