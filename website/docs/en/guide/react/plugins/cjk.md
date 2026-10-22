# CJK plugin

`CjkPlugin` improves Markdown parsing for Chinese, Japanese, and Korean text. It recognizes emphasis, strong emphasis, and strikethrough next to CJK punctuation, and keeps that punctuation out of bare URLs.

The plugin is optional. Neither Lite nor Full includes it by default.

## Enable CJK support

Install the extension package:

```sh
pnpm add @fluxdown/react-presets
```

Import `CjkPlugin` and pass it through `plugins`:

```tsx
import { CjkPlugin } from '@fluxdown/react-presets/plugins/cjk';
import { FluxdownLite } from 'fluxdown/lite';

export function Message({ text }: { text: string }) {
  return <FluxdownLite plugins={CjkPlugin} text={text} />;
}
```

The same plugin works with `Fluxdown` from `fluxdown`. To combine it with other plugins, pass an array such as `plugins={[CjkPlugin, TexKatexPlugin]}`. See [Using and writing plugins](../plugins.md) for plugin configuration.

## Supported syntax

Markdown delimiters can appear next to CJK punctuation without adding spaces:

```md
这是**加粗。**文字。
これは*強調。*です。
이것은~~삭제。~~입니다.
```

Bare URLs stop before `。．，、？！：；（）【】「」『』〈〉《》`. For example, `https://example.com。` links to `https://example.com` and leaves `。` as ordinary text.

Explicit Markdown links and code keep their original content. For example, `[link](https://example.com/路径。)` preserves its destination, and punctuation inside inline or fenced code is unchanged.

## Use with Core

For a framework-independent integration, register `CjkRemarkPlugin` in `remarks`. See [Remark plugins](../../core/plugins/remark.md#cjk-support) for the Core setup.
