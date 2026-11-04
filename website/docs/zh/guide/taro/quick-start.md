---
title: Taro Markdown 渲染器
description: 在 Taro React 项目中使用 Fluxdown 渲染 Markdown。了解组件与样式安装、流式文本接入，以及 H5 和小程序构建的配置方式。
---

# Taro Markdown 渲染器快速开始 {#快速开始}

在 Taro React 项目中，用 Taro 组件展示 Markdown。解析、流式输出与插件配置沿用 React 版的接口。

## 安装

```sh
pnpm add @fluxdown/taro @tarojs/components-react@4.3.1
```

> 使用 Taro 4.3 与 React 18，并与应用的 Taro React 集成保持一致。应用中的 `@tarojs/*` 包应保持同一版本。

在应用的全局样式入口引入组件样式：

```ts
import '@fluxdown/taro/styles.css';
```

## 展示第一条消息

```tsx
import { Fluxdown } from '@fluxdown/taro';
import { View } from '@tarojs/components';

const markdown = `# 你好，Fluxdown

让**流式内容**保持清晰易读。`;

export default function Article() {
  return (
    <View>
      <Fluxdown text={markdown} />
    </View>
  );
}
```

使用项目原有的 Taro 命令构建页面，例如 `taro build --type h5` 或 `taro build --type weapp`。

## Taro 4.3.1 H5 构建

在 `config/index.ts` 中启用 Taro 官方的 React 兼容组件库，让 H5 动画在文本持续更新时保持连贯。使用 Webpack 5 构建生产版本时，同时关闭键名强制加引号，避免压缩器破坏依赖中的 JavaScript 私有方法：

```ts
import { defineConfig } from '@tarojs/cli';

export default defineConfig({
  h5: {
    useHtmlComponents: true,
  },
  terser: {
    config: {
      output: { quote_keys: false },
    },
  },
});
```

## 接入流式文本

传入当前已收到的完整文本，用请求状态控制 `streaming`：

```tsx
import { Fluxdown } from '@fluxdown/taro';

type MessageProps = {
  text: string;
  pending: boolean;
};

export function Message({ text, pending }: MessageProps) {
  return <Fluxdown streaming={pending} text={text} />;
}
```

请求结束后，将 `pending` 设为 `false`。组件会完成剩余的平滑输出，再移除末尾效果。

## 选择组件

| 组件           | 入口                  | 预设                            |
| -------------- | --------------------- | ------------------------------- |
| `Fluxdown`     | `@fluxdown/taro`      | 完整预设。                      |
| `FluxdownLite` | `@fluxdown/taro/lite` | 基础 Markdown 与四种流式效果。  |
| `FluxdownRaw`  | `@fluxdown/taro/raw`  | 自行提供必填的 `plugins` 列表。 |

各预设包含的能力见[插件矩阵](./plugins/matrix.mdx)。

## 下一步

- [流式内容](./streaming.md)：接收文本并选择末尾效果。
- [样式指南](./customization.md)：调整主题、排版与间距。
- [自定义配置](./configuration.md)：查看完整属性与默认值。
- [使用与编写插件](./plugins.md)：定制组件与交互。
