# Emoji shortcodes

`EmojiPlugin` converts GitHub-style emoji shortcodes such as `:smile:` and `:+1:` into Unicode emoji. [React Full](../../react/plugins/matrix.mdx) includes it by default; React Lite can add it as needed.

```tsx
import { Fluxdown } from 'fluxdown';

export function Message() {
  return <Fluxdown text="Hello :smile: Great work :+1:" />;
}
```

The output is “Hello 😄 Great work 👍”. Emoji use the system font, so their appearance depends on the device.

## Supported content

Shortcodes are converted in Markdown text, including headings, lists, tables, and link labels. Unknown shortcodes and unfinished input such as `:smile` remain unchanged. During streaming, a recognized shortcode becomes an emoji when its closing colon arrives.

Inline code and fenced code blocks preserve their source. For example, `` `:smile:` `` displays `:smile:` rather than an emoji.

## Import the plugin

React Full already includes `EmojiPlugin`, so no registration is needed. For Core or React Lite, add the plugin explicitly.

### Core

Install the Core presets package:

```sh
pnpm add @fluxdown/core-plugins
```

Add `EmojiRemarkPlugin` to the `remarks` input from the [Core quick start](../../core/quick-start.md):

```ts
import { EmojiRemarkPlugin } from '@fluxdown/core-plugins/plugins/remark/emoji';

const remarks = [EmojiRemarkPlugin];
```

### React Lite

Install the React presets package:

```sh
pnpm add @fluxdown/react-base-plugins
```

```tsx
import { EmojiPlugin } from '@fluxdown/react-base-plugins/plugins/emoji';
import { FluxdownLite } from 'fluxdown/lite';

type MessageProps = {
  text: string;
};

export function Message({ text }: MessageProps) {
  return <FluxdownLite plugins={EmojiPlugin} text={text} />;
}
```

## Disable conversion

After installing `@fluxdown/react-base-plugins`, include `EmojiPlugin` and `config` in the same plugin pack to keep shortcodes as text:

```tsx
import { EmojiPlugin } from '@fluxdown/react-base-plugins/plugins/emoji';
import { Fluxdown } from 'fluxdown';

type MessageProps = {
  text: string;
};

export function Message({ text }: MessageProps) {
  return (
    <Fluxdown
      plugins={{
        ...EmojiPlugin,
        config: {
          'remark-emoji': { disabled: true },
        },
      }}
      text={text}
    />
  );
}
```
