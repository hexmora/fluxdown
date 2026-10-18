# 快速开始

`@fluxdown/core` 把持续变化的 Markdown 转成可订阅的内容块。它与框架无关，也不依赖浏览器；你决定每个内容块最终成为组件、数据，还是其他形式的输出。

用它构建框架集成、自定义渲染器，或一条响应式的 Markdown 处理流程。

如果需要开箱即用的组件，请从 [React](../react/quick-start.md) 或 [React Native](../react-native/quick-start.md) 开始。

## 安装

```sh
pnpm add @fluxdown/core @fluxdown/types stative
pnpm add -D @types/hast
```

> 示例用到公开的内容块和 HAST 类型，因此一并安装对应的类型包。

## 获取内容块

先写一个最小渲染器：直接返回内容块本身，便于读取它的 HTML 语法树（HAST）。

```ts
import type { HastRoot } from '@fluxdown/core';
import type { IBlockState } from '@fluxdown/types';
import type { ElementContent, Parent } from 'hast';

import { BaseRenderer, Core } from '@fluxdown/core';
import { D, MutableState, render, S } from 'stative';

type MarkdownBlock = IBlockState<HastRoot>;

class BlocksRenderer extends BaseRenderer<
  HastRoot,
  ElementContent,
  Parent,
  MarkdownBlock
> {
  protected renderItem(block: MarkdownBlock): MarkdownBlock {
    return block;
  }
}

const text = MutableState.of('# 你好，Fluxdown');

const build = {
  repair: true,
  repairEnding: true,
  footnote: false,
  tex: false,
  indentedCode: false,
  setextHeading: false,
};

const core = render(
  S([
    Core<MarkdownBlock>,
    {
      Renderer: D(BlocksRenderer),
      text,
      build,
      patches: [],
      renders: [],
    },
  ]),
);

const readTrees = () => core.value.value.map((block) => block.value.value);

console.log(readTrees());

text.next(text.value + '\n\n内容正在**继续生成');
console.log(readTrees());

core.destroy();
text.destroy();
```

这里有三个角色：

- `text` 保存当前完整的 Markdown。调用 `next` 后，输出随之更新。
- `BlocksRenderer` 决定输出形式。示例保留内容块，实际应用可以返回目标框架的组件。
- `core` 连接输入与输出。`core.value.value` 是当前输出列表，`block.value.value` 是该块的当前 HAST。

`S` 和 `render` 用来创建这条响应式数据流；`D` 把渲染器类作为普通值传入。它们来自 [stative](../../stative/index.md)。

## 内置什么

Core 默认包含 Markdown 语法、HTML 处理、语法修复与流式映射预设。`build` 决定启用哪些编译能力；平滑输出和末尾渐变默认关闭，可以[单独启用](./streaming.md#启用平滑输出)。

Core 不提供默认 UI。示例中的 `renders: []` 表示这个渲染器直接使用内容块，不需要节点渲染插件。

## 接下来

阅读[状态与更新](./streaming.md)，了解如何接入持续变化的文本，以及如何在自己的界面里订阅内容块。
