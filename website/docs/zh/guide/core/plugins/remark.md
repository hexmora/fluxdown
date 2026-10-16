# Remark 插件

Remark 插件参与 Markdown 到语法树 MDAST 的解析。需要扩展语法，或接入现有的 unified remark 插件时，使用这一层。

## 声明插件

例如，`remark-cjk-friendly` 可以改善中文、日文和韩文标点附近的强调语法解析：

```sh
pnpm add @fluxdown/core-presets remark-cjk-friendly
```

```ts
import { BaseRemarkPlugin } from '@fluxdown/core-presets/remark';
import remarkCjkFriendly from 'remark-cjk-friendly';

class CjkSyntaxPlugin extends BaseRemarkPlugin {
  static readonly key = 'remark-cjk-syntax';

  readonly plugin = remarkCjkFriendly;
}

const remarks = [CjkSyntaxPlugin];
```

`key` 标识插件，`plugin` 是用于注册语法扩展的 unified 插件。Core 已提供 Markdown 解析器，无需重复添加。

## 接入 Core

在[快速开始](../quick-start.md)的 Core 输入中加入 `remarks` 即可，其他预设继续保留。

如果 unified 插件需要选项，在类的构造函数中接收它们，再创建一个使用这些选项的 `plugin` 函数。使用时传入 `[YourPlugin, options]`。

> remark 扩展也可以转换 MDAST。如果处理需要跟随 Core 的修复开关，或仅作用于流式末尾，使用 [repair](./repair.md) 更合适。

## 内置插件

Core 默认包含以下插件，无需手动注册。

`PRESET_REMARK_PLUGINS`，从 `@fluxdown/core-presets/remark` 导入。

| 插件                              | 作用                                                         |
| --------------------------------- | ------------------------------------------------------------ |
| `ApplyRepairsRemarkPlugin`        | 应用修复插件，让未完成的 Markdown 适合当前展示阶段。         |
| `CodeMetaRemarkPlugin`            | 保留围栏代码块语言后面的附加信息，供渲染器使用。             |
| `PatchesRemarkPlugin`             | 标记需要由应用替换呈现的文本范围。                           |
| `SyntaxAutolinkRemarkPlugin`      | 把可识别的网址、邮箱等文字转换为链接。                       |
| `SyntaxFootnoteRemarkPlugin`      | 支持脚注引用与定义；需要 `build.footnote`。                  |
| `SyntaxHtmlAllowedRemarkPlugin`   | 控制 Markdown 中允许哪些原始 HTML 标签，其他标签按文字处理。 |
| `SyntaxMathRemarkPlugin`          | 支持数学公式及流式公式的中间状态；需要 `build.tex`。         |
| `SyntaxPolicyRemarkPlugin`        | 控制缩进代码块与 Setext 标题是否启用。                       |
| `SyntaxSoftEndlineRemarkPlugin`   | 将普通换行显示为换行。                                       |
| `SyntaxStrikethroughRemarkPlugin` | 支持删除线。                                                 |
| `SyntaxTableRemarkPlugin`         | 支持 Markdown 表格。                                         |
| `SyntaxTaskListRemarkPlugin`      | 支持带复选框的任务列表。                                     |
| `TableNoralizerRemarkPlugin`      | 补全表格列的对齐信息，适应行列数变化。                       |
