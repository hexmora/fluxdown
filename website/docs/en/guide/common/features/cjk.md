# CJK support

`CjkPlugin` improves Markdown parsing for Chinese, Japanese, and Korean text. It recognizes emphasis, strong emphasis, and strikethrough next to CJK punctuation, and keeps that punctuation out of bare URLs. [React Full](../../react/plugins/matrix.mdx) includes it by default; React Lite can add it as needed.

```tsx
import { Fluxdown } from 'fluxdown';

export function Message() {
  return <Fluxdown text="这是**加粗。**文字。" />;
}
```

The text `加粗。` is bold, without requiring spaces around the delimiters.

## Supported content

Markdown delimiters can appear next to CJK punctuation:

```md
这是**加粗。**文字。
これは*強調。*です。
이것은~~삭제。~~입니다.
```

Bare URLs end before `。．，、？！：；（）【】「」『』〈〉《》`. For example, `https://example.com。` links to `https://example.com`, leaving the final `。` as ordinary text.

Explicit Markdown links and code preserve their content. The URL in `[link](https://example.com/路径。)` stays unchanged, as does punctuation inside inline code and fenced code blocks.

## Import the plugin

React Full already includes `CjkPlugin`, so no registration is needed. For Core or React Lite, add the plugin explicitly.

### Core

Install the Core presets package:

```sh
pnpm add @fluxdown/core-plugins
```

Add `CjkRemarkPlugin` to the `remarks` input from the [Core quick start](../../core/quick-start.md):

```ts
import { CjkRemarkPlugin } from '@fluxdown/core-plugins/plugins/remark/cjk';

const remarks = [CjkRemarkPlugin];
```

### React Lite

Install the React presets package:

```sh
pnpm add @fluxdown/react-base-plugins
```

```tsx
import { CjkPlugin } from '@fluxdown/react-base-plugins/plugins/cjk';
import { FluxdownLite } from 'fluxdown/lite';

type MessageProps = {
  text: string;
};

export function Message({ text }: MessageProps) {
  return <FluxdownLite plugins={CjkPlugin} text={text} />;
}
```

## Disable CJK support

After installing `@fluxdown/react-base-plugins`, include `CjkPlugin` and `config` in the same plugin pack to restore default Markdown punctuation handling:

```tsx
import { CjkPlugin } from '@fluxdown/react-base-plugins/plugins/cjk';
import { Fluxdown } from 'fluxdown';

type MessageProps = {
  text: string;
};

export function Message({ text }: MessageProps) {
  return (
    <Fluxdown
      plugins={{
        ...CjkPlugin,
        config: {
          'remark-cjk': { disabled: true },
        },
      }}
      text={text}
    />
  );
}
```
