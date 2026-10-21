# 减少打包体积

React Native 与 React 一样提供 Full、Lite 和 Raw 入口。先选择适合应用的预设，再按需加入单个插件。三种入口都使用原生组件、同一条流式处理管线，以及相同的主题和样式属性。

## Lite：显示代码和公式源码

从 `@fluxdown/react-native/lite` 导入 `FluxdownLite`。Lite 包含原生 Markdown 组件、patch 和四种流式效果。代码块显示不带语法颜色的源码；开启 `build={{ tex: true }}` 后，公式显示 LaTeX 源码。

```tsx
import { FluxdownLite } from '@fluxdown/react-native/lite';

export function Message({ text }: { text: string }) {
  return <FluxdownLite build={{ tex: true }} text={text} />;
}
```

此入口不会加载 Shiki、MathJax 或 SVG 公式渲染器。没有额外加入 SVG 公式插件时，Lite 不需要安装 `react-native-svg`。

Lite 使用 `@fluxdown/react-native-presets/lite` 导出的 `PRESET_LIGHT_PLUGINS`。每个插件包也可以从 `@fluxdown/react-native-presets/plugins/<目录>` 单独导入。

| 插件包               | 目录            | 行为                                   |
| -------------------- | --------------- | -------------------------------------- |
| `PatchPlugin`        | `patch`         | 用原生内容替换指定源码区间。           |
| `EffectShadPlugin`   | `effect-shad`   | 淡入流式输出的末尾文字。               |
| `EffectScalePlugin`  | `effect-scale`  | 为新显示的字符添加入场效果。           |
| `EffectChunkPlugin`  | `effect-chunk`  | 让新出现的一组文字淡入。               |
| `EffectSuffixPlugin` | `effect-suffix` | 在可见内容后跟随光标或圆点。           |
| `CodePlugin`         | `code`          | 显示代码容器、标题栏和纯文本源码。     |
| `EmphasisPlugin`     | `emphasis`      | 渲染斜体。                             |
| `ImagePlugin`        | `image`         | 渲染图片并检查 URL。                   |
| `LinkPlugin`         | `link`          | 渲染链接并检查 URL。                   |
| `ListPlugin`         | `list`          | 渲染有序、无序和任务列表。             |
| `ParagraphPlugin`    | `paragraph`     | 渲染段落。                             |
| `StrongPlugin`       | `strong`        | 渲染粗体。                             |
| `TablePlugin`        | `table`         | 渲染表格及对齐的单元格。               |
| `TexPlugin`          | `tex`           | 显示 LaTeX 源码。                      |
| `HeadingPlugin`      | `heading`       | 渲染一至六级标题。                     |
| `BreakLinePlugin`    | `break-line`    | 渲染换行。                             |
| `BlockquotePlugin`   | `blockquote`    | 渲染引用。                             |
| `FallbackPlugin`     | `fallback`      | 渲染普通文字、行内代码和其余基础节点。 |

## Full：高亮与公式排版

从 `@fluxdown/react-native` 或显式的 `@fluxdown/react-native/full` 导入 `Fluxdown`。Full 用 `CodeShikiPlugin` 和 `TexMathjaxPlugin` 替换 Lite 的代码与公式插件。代码使用 Shiki 高亮；公式按需加载 MathJax，通过原生 SVG 显示。转换加载期间或失败时，公式源码仍然可读。

```tsx
import { Fluxdown } from '@fluxdown/react-native/full';

export function Message({ text }: { text: string }) {
  return <Fluxdown build={{ tex: true }} text={text} />;
}
```

Full 使用 `@fluxdown/react-native-presets/full` 导出的 `PRESET_FULL_PLUGINS`。请按[快速上手](./quick-start.md)安装 `react-native-svg`。React 的 Full 预设使用不同的公式后端；原生预设不引入 WebView 或 DOM 渲染器。

## 为 Lite 添加能力

安装 `@fluxdown/react-native-presets`，然后只导入需要的插件包：

```tsx
import { FluxdownLite } from '@fluxdown/react-native/lite';
import { CodeShikiPlugin } from '@fluxdown/react-native-presets/plugins/code-shiki';

const plugins = [CodeShikiPlugin];

export function Message({ text }: { text: string }) {
  return <FluxdownLite plugins={plugins} text={text} />;
}
```

从 `@fluxdown/react-native-presets/plugins/tex-mathjax` 导入 `TexMathjaxPlugin`，并安装 `react-native-svg`，即可加入 SVG 公式渲染。传入的插件优先于预设。覆盖 Full 的插件不会移除 Full 已经导入的重依赖。

## Raw：自行选择插件

`FluxdownRaw` 的 `plugins` 属性必填。它提供原生根节点、主题和基础节点 slot，由你选择渲染与组件插件：

```tsx
import { FluxdownRaw } from '@fluxdown/react-native/raw';
import { FallbackPlugin } from '@fluxdown/react-native-presets/plugins/fallback';
import { ParagraphPlugin } from '@fluxdown/react-native-presets/plugins/paragraph';

const plugins = [FallbackPlugin, ParagraphPlugin];

export function Message({ text }: { text: string }) {
  return <FluxdownRaw plugins={plugins} text={text} />;
}
```

加入应用所开启的 Markdown 语法与效果对应的插件。需要完整的 Lite 基线又希望显式指定预设时，使用 `plugins={PRESET_LIGHT_PLUGINS}`。自定义插件包与 slot 的写法见[使用与编写插件](./plugins.md)。
