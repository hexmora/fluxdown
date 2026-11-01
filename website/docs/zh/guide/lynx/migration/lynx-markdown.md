# Lynx Markdown

这篇指南迁移 Lynx 官方的 [`<markdown>` 原生元件](https://github.com/lynx-family/lynx-website/blob/main/docs/zh/api/elements/built-in/markdown.mdx)。基础展示只需将 `content` 改为 `text`；原来的样式、事件和原生选择能力需要分别适配。

<details className="agent-assistance">
<summary>使用 Agent 协助</summary>
<div className="agent-assistance-content">

把下面的内容发送给能访问项目代码的 Agent：

```markdown
# 目标

将项目中 Lynx 官方 Markdown 元件的展示迁移到 @fluxdown/lynx，直接完成代码修改，保留现有业务行为。

# 参考文档

- 原元件：https://github.com/lynx-family/lynx-website/blob/main/docs/zh/api/elements/built-in/markdown.mdx
- 官方示例：https://github.com/lynx-family/lynx-examples/tree/main/examples/markdown
- Fluxdown：https://hexmora.github.io/fluxdown/zh/guide/lynx/quick-start.html
- 样式与交互：https://hexmora.github.io/fluxdown/zh/guide/lynx/customization.html

# 执行方式

1. 检查 Lynx/ReactLynx 版本、原生元件注册、Markdown 用法和宿主桥接；包含项目使用的 markdown 或 x-markdown 封装。
2. 将 content 映射到 text，保留数据获取和外部滚动容器。流式内容传累积全文，用请求状态控制 streaming；不要直接复用原生打字机参数。
3. 将 markdown-style 按用途迁到 theme.tokens，将链接、图片和代码复制接到 Slot 插件。核对 inlineview、自定义语法、文本选择、截断和原生方法调用。
4. 无直接对应能力时实现适配或保留原元件，并说明差异。只在确认没有其他调用后清理原生注册、类型声明和依赖。

# 验收

运行现有检查和目标平台构建，用实际消息验证静态与流式内容、主题、导航、滚动和原生交互。总结修改、验证结果和仍需人工确认的差异。
```

</div>
</details>

## 替换元件

在已有 ReactLynx 项目中安装：

```sh
pnpm add @fluxdown/lynx
```

迁移前，沿用项目中已有的 `<markdown>` 类型声明和原生注册：

```tsx
type ArticleProps = {
  text: string;
};

export function Article({ text }: ArticleProps) {
  return <markdown content={text} />;
}
```

迁移后：

```tsx
import { Fluxdown } from '@fluxdown/lynx';

type ArticleProps = {
  text: string;
};

export function Article({ text }: ArticleProps) {
  return <Fluxdown text={text} />;
}
```

Fluxdown 使用 `view`、`text` 等 Lynx 元素渲染，包内 JSX 交给项目的 `@lynx-js/react-rsbuild-plugin` 编译，导入时会加载样式。外层 `scroll-view` 或消息列表继续保留，见[快速开始](../quick-start.md)。

## 调整样式与流式输出

原来的 `markdown-style` 不能直接传入。内容样式改用 [`theme.tokens`](../customization.md)，外层尺寸和留白继续使用 `style`：

```tsx
<Fluxdown
  text={text}
  streaming={pending && { smooth: true, effect: 'suffix' }}
  style={{ padding: '16px' }}
  theme={['light', { tokens: { typography: { fontSize: { md: '16px' } } } }]}
/>
```

例如，`markdown-style.normalText.fontSize` 对应正文的字号设置；Fluxdown 的尺寸使用带单位的字符串。标题、代码和段落间距按主题中的对应分组调整。

`text` 始终是累积全文，请求完成、取消或出错后将 `pending` 设为 `false`。这与 `content-complete` 的状态方向相反。`animation-type`、`animation-velocity` 和 `markdown-effect` 不直接复用；平滑输出和末尾效果见[流式内容](../streaming.md)。

## 接回交互与自定义内容

将原元件的事件接到 [Slot 插件](../plugins/slot.md)，继续调用应用自己的桥接方法：

| 原来的能力               | Fluxdown 中的接法                          |
| ------------------------ | ------------------------------------------ |
| `bindlink`               | `Link` 插槽的 `onTap({ href })`。          |
| `bindimageTap`           | `Image` 插槽的 `onTap({ src })`。          |
| 代码复制                 | `CodeBlock` 插槽的 `onCopy({ code })`。    |
| `inlineview://` 内嵌内容 | 改用 `patches` 或自定义 Slot/Render 插件。 |

Fluxdown 不会自动识别 `inlineview://` 并查找子 View；相关内容需要显式迁移。`<span>`、`<p>` 的专用样式和图片尺寸扩展也要用实际内容检查。

原元件的 `text-selection`、`text-maxline`、选区菜单以及 `getSelectedText` 等原生方法没有一一对应的顶层属性。依赖这些能力的页面，先补齐适配或保留原元件；`FluxdownRef` 提供渲染结果，不是原生元件引用。确认所有页面都不再使用后，再清理 Markdown 专用的宿主注册和依赖。
