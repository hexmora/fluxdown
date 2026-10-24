# CJK 支持

`CjkPlugin` 改善中文、日文和韩文的 Markdown 解析，支持 CJK 标点附近的斜体、加粗与删除线，并避免把这些标点包含在自动识别的裸链接中。[React Full](../../react/plugins/matrix.mdx) 默认包含此插件，React Lite 可按需添加。

```tsx
import { Fluxdown } from 'fluxdown';

export function Message() {
  return <Fluxdown text="这是**加粗。**文字。" />;
}
```

其中「加粗。」会显示为粗体，无需在定界符两侧添加空格。

## 支持的内容

Markdown 定界符可以紧邻 CJK 标点：

```md
这是**加粗。**文字。
これは*強調。*です。
이것은~~삭제。~~입니다.
```

自动识别的裸链接在 `。．，、？！：；（）【】「」『』〈〉《》` 前结束。例如，`https://example.com。` 的链接地址是 `https://example.com`，末尾的 `。` 保留为普通文本。

显式 Markdown 链接和代码保留原有内容。`[link](https://example.com/路径。)` 的目标地址保持不变，行内代码和围栏代码块中的标点也不受影响。

## 引入插件

React Full 已内置 `CjkPlugin`，无需手动注册。使用 Core 或 React Lite 时，按下面的方式添加插件。

### Core

安装 Core 预设包：

```sh
pnpm add @fluxdown/core-plugins
```

在 [Core 快速开始](../../core/quick-start.md)的 `remarks` 输入中加入 `CjkRemarkPlugin`：

```ts
import { CjkRemarkPlugin } from '@fluxdown/core-plugins/plugins/remark/cjk';

const remarks = [CjkRemarkPlugin];
```

### React Lite

安装 React 预设包：

```sh
pnpm add @fluxdown/react-base-plugins
```

```tsx
import { CjkPlugin } from '@fluxdown/react-base-plugins/plugins/cjk';
import { FluxdownLite } from 'fluxdown/lite';

export function Message({ text }: { text: string }) {
  return <FluxdownLite plugins={CjkPlugin} text={text} />;
}
```

## 关闭 CJK 支持

安装 `@fluxdown/react-base-plugins` 后，将 `CjkPlugin` 与 `config` 放在同一个插件包中，即可按需恢复默认的 Markdown 标点处理：

```tsx
import { CjkPlugin } from '@fluxdown/react-base-plugins/plugins/cjk';
import { Fluxdown } from 'fluxdown';

export function Message({ text }: { text: string }) {
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
