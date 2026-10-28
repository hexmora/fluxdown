# 快速开始

Fluxdown 为 Solid 提供 Markdown 组件。它基于同一个 Core，支持静态内容、流式修复、平滑输出和末尾效果，用主题与插件调整呈现方式。

## 安装

```bash
pnpm add @fluxdown/solid
```

在已配置 Solid JSX 的项目中使用，需要 Solid 1.9 或更高的 1.x 版本：

```tsx
import { Fluxdown } from '@fluxdown/solid';

export function Article() {
  return <Fluxdown text={'# 你好，Fluxdown\n\n让文字自然展开。'} />;
}
```

> 浏览器入口会加载组件样式。服务端渲染项目在应用入口引入 `@fluxdown/solid/styles.css`，让首屏也使用相同的样式。

## 接收流式内容

`text` 始终是截至目前收到的完整文本。内容还在增长时传入 `streaming`，结束时改为 `false`：

```tsx
import { Fluxdown } from '@fluxdown/solid';

type MessageProps = {
  text: string;
  pending: boolean;
};

export function Message(props: MessageProps) {
  return <Fluxdown text={props.text} streaming={props.pending} />;
}
```

在 JSX 中读取 `props.text` 和 `props.pending`，更新会自动传给组件。传入 signal 时使用 `text={text()}`；不要在组件函数中提前解构响应式 props，或把 `text()` 保存成普通变量，否则会只取得当时的值。

网络请求和消息状态由应用管理，组件负责呈现。

## 选择规格

| 组件           | 入口                   | 用途                                         |
| -------------- | ---------------------- | -------------------------------------------- |
| `Fluxdown`     | `@fluxdown/solid`      | 完整预设，包含代码高亮、公式和图表。         |
| `FluxdownLite` | `@fluxdown/solid/lite` | 基础 Markdown 与四种末尾效果，按需添加插件。 |
| `FluxdownRaw`  | `@fluxdown/solid/raw`  | 自行传入 `plugins`，决定全部能力。           |

完整列表见[插件矩阵](./plugins/matrix.mdx)。需要调整输出节奏，继续阅读[流式内容](./streaming.md)；需要调整外观，阅读[样式指南](./customization.md)。
