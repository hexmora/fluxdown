# 快速开始

在 React 应用中使用 Fluxdown，传入 Markdown 就可以开始渲染。常用语法、代码高亮、复制按钮和基础样式已经准备好。

原生应用请阅读 [React Native 快速上手](../react-native/quick-start.md)。

## 安装

```sh
pnpm add fluxdown
```

> 项目需要 React 18 或 19。

## 显示第一段内容

```tsx
import { Fluxdown } from 'fluxdown';

const markdown = `# 你好，Fluxdown

让正在生成的内容，也能**轻松阅读**。`;

export default function App() {
  return <Fluxdown text={markdown} />;
}
```

> 如果打包器没有自动加载组件样式，可以在应用的全局样式入口手动引入：

```ts
import 'fluxdown/styles.css';
```

## 接入已有的流式文本

如果你的请求工具已经提供了累积文本，直接把它传给 `text`，并用请求状态控制 `streaming`：

```tsx
import { Fluxdown } from 'fluxdown';

type MessageProps = {
  text: string;
  isStreaming: boolean;
};

export function Message({ text, isStreaming }: MessageProps) {
  return <Fluxdown streaming={isStreaming} text={text} />;
}
```

`text` 始终是当前完整内容。请求完成后把 `streaming` 设为 `false`，即可显示完整结果并结束流式效果。

## 下一步

- [流式内容](./streaming.md)：连接数据流，调整平滑输出与末尾效果。
- [样式指南](./customization.md)：配合应用的颜色、字体和布局。
- [自定义配置](./configuration.md)：查看所有属性、语法开关和配置形式。
- [使用与编写插件](./plugins.md)：给代码块、链接等内容加入自己的组件和交互。
