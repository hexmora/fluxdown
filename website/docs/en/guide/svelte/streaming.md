# Streaming

Pass accumulated text through `text` and use the request state for `streaming`. Svelte updates the content as props change; no manual refresh is needed.

```svelte
<script lang="ts">
  import { Fluxdown } from '@fluxdown/svelte';

  type MessageProps = {
    text: string;
    pending: boolean;
  };

  let { text, pending }: MessageProps = $props();
</script>

<Fluxdown streaming={pending} {text} />
```

If your source provides incremental chunks, concatenate them in your application first.

## Smoothing and effects

Setting `streaming` to `true` enables trailing repair, smoothing and the `scale` effect. Pass an object to adjust them individually:

```svelte
<Fluxdown
  streaming={pending && { repairEnding: true, smooth: true, effect: 'shad' }}
  {text}
/>
```

Four effects are included:

- `scale`: reveals text from a smaller, blurred state.
- `shad`: fades each newly visible character in on its own clock.
- `chunk`: fades in newly received text segments.
- `suffix`: adds a pulsing cursor or dot at the end.

Use `chunk` with `smooth: false` to reveal the received chunks directly:

```svelte
<Fluxdown
  streaming={pending && { smooth: false, effect: 'chunk' }}
  {text}
/>
```

Set `effect: false` to keep smoothing without a visual effect. See [Configuration](./configuration.md#streaming) for drivers, interpolation and combined effects.

## Finish or cancel

Set `streaming` to `false` when the request finishes, is cancelled or fails. The component displays all received content and removes trailing effects. Unmounting also cleans up its subscriptions and animations.

[Side-by-side demo](../common/features/renderers.mdx): explore static and streaming output in React, Vue, Svelte, React Native, Lynx, Solid, and Taro together.
