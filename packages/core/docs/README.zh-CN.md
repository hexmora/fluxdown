# @fluxdown/core

框架无关的流式 Markdown 处理引擎。

[文档](../../../website/docs/zh/guide/core/quick-start.md) · [English](../README.md)

`@fluxdown/core` 将不断变化的 Markdown 转为基于 HAST（HTML 语法树）的响应式内容块。它负责解析、语法修复和更新，由你的渲染器决定每个块如何输出。

Core 无需浏览器即可运行，适合构建自定义渲染器或框架集成。开箱即用的组件见 [React](../../react/docs/README.zh-CN.md)、[Vue 3](../../vue)、[Svelte 5](../../svelte)、[Angular](../../angular)、[React Native](../../react-native)、[Lynx](../../lynx)、[Solid](../../solid) 和 [Taro](../../taro)。

## 安装

```sh
pnpm add @fluxdown/core @fluxdown/types stative
pnpm add -D @types/hast
```

下面的示例从 `@fluxdown/types` 和 `@types/hast` 导入内容块与 HAST 的公共类型。

## 读取内容块

这个渲染器原样返回每个内容块，方便查看当前的语法树：

```ts
import type { BlockCompilerConfig, HastRoot } from "@fluxdown/core";
import type { IBlockState } from "@fluxdown/types";
import type { ElementContent, Parent } from "hast";

import { BaseRenderer, Core } from "@fluxdown/core";
import { D, MutableState, render, S } from "stative";

type MarkdownBlock = IBlockState<HastRoot>;

class BlocksRenderer extends BaseRenderer<HastRoot, ElementContent, Parent, MarkdownBlock> {
  protected renderItem(block: MarkdownBlock): MarkdownBlock {
    return block;
  }
}

const text = MutableState.of("# Hello, Fluxdown");
const build = MutableState.of<BlockCompilerConfig>({
  repair: true,
  repairEnding: true,
  footnote: false,
  tex: false,
  indentedCode: false,
  setextHeading: false,
});

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
text.next(text.value + "\n\nThe content **keeps growing");
console.log(readTrees());

// 流结束后，关闭尾部语法修复。
build.next({ ...build.value, repairEnding: false });

// 不再需要这些内容时，释放资源。
core.destroy();
text.destroy();
build.destroy();
```

`S` 描述计算，`render` 创建计算实例，`D` 将渲染器类作为普通值传入。它们都来自 Core 的响应式基础 [`stative`](../../stative)。

## 跟随内容更新

每条消息保留一个 Core 实例，并将当前的完整 Markdown 传给 `text.next()`。`core.value` 跟踪内容块列表，每个块的 `value` 跟踪块内内容。接入实时渲染器时，两层都需要订阅：已有块的内容可能改变，而列表和块的引用保持不变。订阅和清理方式见[状态与更新指南](../../../website/docs/zh/guide/core/streaming.md)。

Core 会管理自己创建的资源。你创建的订阅和 `MutableState` 输入，需要在不再使用时自行清理。

## 配置处理流程

通过 `build` 控制语法和修复选项，通过插件扩展解析、HTML 处理、修复和映射。预设包含平滑输出和尾部淡入标记，默认关闭；最终的视觉效果由渲染器实现。

- [状态与更新](../../../website/docs/zh/guide/core/streaming.md) — 订阅内容变化，启用平滑输出。
- [配置](../../../website/docs/zh/guide/core/configuration.md) — Core 输入和语法开关。
- [插件](../../../website/docs/zh/guide/core/plugins.md) — remark、rehype、repair 和 mapper 插件。

## 参与贡献与许可证

贡献指南见 [CONTRIBUTING.md](../../../CONTRIBUTING.md)。本项目采用 [MIT](../../../LICENSE) 许可证。
