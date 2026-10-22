# CJK 插件

`CjkPlugin` 改善中文、日文和韩文的 Markdown 解析，支持 CJK 标点附近的斜体、加粗与删除线，并避免把这些标点包含在自动识别的裸链接中。

这是一个可选插件，Lite 和 Full 默认都不包含它。

## 启用 CJK 支持

安装扩展包：

```sh
pnpm add @fluxdown/react-presets
```

导入 `CjkPlugin`，通过 `plugins` 传入：

```tsx
import { CjkPlugin } from '@fluxdown/react-presets/plugins/cjk';
import { FluxdownLite } from 'fluxdown/lite';

export function Message({ text }: { text: string }) {
  return <FluxdownLite plugins={CjkPlugin} text={text} />;
}
```

从 `fluxdown` 导入的 `Fluxdown` 也可以使用同一个插件。需要与其他插件组合时，传入数组，例如 `plugins={[CjkPlugin, TexKatexPlugin]}`。插件配置方式见[使用与编写插件](../plugins.md)。

## 支持的语法

Markdown 定界符可以紧邻 CJK 标点，无需额外添加空格：

```md
这是**加粗。**文字。
これは*強調。*です。
이것은~~삭제。~~입니다.
```

自动识别的裸链接在 `。．，、？！：；（）【】「」『』〈〉《》` 前结束。例如，`https://example.com。` 的链接地址是 `https://example.com`，末尾的 `。` 保留为普通文本。

显式 Markdown 链接和代码保留原有内容。例如，`[link](https://example.com/路径。)` 的目标地址保持不变，行内代码和围栏代码块中的标点也不受影响。

## 在 Core 中使用

框架无关的集成可以通过 `remarks` 注册 `CjkRemarkPlugin`。接入方式见 [Remark 插件](../../core/plugins/remark.md#cjk-支持)。
