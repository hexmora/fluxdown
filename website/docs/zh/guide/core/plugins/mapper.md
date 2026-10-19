# Mapper 插件

Mapper 接收响应式的 HAST 内容块，返回另一份响应式内容块列表。它不只执行一次树转换，还能在两次文本到达之间继续更新输出；平滑输出就是其中一种用途。

## 声明 mapper

下面只保留前几个内容块，用于限制预览长度：

```ts
import type { MapperInputs, MapperPluggable } from '@fluxdown/core';
import type { MapperConfigInputs, MapperPluginConfig } from '@fluxdown/types';

import { once, useMap } from 'stative';

export type PreviewConfig = { count: number };

export type PreviewInputs = MapperInputs<MapperConfigInputs<PreviewConfig>>;

export type PreviewPluginConfig = MapperPluginConfig<PreviewConfig>;

const Preview = once(function Preview({ source, count }: PreviewInputs) {
  return useMap([source, count], ([blocks, size]) => blocks.slice(0, size));
});

const mappers: MapperPluggable<PreviewConfig>[] = [[Preview, { count: 3 }]];
```

在[快速开始](../quick-start.md)的 Core 输入中加入 `mappers` 即可。配置支持普通值或可读闭包。mapper 接收引用稳定的只读输入，修改 `count` 会更新同一个 mapper；可选值通过 `useDefaults` 设置默认值。

`once` 只构建一次状态流，`useMap` 描述后续如何更新。mapper 可以返回可读闭包，也可以返回 Stative 描述符。

> 不要销毁或直接修改上游内容块。如果创建了派生内容块或订阅，应交给 Stative 的生命周期管理，在 mapper 销毁时一并清理。

## 配置平滑输出

预设 `Smooth` 接收响应式选项。把外部状态转成可读闭包，再放进插件选项：

```ts
import type { MapperPluggable } from '@fluxdown/core';
import type { SmoothConfig } from '@fluxdown/core-presets/mapper';

import { Smooth } from '@fluxdown/core-presets/mapper';
import { MutableState, toClosure } from 'stative';

const enabled = MutableState.of(true);
const active = toClosure(enabled);

const mappers: MapperPluggable<SmoothConfig>[] = [
  [Smooth, { enabled: active }],
];
```

将 `mappers` 传给 Core 后，调用 `enabled.next(false)` 可以立即显示剩余内容。结束使用时，先销毁 Core，再销毁 `active` 和 `enabled`。

## 内置插件

Core 默认包含以下插件，无需手动注册。

`PRESET_MAPPER_PLUGINS`，从 `@fluxdown/core-presets/mapper` 导入。

| 插件     | 作用                                               |
| -------- | -------------------------------------------------- |
| `Smooth` | 将新内容按时间逐步释放，让成批到达的文本平滑显示。 |
| `Shad`   | 为刚出现的末尾文字生成渐变标记，由渲染器呈现。     |

Core 中这两项默认关闭，自定义渲染器的启用方式见[状态与更新](../streaming.md#启用平滑输出)。
