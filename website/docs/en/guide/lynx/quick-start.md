# Quick start

Fluxdown for Lynx renders Markdown as Lynx `text`, `view` and other elements. Built on Core, it provides syntax repair, smooth streaming and replaceable render slots.

## Install

Add the package to an existing ReactLynx project:

```sh
pnpm add @fluxdown/lynx
```

The package preserves JSX for your project's `@lynx-js/react-rsbuild-plugin` to compile. Component imports include the required styles, so there is no separate stylesheet to load.

## Render your first message

```tsx
import { Fluxdown } from '@fluxdown/lynx';

const markdown = `# Hello, Fluxdown

Keep content **easy to read**, even while it is arriving.`;

export default function App() {
  return (
    <scroll-view scroll-orientation="vertical" style={{ height: '100%' }}>
      <Fluxdown style={{ padding: '20px' }} text={markdown} />
    </scroll-view>
  );
}
```

The component lays out the content; the surrounding page handles scrolling. In a chat list, use it as the message body. Connect navigation and code copying to your app through [slot plugins](./plugins/slot.md).

## Connect streaming text

```tsx
<Fluxdown streaming={isStreaming} text={text} />
```

Always pass the complete text received so far as `text`. Set `streaming` to `false` when the request ends.

## Next steps

- [Streaming content](./streaming.md): control smoothing and trailing effects.
- [Styling](./customization.md): adjust colors, fonts and spacing.
- [Plugin matrix](./plugins/matrix.mdx): choose Full, Lite or your own set.
- [Side-by-side demo](../common/features/renderers.mdx): explore static and streaming output in React, Vue, React Native, Lynx, Solid, and Taro together.
