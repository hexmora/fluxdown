# Streaming

Append incoming chunks to a signal and pass it to `text`. The `streaming` input controls unfinished syntax repair, smooth output, and entrance effects.

## Connect a text stream

This example receives an async iterator of decoded text. Keep SSE or other protocol decoding in your request layer:

```ts
import { Component, signal } from '@angular/core';
import { Fluxdown } from '@fluxdown/angular';

@Component({
  selector: 'app-message',
  imports: [Fluxdown],
  template: `<fluxdown [text]="text()" [streaming]="pending()" />`,
})
export class Message {
  readonly text = signal('');

  readonly pending = signal(false);

  async read(chunks: AsyncIterable<string>) {
    this.text.set('');

    this.pending.set(true);

    try {
      for await (const chunk of chunks) {
        this.text.update((text) => text + chunk);
      }
    } finally {
      this.pending.set(false);
    }
  }
}
```

Call `read(chunks)` after starting a request. Disable `streaming` when it ends to show all received content and remove the trailing marker.

## Adjust output

`streaming: true` enables ending repair, smooth output, and the `scale` effect. Use an object to control them separately:

```ts
import type { StreamingConfig } from '@fluxdown/angular';

import { Component, input } from '@angular/core';
import { Fluxdown } from '@fluxdown/angular';

@Component({
  selector: 'app-message',
  imports: [Fluxdown],
  template: `<fluxdown [text]="text()" [streaming]="pending() && streaming" />`,
})
export class Message {
  readonly text = input.required<string>();

  readonly pending = input(false);

  readonly streaming: StreamingConfig = {
    repairEnding: true,
    smooth: true,
    effect: ['shad', { length: 6, duration: 600 }],
  };
}
```

> Import `StreamingConfig` from `@fluxdown/angular`.

| Option         | Purpose                                                            |
| -------------- | ------------------------------------------------------------------ |
| `repairEnding` | Repairs unfinished Markdown; enabled by default.                   |
| `smooth`       | Reveals new content gradually; enabled by default.                 |
| `effect`       | Selects an effect; defaults to `scale`. Use `false` to disable it. |

## Four effects

| Effect   | Appearance                                                |
| -------- | --------------------------------------------------------- |
| `scale`  | New characters grow and become clear as their blur fades. |
| `shad`   | Each newly visible character fades in on its own clock.   |
| `chunk`  | Fades in received chunks; useful with `smooth: false`.    |
| `suffix` | Shows a trailing marker while content is being generated. |

Keep the original network chunks and fade them in individually:

```html
<fluxdown
  [text]="text()"
  [streaming]="pending() && { smooth: false, effect: 'chunk' }"
/>
```

`effect` also accepts `[name, config]` or an array of effects. See [configuration](./configuration.md) for the fields and [animation effects](../common/streaming-effects/animation/index.mdx) for live examples. Custom drivers and interpolation are covered in [Core streaming](../core/streaming.md).

## Multiple messages

Give each message its own component, and track it by message ID in `@for` so a different message gets its own playback state:

```html
@for (message of messages(); track message.id) {
<fluxdown [text]="message.text" [streaming]="message.pending" />
}
```
