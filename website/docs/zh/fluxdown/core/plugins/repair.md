# Repair 插件

Repair 插件在 Markdown AST 转成 HAST 之前对其进行二次处理。它可以修复未完成的语法、整理节点边界，或添加临时展示内容，而不改写原始字符串。

## 声明插件

接收内容时，在末尾加一个生成中的指示点；接收结束后，它会自动消失：

```ts
import type {
  RepairPluginRunner,
  RepairPluginSystemConfig,
} from '@fluxdown/types';

import { BaseRepairPlugin } from '@fluxdown/core-presets/repair';
import { PluginPriority } from '@fluxdown/types';

class StreamingIndicatorPlugin extends BaseRepairPlugin {
  static readonly key = 'repair-streaming-indicator';

  readonly config: RepairPluginSystemConfig = {
    ending: true,
    priority: PluginPriority.Lowest,
  };

  readonly runner: RepairPluginRunner = ({ node, break: stop }) => {
    if (node.type !== 'root' || !('children' in node)) {
      return;
    }

    node.children.push({
      type: 'html',
      value: '<span class="indicator"></span>',
    });

    stop();
  };
}

const repairs = [StreamingIndicatorPlugin];
```

插件在内置修复完成后，向当前末尾内容块追加一个带 `indicator` 类的 HTML 节点。`stop()` 结束本次遍历，确保只插入一次。

## 接入 Core

在[快速开始](../quick-start.md)的 Core 输入中加入 `repairs`，并开启 `build.repair` 和 `build.repairEnding`。

`ending: true` 让插件只作用于正在生成的最后一个内容块。接收结束时将 `repairEnding` 设为 `false`，指示点就会移除；原始 Markdown 始终保持不变。

内置 HTML 处理已允许 `span` 的 `class` 属性。使用 HTML 渲染器时，添加少量样式即可显示这个点：

```css
.indicator {
  display: inline-block;
  width: 0.5em;
  height: 0.5em;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.45;
}
```

> 遍历设置放在 `config` 中，插件自身的构造选项用独立字段保存。Core 负责执行 runner 和管理生命周期。

## 内置插件

Core 默认包含以下插件，无需手动注册。

`PRESET_REPAIR_PLUGINS`，从 `@fluxdown/core-presets/repair` 导入。

修复由 `build.repair` 控制。下表第一组面向生成过程中的临时末尾状态，还需要 `build.repairEnding`。

### 正在生成的末尾

| 插件                                 | 作用                                                                |
| ------------------------------------ | ------------------------------------------------------------------- |
| `TrailingEscapeRepairPlugin`         | 暂时隐藏末尾尚未形成转义的单个反斜杠。                              |
| `TrailingEmptyCodeBlockRepairPlugin` | 暂不展示末尾还没有语言和内容的空代码围栏。                          |
| `IncompleteCodeFenceRepairPlugin`    | 隐藏末尾尚未写完整的代码围栏反引号，避免混入代码正文。              |
| `IncompleteInlineCodeRepairPlugin`   | 将尚未闭合的行内代码先作为代码呈现。                                |
| `IncompleteImageRepairPlugin`        | 为未完成的图片提供占位，或通过 `strategy: 'discard'` 暂时隐藏。     |
| `IncompleteLinkRepairPlugin`         | 将未完成的链接先按链接文字显示，等待地址补全。                      |
| `TrailingEmptyHeadingRepairPlugin`   | 暂不展示只有 `#`、还没有文字的末尾一级标题。                        |
| `IncompleteStrongRepairPlugin`       | 提前呈现尚未闭合的加粗内容。                                        |
| `IncompleteEmphasisRepairPlugin`     | 提前呈现以星号开头、尚未闭合的斜体内容。                            |
| `IncompleteListMarkerRepairPlugin`   | 隐藏末尾孤立的列表标记，等待列表正文。                              |
| `DanglingFootnoteRepairPlugin`       | 暂时隐藏未解析的脚注引用和末尾未完成的引用；需要 `build.footnote`。 |

### 排版边界整理

下面这些插件在 `build.repair` 开启时工作，不要求开启 `repairEnding`。

| 插件                                   | 作用                                                         |
| -------------------------------------- | ------------------------------------------------------------ |
| `IncompleteHtmlTagRepairPlugin`        | 隐藏末尾没有写完整的 HTML 标签片段。                         |
| `RedundantBreakBeforeHtmlRepairPlugin` | 移除 HTML 片段前多余的换行节点。                             |
| `HtmlBoundaryLineBreakRepairPlugin`    | 保留文本与 HTML 交界处应当显示的换行。                       |
| `ParagraphHtmlClosureRepairPlugin`     | 为已经结束的段落补齐未闭合的 HTML 标签，避免影响后面的内容。 |
| `RedundantTrailingBreakRepairPlugin`   | 清理内容结尾多余的换行。                                     |
| `AdjacentTextRepairPlugin`             | 合并相邻文字、清理空文字，让修复后的内容保持整洁。           |

修复影响当前展示，不会改写应用保存的 Markdown 原文。
