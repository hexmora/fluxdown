# Fluxdown for React

用于 React 应用的流式 Markdown 渲染组件。

`fluxdown` 内置基础样式、代码高亮和复制按钮，支持 GFM 表格、任务列表、删除线和自动链接。在内容生成过程中，可以平滑展示新文本、修复尚未完成的语法，并让尾部文字逐渐淡入。

[文档](../../../website/docs/zh/guide/react/quick-start.md) · [在线体验](https://hexmora.github.io/fluxdown/zh/playground.html) · [English](../README.md)

## 安装

在 React 18 或 19 应用中安装：

```sh
pnpm add fluxdown
```

## 渲染消息

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

将**截至目前收到的完整消息**传给 `text`；如果收到的是文本片段，先在请求处理逻辑中累积。请求完成、取消或失败时，将 `isStreaming` 设为 `false`。Fluxdown 会显示全部已收到的文本，并结束流式效果。请求、取消和错误处理由应用负责。

静态 Markdown 使用 `<Fluxdown text={text} />` 即可。在消息列表中，为每个组件使用稳定的消息 ID 作为 `key`。

如果打包工具没有自动加载样式，请在应用的全局样式入口中添加：

```ts
import "fluxdown/styles.css";
```

## 按需定制

| 选项                 | 用途                                         |
| -------------------- | -------------------------------------------- |
| `streaming`          | 启用或配置尾部语法修复、平滑输出和尾部淡入。 |
| `theme`              | 使用浅色或深色预设，或覆盖颜色、字体和间距。 |
| `build`              | 启用公式、脚注等语法。                       |
| `plugins`            | 定制解析、渲染、语义化插槽和交互。           |
| `className`、`style` | 设置容器布局和样式。                         |

`streaming={true}` 会启用全部三种效果。传入对象可以分别控制各项，省略的字段默认为 `true`。例如，保留尾部修复和平滑输出，关闭尾部淡入：

```tsx
<Fluxdown
  text={text}
  streaming={isStreaming && { repairEnding: true, smooth: true, shad: false }}
/>
```

## 文档

- [快速上手](../../../website/docs/zh/guide/react/quick-start.md)
- [流式内容](../../../website/docs/zh/guide/react/streaming.md)
- [样式定制](../../../website/docs/zh/guide/react/customization.md)
- [配置](../../../website/docs/zh/guide/react/configuration.md)
- [使用与编写插件](../../../website/docs/zh/guide/react/plugins.md)

如果需要在 React 之外构建自定义渲染器，请参阅 [`@fluxdown/core`](../../core/docs/README.zh-CN.md)。

## 参与贡献与许可证

贡献指南见 [CONTRIBUTING.md](../../../CONTRIBUTING.md)。本项目采用 [MIT](../../../LICENSE) 许可证。
