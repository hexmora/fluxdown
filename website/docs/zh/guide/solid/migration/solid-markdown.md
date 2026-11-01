# solid-markdown

把 `SolidMarkdown` 的 `children` 改为 Fluxdown 的 `text`，已有的 signal 和请求逻辑可以保留。目标组件需要 Solid 1.9 或更高的 1.x 版本。

<details className="agent-assistance">
<summary>使用 Agent 协助</summary>
<div className="agent-assistance-content">

把下面这段发给项目中的 Agent：

```markdown
请把项目的 solid-markdown 迁移到 @fluxdown/solid，直接完成代码修改。

# 参考文档

- 原库：https://github.com/andi23rosca/solid-markdown
- 目标：https://hexmora.github.io/fluxdown/zh/guide/solid/quick-start.html

# 迁移步骤

1. 检查依赖版本与 SolidMarkdown 用法，包括 components、remarkPlugins、rehypePlugins、HTML 和样式。
2. 替换为 Fluxdown，将 children 改为 text。保持 Solid 响应式读取，不要提前解构 props 或把 signal 的值保存成普通变量。
3. 根据目标文档把组件覆盖迁移为 Slot 插件，额外 unified 插件适配为 Remark/Rehype 插件。优先使用内置语法与高亮，核对 HTML 允许规则。
4. 有流式内容时传入累积文本，用请求状态控制 streaming，并保留现有导航和交互。
5. 运行现有检查，验证响应式更新、实际 Markdown、定制组件和 SSR 样式。仅删除没有其他用途的依赖。

完成后简述修改与验证结果，明确仍有差异的行为，不要静默丢弃功能。
```

</div>
</details>

## 替换组件

```sh
pnpm add @fluxdown/solid
```

迁移前：

```tsx
import { SolidMarkdown } from 'solid-markdown';

type ArticleProps = { text: string };

export function Article(props: ArticleProps) {
  return <SolidMarkdown children={props.text} />;
}
```

迁移后：

```tsx
import { Fluxdown } from '@fluxdown/solid';

type ArticleProps = { text: string };

export function Article(props: ArticleProps) {
  return <Fluxdown text={props.text} />;
}
```

在 JSX 中直接读取 `props.text`；signal 则写成 `text={text()}`。浏览器入口会加载样式，SSR 项目需要在应用入口引入 `@fluxdown/solid/styles.css`。

## 迁移扩展与样式

Fluxdown 默认支持表格、任务列表、删除线和普通换行，完整预设也包含代码高亮。先删除为这些能力单独添加的重复配置，再检查实际文章。公式和脚注需要开启解析：

```tsx
<Fluxdown text={props.text} build={{ tex: true, footnote: true }} />
```

`components` 改为 [Slot 插件](../plugins/slot.md)：链接用 `Link`，围栏代码块用 `CodeBlock`。两边的组件 props 不同，按目标插槽类型调整；插槽内也应保持响应式访问。

仍需保留的 `remarkPlugins`、`rehypePlugins` 可以通过 [Remark](../../core/plugins/remark.mdx) 与 [Rehype](../../core/plugins/rehype.mdx) 基类接入，不能直接把原数组传给 `plugins`。原来的 HTML 规则和节点过滤也要在新管线中核对。

布局容器可以保留，正文颜色、字体和代码配色改用[主题配置](../customization.md)。源库用法见 [solid-markdown README](https://github.com/andi23rosca/solid-markdown)。

## 接入流式内容

```tsx
import { Fluxdown } from '@fluxdown/solid';

type MessageProps = { text: string; pending: boolean };

export function Message(props: MessageProps) {
  return <Fluxdown text={props.text} streaming={props.pending} />;
}
```

`text` 始终传入累积后的完整内容，结束时将 `pending` 设为 `false`。
