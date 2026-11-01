<p align="center">
  <img src="./assets/logo.png" alt="Fluxdown" width="480" />
</p>

**为流式内容打造的 Markdown 渲染器。**

[文档站](https://hexmora.github.io/fluxdown/zh/index.html) · [在线体验](https://hexmora.github.io/fluxdown/zh/playground.html) · [文档](../website/docs/zh/guide/index.md) · [English](../README.md)

Fluxdown 让 Markdown 在生成过程中保持可读，适用于 AI 对话、实时写作等内容持续增长的界面。

- **流畅的阅读体验。** 逐步展示新文本，让尚未完成的链接、强调和代码保持可读。
- **减少重复计算。** 以内容块为单位缓存结果，复用消息中已稳定的部分。
- **熟悉的 Markdown。** 支持 GFM 表格、任务列表、删除线、自动链接和代码高亮，也可按需启用公式。
- **灵活的呈现方式。** 定制主题、替换组件，或通过插件扩展解析与渲染。
- **框架无关的核心。** 直接使用 React、Vue 3、Svelte 5、Angular、React Native、Lynx、Solid 或 Taro 组件，或为自己的界面构建渲染器。

## 快速上手

在 React 18 或 19 应用中安装：

```sh
pnpm add fluxdown
```

```tsx
import { Fluxdown } from "fluxdown";

type MessageProps = {
  text: string;
  isStreaming: boolean;
};

export function Message({ text, isStreaming }: MessageProps) {
  return <Fluxdown text={text} streaming={isStreaming} />;
}
```

将**截至目前收到的完整消息**传给 `text`。生成完成、取消或失败时，将 `isStreaming` 设为 `false`。渲染静态内容时可省略 `streaming`。

如果打包工具没有自动加载样式，请在应用的全局样式入口中添加：

```ts
import "fluxdown/styles.css";
```

更多示例见 [React](../website/docs/zh/guide/react/quick-start.md)、[Vue 3](../website/docs/zh/guide/vue/quick-start.md)、[Svelte 5](../website/docs/zh/guide/svelte/quick-start.md)、[Angular](../website/docs/zh/guide/angular/quick-start.md)、[React Native](../website/docs/zh/guide/react-native/quick-start.md)、[Lynx](../website/docs/zh/guide/lynx/quick-start.md)、[Solid](../website/docs/zh/guide/solid/quick-start.md) 或 [Taro](../website/docs/zh/guide/taro/quick-start.md) 的快速上手文档。

## 包

| 包                                                   | 用途                                             |
| ---------------------------------------------------- | ------------------------------------------------ |
| [`fluxdown`](../packages/react/docs/README.zh-CN.md) | 开箱即用的 React Markdown 渲染组件。             |
| [`@fluxdown/vue`](../packages/vue)                   | 开箱即用的 Vue 3 Markdown 渲染组件。             |
| [`@fluxdown/svelte`](../packages/svelte)             | 开箱即用的 Svelte 5 Markdown 渲染组件。          |
| [`@fluxdown/angular`](../packages/angular)           | 开箱即用的 Angular Markdown 渲染组件。           |
| [`@fluxdown/react-native`](../packages/react-native) | 开箱即用的 React Native Markdown 渲染组件。      |
| [`@fluxdown/lynx`](../packages/lynx)                 | 开箱即用的 ReactLynx Markdown 渲染组件。         |
| [`@fluxdown/solid`](../packages/solid)               | 开箱即用的 Solid Markdown 组件。                 |
| [`@fluxdown/taro`](../packages/taro)                 | 开箱即用的 Taro Markdown 渲染组件。              |
| [`@fluxdown/core`](../packages/core)                 | 为自定义渲染器提供解析、修复和响应式内容块。     |
| [`stative`](../packages/stative)                     | 可组合的状态与派生计算，也是 Core 的响应式基础。 |

## 文档

- [流式内容](../website/docs/zh/guide/react/streaming.md) — 接入文本流，调整流式效果。
- [样式定制](../website/docs/zh/guide/react/customization.md) — 调整主题、排版和布局。
- [插件](../website/docs/zh/guide/react/plugins.md) — 定制语法、内容和交互。
- [Core](../website/docs/zh/guide/core/quick-start.md) — 直接处理响应式内容块。
- [Stative](../website/docs/zh/stative/getting-started.md) — 创建和组合状态流。

## 参与贡献

欢迎报告问题、改进文档或提交 Pull Request。可以通过 [Issues](https://github.com/hexmora/fluxdown/issues) 报告缺陷或讨论想法。报告问题时，请尽量提供最小复现示例，帮助我们定位原因。

开发环境和 Pull Request 指南见 [CONTRIBUTING.md](../CONTRIBUTING.md)。安全漏洞请按 [SECURITY.md](../SECURITY.md) 中的说明私下报告。

## 贡献者

感谢所有贡献代码、文档、问题反馈和想法的人。

[![贡献者](https://contrib.rocks/image?repo=hexmora/fluxdown)](https://github.com/hexmora/fluxdown/graphs/contributors)

## 许可证

[MIT](../LICENSE)
