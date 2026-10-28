# 快速开始

`@fluxdown/uni-app` 为 uni-app x 的 Vapor 项目提供 Markdown 组件。解析、语法修复和平滑输出基于 Fluxdown Core，界面使用 `.uvue` 组件。

## 准备项目

使用 HBuilderX 5.33 或更高版本创建 uni-app x 项目，在 `manifest.json` 中开启 Vapor：

```json
{
  "uni-app-x": {
    "vapor": true,
    "styleIsolationVersion": "2",
    "vapor-default-script-lang": "ts"
  }
}
```

App 使用 Vapor 渲染；Web 使用 uni-app x 官方的 Vue 渲染路径。运行环境与平台版本要求见 [AppVapor 文档](https://doc.dcloud.net.cn/uni-app-x/app-vapor.html)。

在项目目录安装组件与构建依赖：

```bash
pnpm add @fluxdown/uni-app
pnpm add -D @babel/core @babel/plugin-transform-unicode-property-regex @rollup/plugin-commonjs
```

### 构建配置

在项目根目录配置 `vite.config.js`。`commonjs` 在 App 构建时处理解析依赖中的 CommonJS 模块，H5 使用 uni-app 已有的转换；Unicode 正则转换让这些依赖在 App 的 JavaScript 引擎中运行。已有配置时，将这两个处理步骤合并到原来的 `plugins` 中。

```js title="vite.config.js"
import { transformSync } from '@babel/core';
import unicodeProperty from '@babel/plugin-transform-unicode-property-regex';
import uni from '@dcloudio/vite-plugin-uni';
import commonjs from '@rollup/plugin-commonjs';

export default {
  plugins: [
    uni.default(),
    ...(process.env.UNI_PLATFORM === 'h5' ? [] : [commonjs()]),
    {
      name: 'unicode-properties',
      enforce: 'pre',
      transform(code, id) {
        if (!id.endsWith('.js') || !code.includes('\\p{')) {
          return null;
        }

        return transformSync(code, {
          configFile: false,
          babelrc: false,
          plugins: [unicodeProperty],
          sourceMaps: true,
          filename: id,
        });
      },
    },
  ],
};
```

> `@dcloudio/vite-plugin-uni` 由 uni-app 工具链提供，版本应与项目的 uni-app 编译器保持一致。

## 展示 Markdown

```vue title="pages/index/index.uvue"
<script setup lang="ts">
import { Fluxdown } from '@fluxdown/uni-app';

const text = '# Hello Fluxdown\n\nMarkdown for **uni-app**.';
</script>

<template>
  <Fluxdown :text="text" />
</template>
```

样式随 `.uvue` 组件一起编译。通过 `theme` 调整颜色、字体与间距，见[样式指南](./customization.md)。

## 接收流式内容

把目前收到的完整文本传入 `text`。生成期间设置 `streaming`，结束、取消或失败时改为 `false`：

```vue title="components/message.uvue"
<script setup lang="ts">
import { Fluxdown } from '@fluxdown/uni-app';

type MessageProps = {
  text: string;
  pending: boolean;
};

const props = defineProps<MessageProps>();
</script>

<template>
  <Fluxdown :text="props.text" :streaming="props.pending" />
</template>
```

`streaming` 默认开启末尾语法修复、平滑输出和 `scale` 效果。保留网络片段节奏时，使用 `{ smooth: false, effect: 'chunk' }`。更多用法见[流式内容](./streaming.md)。

## 选择组件

| 组件           | 导入入口                                        | 默认能力                                                     |
| -------------- | ----------------------------------------------- | ------------------------------------------------------------ |
| `Fluxdown`     | `@fluxdown/uni-app` 或 `@fluxdown/uni-app/full` | 基础 Markdown、Prism 高亮、MathJax 公式、CJK 和 emoji 短码。 |
| `FluxdownLite` | `@fluxdown/uni-app/lite`                        | 基础 Markdown 与流式效果，代码显示原文。                     |
| `FluxdownRaw`  | `@fluxdown/uni-app/raw`                         | 必须传入 `plugins`，自行组合渲染能力。                       |

完整清单见[插件矩阵](./plugins/matrix.mdx)，全部参数见[自定义配置](./configuration.md)。
