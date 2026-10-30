# 状态与更新

Core 的输入和输出都是响应式的。文本继续增长、配置发生变化时，已有的数据流会更新，不需要为每一个网络片段重新创建 Core。

本页沿用[快速开始](./quick-start.md)中的 `text`、`core` 和 `MarkdownBlock`。

## 追加文本

向 `text.next` 传入当前完整内容：

```ts
function append(chunk: string) {
  text.next(text.value + chunk);
}

append('\n\n新的段落');
append('，还在继续。');
```

如果数据源已经返回累积文本，直接 `text.next(fullText)` 即可。

## 订阅列表和内容

一次更新可能增加内容块，也可能只修改已有块里的内容。界面集成需要同时关心这两种变化：

```ts
const listSubscription = core.value.subscribe((blocks) => {
  console.log('当前内容块：', blocks);
});

const firstBlock = core.value.value[0];
const contentSubscription = firstBlock?.value.subscribe((tree) => {
  console.log('第一个块的内容：', tree);
});

// 不再使用这些订阅时
listSubscription.unsubscribe();
contentSubscription?.unsubscribe();
```

实际接入时，在块加入列表时订阅它的 `value`，离开列表时取消订阅。外层数组和内容块可能继续保持原来的引用，所以只观察引用变化会漏掉内容更新。

`renderItem` 适合创建一个绑定内容块的视图。让这个视图订阅 `block.value`，而不是只在创建时读取一次语法树。

## 让配置随状态变化

例如，在流式接收期间启用末尾修复，完成后恢复最终文本的呈现。创建 Core 时，将响应式的 `build` 传入：

```ts
import type { BlockCompilerConfig } from '@fluxdown/core';

import { MutableState } from 'stative';

const build = MutableState.of<BlockCompilerConfig>({
  repair: true,
  repairEnding: true,
  footnote: false,
  tex: false,
  indentedCode: false,
  setextHeading: false,
});
```

用这个 `build` 替换快速开始中的静态对象。接收完成后：

```ts
build.next({ ...build.value, repairEnding: false });
```

`repair` 控制整组修复能力，`repairEnding` 控制针对流式末尾的修复。其余字段用于开启脚注、公式、缩进代码块和 Setext 标题。

## 启用平滑输出

Core 默认包含 `Smooth`，但不会自动启用。先安装预设包，显式配置这个插件：

```sh
pnpm add @fluxdown/core-plugins
```

将以下配置加入创建 Core 时的输入对象：

```ts
import type { MapperPluggable } from '@fluxdown/core';

import { Smooth } from '@fluxdown/core-plugins/plugins/mapper/smooth';
import { MutableState, toClosure } from 'stative';

const smoothEnabled = MutableState.of(true);
const active = toClosure(smoothEnabled);

const mappers: MapperPluggable[] = [[Smooth, { enabled: active }]];
```

把 `mappers` 传给 Core 后，新增内容会按时间逐步进入输出。自己的渲染器依然通过列表和内容块订阅接收变化。

结束时，可以关闭平滑输出，立即呈现剩余内容：

```ts
smoothEnabled.next(false);
```

`Shad` 为每个新出现的字符标记独立的淡入。`enabled`、`length` 和 `duration` 配置支持普通值或可读闭包；`length` 是希望同时淡入的字符数，默认为 `10`；`duration` 是最长淡入时长，单位为毫秒，默认为 `400`，在播字符较多时会自动缩短。需要渲染器支持相应节点才能表现为视觉效果，React、Vue、React Native、Lynx、Solid 与 Taro 预设已包含对应的渲染插件。

`Scale` 为逐字入场效果生成字符和词标记。与 `Smooth` 一样，`enabled`、`duration`、`from` 和 `blur` 配置支持普通值或可读闭包。自定义渲染器需要处理这些标记；React、Vue、React Native、Lynx、Solid 与 Taro 组件可直接使用更简洁的 [`streaming.effect`](../common/streaming-effects/animation/index.mdx) 配置。

## 清理资源

一个 Core 实例对应一个独立的内容生命周期。完成使用后，先取消你建立的订阅，再销毁 Core 与外部输入：

```ts
core.destroy();
text.destroy();
build.destroy();
active.destroy();
smoothEnabled.destroy();
```

Core 会清理自己创建的状态和插件；在外部创建的状态由调用方管理。
