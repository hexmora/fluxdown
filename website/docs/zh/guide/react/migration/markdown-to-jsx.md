# markdown-to-jsx

从 [markdown-to-jsx](https://github.com/quantizor/markdown-to-jsx) 迁移时，普通 Markdown 可以直接交给 Fluxdown。若内容里嵌入了自定义 React 标签，需要先安排好这些组件的呈现方式。

<details className="agent-assistance">
<summary>使用 Agent 协助</summary>
<div className="agent-assistance-content">

把下面的提示词交给能访问项目的 Agent：

```markdown
# 目标

将当前 React 项目中的 markdown-to-jsx 迁移到 fluxdown，保留现有内容与业务组件。

# 参考

- Fluxdown：https://hexmora.github.io/fluxdown/zh/guide/react/quick-start.html
- 配置与扩展：https://hexmora.github.io/fluxdown/zh/guide/react/configuration.html
- markdown-to-jsx：https://github.com/quantizor/markdown-to-jsx

# 执行

1. 确认已安装版本，查找默认入口、/react 入口、compiler 调用和封装组件。检查 overrides、renderRule、wrapper、流式选项及嵌入内容的实际用途。
2. 安装 fluxdown，将 Markdown 字符串传给 text；保留数据来源与外层业务布局。流式场景用真实请求状态控制 streaming。
3. 将排版配置移到 theme，标准元素覆盖改为 Slot 插件。按功能选择 Render、Remark、Rehype 插件或 patches；不要直接复用旧 AST 类型和规则回调。
4. 自定义标签和 JSX 表达式不视为自动兼容。为每种实际使用的业务组件选择明确的接入方式，保留属性、交互与内容边界。只清理确认不再使用的依赖。

# 验收

运行现有类型检查、测试和构建；对照真实文档检查容器布局、标题链接、代码块、原始 HTML、自定义组件和流式结束态。直接完成迁移，说明已验证内容与剩余差异，不以删除内容代替适配。
```

</div>
</details>

## 替换组件

```sh
pnpm add fluxdown
```

迁移前：

```tsx
import Markdown from 'markdown-to-jsx/react';

type ArticleProps = {
  text: string;
};

export function Article({ text }: ArticleProps) {
  return <Markdown>{text}</Markdown>;
}
```

> 旧项目可能从 `markdown-to-jsx` 默认入口导入，替换方式相同。

迁移后：

```tsx
import { Fluxdown } from 'fluxdown';

type ArticleProps = {
  text: string;
};

export function Article({ text }: ArticleProps) {
  return <Fluxdown text={text} />;
}
```

Fluxdown 会输出自己的容器，不提供 `wrapper`、`forceWrapper` 或 `forceInline` 的同名选项。需要文章语义和外层布局时，在组件外保留应用自己的容器；不要把块级 Markdown 渲染器直接放进段落等行内容器。

Next.js App Router 中，将 Fluxdown 放进文件顶部带有 `'use client';` 的包装组件。数据获取仍可留在服务端页面；插件类和回调在客户端组件内定义，不通过服务端属性传递。

## 调整覆盖与样式

| 原来的用法                                 | 迁移方式                                                                                                     |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `options.overrides` 修改标题字号、颜色     | 使用 `theme.tokens`。                                                                                        |
| `options.overrides` 替换链接、图片、代码块 | 使用 [Slot 插件](../plugins/slot.md)，按对应插槽的属性重新适配。                                             |
| `options.renderRule` 或 `createElement`    | 根据用途改为 [Render 插件](../plugins/render.md)、AST 转换或文本 `patches`。旧的节点类型与回调不能直接复用。 |
| `options.wrapper`、外层 `className`        | 保留外层容器，用 Fluxdown 的 `className` 或 `style` 调整布局。                                               |

例如，统一调整一级标题和正文大小：

```tsx
<Fluxdown
  text={text}
  theme={{
    tokens: {
      heading: { h1: { fontSize: '2rem' } },
      typography: { fontSize: { md: '1rem' } },
    },
  }}
/>
```

基础样式已随组件加载；需要手动加载时，在应用入口引入 `fluxdown/styles.css`。原有标题 ID、目录锚点、换行和 HTML 解析行为要用实际文章核对。脚注、缩进代码与 Setext 标题可以通过 [`build`](../configuration.md#build) 开启。

## 处理嵌入的业务组件

`overrides: { ProductCard }` 配合 Markdown 中的 `<ProductCard />`，不会自动转换为 Fluxdown 插槽。Fluxdown 也不会执行字符串里的 JSX 表达式。

如果组件本来就来自结构化数据，可以在 Markdown 外继续渲染它。需要嵌入文本时，小范围替换使用 [`patches`](../configuration.md#patches)；自定义语法则用插件解析并交给自己的 Render / Slot 插件。需要保留的 HTML 标签与属性，按 [Rehype 插件](../../core/plugins/rehype.mdx) 配置允许列表。

## 接入流式内容

使用了 `optimizeForStreaming` 的项目，改为传入累积文本和请求状态：

```tsx
<Fluxdown streaming={pending} text={text} />
```

两者对未完成语法的处理不同：Fluxdown 会尝试修复末尾并平滑展示，不是等待语法闭合后才显示。请求结束或中止时，将 `pending` 设为 `false`；效果可按[流式内容](../streaming.md)调整。

确认所有自定义组件和 Markdown 入口都完成迁移后，再移除 `markdown-to-jsx`。
