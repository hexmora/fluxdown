# Streaming content

Pass accumulated text to `text` and control `streaming` with your request state:

```tsx
import { Fluxdown } from '@fluxdown/lynx';

type MessageProps = {
  text: string;
  pending: boolean;
};

export function Message({ text, pending }: MessageProps) {
  return <Fluxdown streaming={pending} text={text} />;
}
```

If your data source provides incremental chunks, join them in your app before passing the result to the component.

## Smoothing and animation

Setting `streaming` to `true` enables trailing syntax repair, smoothing and the `scale` effect. Use an object to control them separately:

```tsx
<Fluxdown
  streaming={
    pending && {
      repairEnding: true,
      smooth: true,
      effect: 'shad',
    }
  }
  text={text}
/>
```

Four effects are included:

- `scale`: text appears from a blurred, smaller state.
- `shad`: a gradient progressively reveals trailing text.
- `chunk`: new text chunks fade in.
- `suffix`: a pulsing cursor or dot follows the text.

Parsing and streaming scheduling run on the background thread; Lynx elements present the effects. Smoothing uses an animation-frame clock when available, with a timer fallback. See [React configuration](../react/configuration.md#streaming) for clocks, schedulers and effect combinations.

## Finish or cancel

Set `streaming` to `false` when the request completes, is cancelled or fails. The component displays all text received so far and clears trailing effects.

[Side-by-side demo](../common/features/renderers.mdx): explore static and streaming output in React, Vue, Svelte, React Native, Lynx, Solid, Taro, and Angular together.
