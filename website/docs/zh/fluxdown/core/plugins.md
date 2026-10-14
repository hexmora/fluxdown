# 使用与编写插件

插件用于扩展内容处理流程中的一个环节。先确定想改变的行为属于哪一层，再选择对应的插件：

| 类型     | 职责                                   | 使用指南                                  |
| -------- | -------------------------------------- | ----------------------------------------- |
| `remark` | 语法解析。                             | [扩展 Markdown 语法](./plugins/remark.md) |
| `repair` | AST 二次处理，包括修复尚未完成的语法。 | [处理 Markdown AST](./plugins/repair.md)  |
| `rehype` | HAST 二次处理。                        | [处理 HTML 语法树](./plugins/rehype.md)   |
| `mapper` | 响应式映射 HAST 内容块。               | [映射响应式内容](./plugins/mapper.md)     |

Core 已内置常见语法、修复、HTML 处理和平滑输出能力。各子页末尾列出对应的内置插件；优先调整它们的选项，需要新行为时再编写插件。

## 配置预设

插件输入支持三种形式：插件列表、按名称配置的对象，以及 `[插件列表, 配置对象]`。在 `S` 中传静态配置时，使用元组形式：

```ts
type RepairOptions = [[], RepairConfigs];

const repairs: RepairOptions = [
  [],
  { 'repair-incomplete-image': { strategy: 'discard' } },
];
```

[创建 Core](./quick-start.md) 时，把 `repairs` 与 `text`、`build` 一起传入。这样会暂时隐藏未完成的图片，同时保留其他预设。

也可以直接导入插件类并配置：

```sh
pnpm add @fluxdown/core-presets
```

```ts
import type { IPluggable, IRepairPlugin } from '@fluxdown/types';

import { IncompleteImageRepairPlugin } from '@fluxdown/core-presets/repair';

type RepairPlugin = IPluggable<IRepairPlugin, unknown>;

const repairs: RepairPlugin[] = [
  [IncompleteImageRepairPlugin, { strategy: 'discard' }],
];
```

已有的预设类会留在原来的位置，并使用新选项；新的插件类会加入列表。如果同时通过类元组和名称配置同一个选项，按名称提供的配置优先。

> Core 加载的预设类型声明会提供 `RemarkConfigs`、`RehypeConfigs`、`RepairConfigs` 和 `MapperConfigs`，无需单独导入这些名称。

## 禁用或调整顺序

四类插件都支持 `disabled` 和 `priority`：

```ts
type RemarkOptions = [[], RemarkConfigs];

const remarks: RemarkOptions = [
  [],
  { 'remark-syntax-soft-endline': { disabled: true } },
];
```

这会保留 Markdown 的普通换行行为，不再将其转成硬换行。同一类插件中，`priority` 越小越早执行；优先级相同时保持声明顺序。

## 编写插件

remark 和 rehype 插件用于接入 unified 插件；repair 插件访问并修改 Markdown AST 节点；mapper 则使用 Stative 构建持续变化的 HAST 内容块列表。

各子页分别介绍声明方式和如何接入：

- [Remark 插件](./plugins/remark.md)
- [Repair 插件](./plugins/repair.md)
- [Rehype 插件](./plugins/rehype.md)
- [Mapper 插件](./plugins/mapper.md)

传入插件类或 mapper 函数即可，由 Core 管理生命周期。每次运行的数据应留在转换函数或状态流内，让同一个声明可以用于多份内容。

> 预设从 `/remark`、`/rehype`、`/repair` 或 `/mapper` 导入。`@fluxdown/core-presets` 没有根入口。
