# 快速开始

Lynx 版将 Markdown 渲染成 `text`、`view` 等 Lynx 元素。它基于 Core 实现，提供语法修复、平滑输出和可替换的渲染插槽。

## 安装

在已有 ReactLynx 项目中安装：

```sh
pnpm add @fluxdown/lynx
```

包内保留 JSX，由项目中的 `@lynx-js/react-rsbuild-plugin` 编译。组件导入时会一并引入所需样式，无需额外加载样式文件。

## 显示第一段内容

```tsx
import { Fluxdown } from '@fluxdown/lynx';

const markdown = `# 你好，Fluxdown

让正在生成的内容，也能**轻松阅读**。`;

export default function App() {
  return (
    <scroll-view scroll-orientation="vertical" style={{ height: '100%' }}>
      <Fluxdown style={{ padding: '20px' }} text={markdown} />
    </scroll-view>
  );
}
```

组件负责内容排版，外层页面负责滚动。放进聊天列表时，直接作为消息内容使用即可。链接导航、代码复制等交互通过 [Slot 插件](./plugins/slot.md) 接入应用能力。

## 接入流式文本

```tsx
<Fluxdown streaming={isStreaming} text={text} />
```

`text` 始终传入截至目前收到的完整内容。请求结束时，将 `streaming` 设为 `false`。

## 下一步

- [流式内容](./streaming.md)：控制平滑输出与末尾效果。
- [样式指南](./customization.md)：调整颜色、字体和间距。
- [插件矩阵](./plugins/matrix.mdx)：选择 Full、Lite 或自己组装。
- [横向演示](../common/features/renderers.mdx)：同时查看 React、Vue、Svelte、React Native、Lynx、Solid、Taro 和 Angular 的静态与流式表现。
