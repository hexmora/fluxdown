# Emoji 短码

`EmojiPlugin` 将 `:smile:`、`:+1:` 等 GitHub 风格的 emoji 短码转换为 Unicode 表情。[React Full](../../react/plugins/matrix.mdx) 默认包含此插件，React Lite 可按需添加。

```tsx
import { Fluxdown } from 'fluxdown';

export function Message() {
  return <Fluxdown text="Hello :smile: Great work :+1:" />;
}
```

输出为「Hello 😄 Great work 👍」。表情使用系统字体，具体外观取决于设备。

## 支持的内容

短码可用于 Markdown 文本，包括标题、列表、表格和链接文字。未知短码，以及 `:smile` 这样尚未闭合的输入，会保留原文。流式输出时，已识别的短码在结尾冒号到达后转换为表情。

行内代码和围栏代码块保留源码。例如，`` `:smile:` `` 会显示 `:smile:`，不会转换为表情。

## 引入插件

React Full 已内置 `EmojiPlugin`，无需手动注册。使用 Core 或 React Lite 时，按下面的方式添加插件。

### Core

安装 Core 预设包：

```sh
pnpm add @fluxdown/core-plugins
```

在 [Core 快速开始](../../core/quick-start.md)的 `remarks` 输入中加入 `EmojiRemarkPlugin`：

```ts
import { EmojiRemarkPlugin } from '@fluxdown/core-plugins/plugins/remark/emoji';

const remarks = [EmojiRemarkPlugin];
```

### React Lite

安装 React 预设包：

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

## 关闭转换

安装 `@fluxdown/react-base-plugins` 后，将 `EmojiPlugin` 与 `config` 放在同一个插件包中，即可按需保留短码原文：

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
