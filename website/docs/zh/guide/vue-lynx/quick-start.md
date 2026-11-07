---
title: 快速开始 - Fluxdown Vue Lynx
description: 在 Vue Lynx 项目中使用 Fluxdown，以 Lynx 原生元素渲染 Markdown，并接入流式内容。
---

# 快速开始 - Fluxdown Vue Lynx {#quick-start}

Vue Lynx 版 Fluxdown 将 Markdown 渲染为 Lynx 的 `text`、`view` 等元素。它使用与 React Lynx 相同的 Core 流程和原生样式，并提供 Vue 组件、响应式 props 和可替换插槽。

## 安装

在现有 [Vue Lynx](https://vue.lynxjs.org/) 项目中安装：

```sh
pnpm add @fluxdown/vue-lynx vue-lynx@0.5.1
```

Android 的 Full 代码高亮需要 Lynx 3.8 或更新版本的后台线程 WebAssembly 支持。其他高亮方案见[代码高亮](./plugins/matrix.mdx#code-highlighting)。

使用 Vue Lynx 0.5 支持的 Rsbuild 1 工具链，即 Vue Lynx 模板中的 `@lynx-js/rspeedy` 0.13.x 与 `@rsbuild/plugin-vue` 1.x。在现有 `lynx.config.ts` 中加入以下选项：

```ts
import type { Rspack } from '@lynx-js/rspeedy';

import { defineConfig } from '@lynx-js/rspeedy';
import { createRequire } from 'node:module';
import { pluginVueLynx } from 'vue-lynx/plugin';

const require = createRequire(import.meta.url);

const runtime = require.resolve('vue-lynx');

type Loader = {
  loader: string;

  options?: Record<string, unknown>;
};

const getLoaders = (rule: Rspack.RuleSetRule): Loader[] => {
  const uses = Array.isArray(rule.use) ? rule.use : [rule.use];

  return uses.filter(
    (use): use is Loader => Boolean(use) && typeof use === 'object',
  );
};

const normalizeTargets = (
  rules: NonNullable<Rspack.RuleSetRule['rules']>,
): void => {
  for (const rule of rules) {
    if (!rule) continue;

    for (const use of getLoaders(rule)) {
      if (!use.loader.includes('swc-loader')) continue;

      const options = use.options as
        | { env?: unknown; jsc?: { target?: string } }
        | undefined;

      if (options?.env) {
        if (options.jsc) delete options.jsc.target;
      } else if (options?.jsc) {
        options.jsc.target = 'es2017';
      }
    }

    normalizeTargets(rule.oneOf ?? []);

    normalizeTargets(rule.rules ?? []);
  }
};

export default defineConfig({
  resolve: {
    alias: {
      vue$: runtime,
      'vue-lynx$': runtime,
    },
  },
  plugins: [
    pluginVueLynx({
      autoPixelUnit: false,
      enableCSSInheritance: false,
      enableCSSInlineVariables: false,
      includeWorkletPackages: [
        '@fluxdown/vue-lynx',
        '@fluxdown/vue-lynx-plugins',
      ],
    }),
  ],
  tools: {
    rspack(config) {
      normalizeTargets(
        (config.module?.rules ?? []).filter(
          (rule): rule is Rspack.RuleSetRule =>
            Boolean(rule) && typeof rule === 'object',
        ),
      );
    },
  },
});
```

两个 alias 保证组件与动画使用同一份 Vue Lynx runtime。

包白名单让应用编译器能从已安装的 Fluxdown 包中提取动画 worklet。`autoPixelUnit: false` 保留原生尺寸语义；两项 CSS 选项保持 `false`，与 React Lynx 一致，即使项目模板原先开启了它们。组件导入会包含所需样式。

Rspack 回调保留 Rspeedy 的宿主语法转换，移除 Vue Lynx 与之冲突的 target，其中包括 Android QuickJS 所需的 Unicode 属性正则转换。未提供 `env` 的旧工具链使用 ES2017。请将这项调整放在 `tools.rspack` 中，让它在 Vue Lynx 配置 loader 之后执行。

## 渲染第一条消息

```vue
<script setup lang="ts">
import { Fluxdown } from '@fluxdown/vue-lynx';

const markdown = `# 你好，Fluxdown

即使内容还在传输，也保持**清晰可读**。`;
</script>

<template>
  <scroll-view scroll-orientation="vertical" style="height: 100%">
    <Fluxdown :style="{ padding: '20px' }" :text="markdown" />
  </scroll-view>
</template>
```

组件负责内容排版，外层页面负责滚动。通过 [Slot 插件](./plugins/slot.md) 接入原生链接跳转、图片点击和代码复制。

## 接入流式文本

```vue
<Fluxdown :streaming="isStreaming" :text="text" />
```

`text` 始终传入截至当前收到的完整内容。请求结束后将 `streaming` 设为 `false`。

## 下一步

- [流式内容](./streaming.md)：平滑输出与四种效果。
- [自定义配置](./configuration.md)：与 Vue 版的差异。
- [样式指南](./customization.md)：原生颜色、字体和间距。
- [插件矩阵](./plugins/matrix.mdx)：Full、Lite 和 Raw 入口。
- [横向演示](../common/features/renderers.mdx)：将 React Lynx、Vue Lynx 与其他渲染库一起比较。
