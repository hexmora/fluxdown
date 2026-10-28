# Streaming content

Pass the complete text received so far to `text`. Use `streaming` to control unfinished syntax repair, smooth output and trailing effects. Your request layer handles the transport and cancellation.

## Receive text

When a request returns individual chunks, append them before updating the component:

```ts
type TextListener = (text: string) => void;

async function readMarkdown(
  chunks: AsyncIterable<string>,
  onText: TextListener,
) {
  let text = '';

  for await (const chunk of chunks) {
    text += chunk;

    onText(text);
  }
}
```

Call `readMarkdown(chunks, setText)` from your request handler. Set the pending state to `true` when the request starts, then to `false` when it completes, fails or is cancelled. If your request library already returns accumulated text, pass it directly as in the [quick start](./quick-start.md#connect-streaming-text).

## Adjust the output

`streaming={true}` enables trailing repair, smooth output and the `scale` effect. Pass an object to configure each part:

```tsx
import { Fluxdown } from '@fluxdown/taro';

type MessageProps = {
  text: string;
  pending: boolean;
};

export function Message({ text, pending }: MessageProps) {
  return (
    <Fluxdown
      streaming={
        pending && {
          repairEnding: true,
          smooth: true,
          effect: ['shad', { length: 3, maskWidth: 18 }],
        }
      }
      text={text}
    />
  );
}
```

| Option         | Purpose                                                                   |
| -------------- | ------------------------------------------------------------------------- |
| `repairEnding` | Repair unfinished Markdown. Enabled by default.                           |
| `smooth`       | Reveal incoming content smoothly. Enabled by default.                     |
| `effect`       | Choose a trailing effect. Defaults to `scale`; use `false` to disable it. |

Turn off `smooth` to keep the original chunk timing. See [Core streaming](../core/streaming.md) for custom tickers and schedulers.

## Four trailing effects

| Effect   | Presentation                                                |
| -------- | ----------------------------------------------------------- |
| `scale`  | New text sharpens as it grows to its final size.            |
| `shad`   | A gradient mask gently reveals the trailing text.           |
| `chunk`  | Each incoming chunk fades in. Use with `smooth: false`.     |
| `suffix` | A trailing marker indicates that content is still arriving. |

For example, preserve incoming chunks and fade them in one at a time:

```tsx
<Fluxdown
  streaming={pending && { smooth: false, effect: 'chunk' }}
  text={text}
/>
```

`effect` also accepts `[name, options]` or an array of effects. See [Configuration](./configuration.md) for details and [Animation](../common/streaming-effects/animation/index.mdx) for interactive examples.

## Finish or switch messages

Set `streaming` to `false` when generation ends. The component finishes any remaining smooth output before removing the trailing effect.

Give each message its own component and use a stable message identifier as its `key`. A different key creates fresh streaming state:

```tsx
<Fluxdown key={message.id} streaming={message.pending} text={message.text} />
```
