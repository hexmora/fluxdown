# Streaming content

Append incoming chunks to a signal and pass its value to `text`. `streaming` controls unfinished syntax repair, smooth output and trailing effects.

## Connect a text stream

This example accepts a function that starts a request and returns an async iterator of decoded text. Decode SSE or other transport formats in your request layer:

```tsx
import { Fluxdown } from '@fluxdown/solid';
import { createSignal } from 'solid-js';

type ConversationProps = {
  request: () => Promise<AsyncIterable<string>>;
};

export function Conversation(props: ConversationProps) {
  const [text, setText] = createSignal('');

  const [pending, setPending] = createSignal(false);

  async function read() {
    setText('');

    setPending(true);

    try {
      const chunks = await props.request();

      for await (const chunk of chunks) {
        setText((previous) => previous + chunk);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <section>
      <button disabled={pending()} onClick={read} type="button">
        Start
      </button>
      <Fluxdown text={text()} streaming={pending()} />
    </section>
  );
}
```

Turning off `streaming` reveals any remaining received content and removes the trailing marker. A new request starts with an empty `text` value.

## Adjust the output

`streaming={true}` enables trailing repair, smooth output and the `scale` effect. Pass an object to configure each part:

```tsx
import type { StreamingConfig } from '@fluxdown/solid';

import { Fluxdown } from '@fluxdown/solid';

type MessageProps = {
  text: string;

  pending: boolean;
};

const streaming: StreamingConfig = {
  repairEnding: true,
  smooth: true,
  effect: ['shad', { length: 3, maskWidth: 18 }],
};

export function Message(props: MessageProps) {
  return <Fluxdown text={props.text} streaming={props.pending && streaming} />;
}
```

> Import `StreamingConfig` from `@fluxdown/solid`.

| Option         | Purpose                                                                   |
| -------------- | ------------------------------------------------------------------------- |
| `repairEnding` | Repair unfinished Markdown at the end of the message. Defaults to `true`. |
| `smooth`       | Reveal received content gradually. Defaults to `true`.                    |
| `effect`       | Choose a trailing effect. Defaults to `scale`; use `false` to disable it. |

Set `smooth: false` to keep the timing of incoming chunks. The [configuration reference](./configuration.md#streamingsmooth) also covers custom tickers and schedulers.

## Four trailing effects

| Effect   | Presentation                                                |
| -------- | ----------------------------------------------------------- |
| `scale`  | New text sharpens as it grows to its final size.            |
| `shad`   | A gradient mask reveals the trailing text.                  |
| `chunk`  | Each incoming chunk fades in. Use with `smooth: false`.     |
| `suffix` | A trailing marker indicates that content is still arriving. |

For example, fade incoming chunks in without smoothing:

```tsx
<Fluxdown
  text={text()}
  streaming={pending() && { smooth: false, effect: 'chunk' }}
/>
```

`effect` also accepts `[name, options]` or an array of effects. See [configuration](./configuration.md#streamingeffect) for their defaults and [Animation](../common/streaming-effects/animation/index.mdx) for live demos.

## Switch messages

Keep each message's component mounted as its text changes. When one message replaces another, a keyed `Show` using the message ID gives it fresh streaming state:

```tsx
import { Fluxdown } from '@fluxdown/solid';
import { Show } from 'solid-js';

type MessageProps = {
  message: {
    id: string;

    text: string;

    pending: boolean;
  };
};

export function Message(props: MessageProps) {
  return (
    <Show when={props.message.id} keyed>
      {(id) => {
        return (
          <Fluxdown
            text={props.message.text}
            streaming={props.message.pending}
            data-message-id={id}
          />
        );
      }}
    </Show>
  );
}
```
