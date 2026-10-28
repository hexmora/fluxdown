# Streaming content

Append incoming chunks to a reactive string and pass it to `text`. `streaming` controls unfinished syntax repair, smooth output and trailing effects.

## Connect a text stream

This example consumes an async iterator of text. Decode SSE or other transport formats in your request layer:

```vue
<script setup lang="ts">
import { Fluxdown } from '@fluxdown/uni-app';
import { ref } from 'vue';

const text = ref('');

const pending = ref(false);

async function read(chunks: AsyncIterable<string>) {
  text.value = '';

  pending.value = true;

  try {
    for await (const chunk of chunks) {
      text.value += chunk;
    }
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <Fluxdown :text="text" :streaming="pending" />
</template>
```

Call `read(chunks)` after starting the request. Turn off `streaming` when the response ends. The component finishes any remaining smooth output before removing the trailing effect.

## Adjust the output

`streaming: true` enables trailing repair, smooth output and the `scale` effect. Pass an object to configure each part:

```vue
<script setup lang="ts">
import type { StreamingConfig } from '@fluxdown/uni-app';

import { Fluxdown } from '@fluxdown/uni-app';

type MessageProps = {
  text: string;
  pending: boolean;
};

const props = defineProps<MessageProps>();

const streaming: StreamingConfig = {
  repairEnding: true,
  smooth: true,
  effect: ['shad', { length: 3, maskWidth: 18 }],
};
</script>

<template>
  <Fluxdown :text="props.text" :streaming="props.pending && streaming" />
</template>
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

For example, preserve network chunks and fade them in one at a time:

```vue
<Fluxdown
  :text="text"
  :streaming="pending && { smooth: false, effect: 'chunk' }"
/>
```

`effect` also accepts `[name, options]` or an array of effects. See [configuration](./configuration.md) for details and [Animation](../common/streaming-effects/animation/index.mdx) for demos of all four effects.

## Switch messages

Give each message its own component and use the message identifier as its `key`. The component creates fresh streaming state when a different message replaces it.

```vue
<Fluxdown :key="message.id" :text="message.text" :streaming="message.pending" />
```
