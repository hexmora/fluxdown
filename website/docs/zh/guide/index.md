# 认识 Fluxdown

Fluxdown 让 Markdown 在生成的过程中也保持好读。它把断续到达的内容平滑地呈现出来，并处理尚未写完的加粗、链接和代码，让读者可以跟上内容，而不是等待排版完成。

适合 AI 对话、实时写作、流式报告，以及任何内容还在持续增长的界面。

## 从哪里开始

| 你的需求                                       | 选择                                                                              |
| ---------------------------------------------- | --------------------------------------------------------------------------------- |
| 在 React 应用里展示 Markdown，快速接入流式输出 | [React 快速开始](./react/quick-start.md) · `fluxdown`                             |
| 在原生应用里展示 Markdown 和流式输出           | [React Native 快速上手](./react-native/quick-start.md) · `@fluxdown/react-native` |
| 接入其他框架，或自己决定内容如何呈现           | [Core 快速开始](./core/quick-start.md) · `@fluxdown/core`                         |

React 和 React Native 分别提供可直接使用的网页和原生组件；Core 负责框架无关的 Markdown 处理。它们共享语法、修复和流式能力。

## 为正在生成的内容设计

**阅读节奏更自然。** 内容可以按服务端的节奏接收，再平滑地显示到页面上。你不需要先把每个网络片段拆成字符。

**语法没写完，也能先读。** 流式内容经常停在 `**重点` 或一个未完成的链接中间。Fluxdown 会为这些中间状态提供合适的展示，后续文本到达后再更新。

**融入你的产品。** 主题负责字体、间距和颜色；插件负责链接、代码块、公式等内容的外观和行为。可以逐项调整，也可以保留默认呈现，只增加一层自己的交互。

## 一套核心，多种界面

Fluxdown 的核心基于 [stative](../stative/index.md) 构建，用同一条响应式数据流连接文本、配置与输出。React 和 React Native 共享不依赖平台的 React 基础，通过插槽分别提供 DOM 和原生组件。Vue 3、Svelte 和 React Lynx 是后续方向。

第一次接入时，从 [React](./react/quick-start.md) 或 [React Native](./react-native/quick-start.md) 快速上手开始即可。需要自行处理输出时，再阅读 Core 部分。
