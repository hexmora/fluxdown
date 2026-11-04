---
title: React Lynx Markdown Renderer
description: Add Fluxdown to a React Lynx project and render Markdown with Lynx elements. Install the component, display a message, and connect streaming text.
---

# React Lynx Markdown renderer quick start {#quick-start}

Fluxdown for React Lynx renders Markdown as Lynx `text`, `view` and other elements. Built on Core, it provides syntax repair, smooth streaming and replaceable render slots.

## Install

Add the package to an existing React Lynx project:

```sh
pnpm add @fluxdown/react-lynx
```

Full code highlighting on Android requires Lynx 3.8 or later with background-thread WebAssembly support. See [code highlighting](./plugins/matrix.mdx#code-highlighting) for its asynchronous initialization and bundled WASM behavior.

The package preserves JSX for your project's `@lynx-js/react-rsbuild-plugin` to compile. Component imports include the required styles, so there is no separate stylesheet to load.

## Render your first message

```tsx
import { Fluxdown } from '@fluxdown/react-lynx';

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
- [Side-by-side demo](../common/features/renderers.mdx): explore static and streaming output in React, Vue, Svelte, Angular, React Native, React Lynx, Vue Lynx, Solid, Taro, and Uni App together.
