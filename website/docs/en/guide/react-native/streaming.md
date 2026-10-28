# Streaming content

React Native shares the same streaming pipeline as React. Pass accumulated text and use the request state to control `streaming`:

```tsx
import { Fluxdown } from '@fluxdown/react-native';

type MessageProps = {
  text: string;
  pending: boolean;
};

export function Message({ text, pending }: MessageProps) {
  return <Fluxdown streaming={pending} text={text} />;
}
```

Always pass the full message. If your data source emits individual chunks, append them in your application first.

## Smoothing and animation

`streaming={true}` enables ending repair, smooth output, and the `scale` effect. Use an object to adjust them separately:

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

Native slots support `scale`, `shad`, `chunk`, and `suffix`. Smoothing uses the animation frames provided by React Native, while native components present the visual effects. Clocks, spring settings, and effect combinations follow the [shared streaming configuration](../react/configuration.md#streaming).

- `scale`: text fades in while growing and sharpening from a blurred state.
- `shad`: each newly visible character fades in on its own clock.
- `chunk`: each incoming text fragment fades in as a group.
- `suffix`: a cursor or dot pulses at the end of the text.

## Finish or cancel

Set `streaming` to `false` when the request finishes, is cancelled, or fails. Fluxdown displays all received content and clears the trailing effects. Your app can also pause its data source or visual effects when it enters the background.

[Side-by-side demo](../common/features/renderers.mdx): explore static and streaming output in React, Vue, Solid, React Native, and Lynx together.
