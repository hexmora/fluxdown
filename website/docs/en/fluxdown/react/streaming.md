# Streaming content

A streaming integration needs two things: the complete text received so far and whether generation is still in progress. Fluxdown manages the presentation, while you keep using your preferred request library.

## Pass accumulated text

If your request library already returns accumulated text, use the [Message example from the quick start](./quick-start.md#connect-streaming-text). If it returns individual chunks, collect them first:

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

Call `await readMarkdown(chunks, setText)` from your request handler and pass the `text` state to `Fluxdown`. Set `isStreaming` to `true` when the request begins, then to `false` when it completes, is cancelled, or fails. Your app continues to handle cancellation and error messages.

## Enable streaming effects

`streaming={true}` enables three features together:

| Option         | What readers see                                                          |
| -------------- | ------------------------------------------------------------------------- |
| `repairEnding` | Unfinished syntax at the end of the message gets a readable presentation. |
| `smooth`       | Large bursts of text appear gradually, reducing abrupt jumps.             |
| `shad`         | Newly revealed trailing characters fade in gently.                        |

You can also control them separately. For example, keep syntax repair and smooth output while turning off the fade:

```tsx
<Fluxdown
  streaming={{ repairEnding: true, smooth: true, shad: false }}
  text={text}
/>
```

Options omitted from this object default to `true`. To keep only syntax repair, set the other two to `false`:

```tsx
<Fluxdown
  streaming={{ repairEnding: true, smooth: false, shad: false }}
  text={text}
/>
```

## Adjust the trailing fade

```tsx
<Fluxdown
  streaming={{
    shad: { enabled: true, length: 3, maskWidth: 18 },
  }}
  text={text}
/>
```

`length` is the number of trailing characters included in the fade. `maskWidth` is the fade mask's width in pixels. The defaults work well for most interfaces; adjust them when you need to match your typography or motion style.

## Finish or replace a message

Keep appending to the same `text` while receiving a response. Clear it when a new response starts. In a message list, use a stable message ID as each component's `key` so that messages have independent state.

Set `streaming={false}` when generation finishes. This immediately shows all received text and stops the trailing repair and fade. Syntax repair only affects presentation; it does not rewrite the original Markdown you store.
