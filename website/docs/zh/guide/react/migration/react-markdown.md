# react-markdown

从 [react-markdown](https://github.com/remarkjs/react-markdown) 迁移时，内容可以继续使用原来的 Markdown。主要变化是输入属性、组件覆盖方式，以及语法插件的配置。

<details className="agent-assistance">
<summary>使用 Agent 协助</summary>
<div className="agent-assistance-content">

把下面的提示词交给能访问项目的 Agent：

```markdown
# 目标

将当前 React 项目中的 react-markdown 迁移到 fluxdown，保留现有内容、样式和交互。

# 参考

- Fluxdown：https://hexmora.github.io/fluxdown/zh/guide/react/quick-start.html
- 配置与扩展：https://hexmora.github.io/fluxdown/zh/guide/react/configuration.html
- react-markdown：https://github.com/remarkjs/react-markdown

# 执行

1. 检查依赖版本及所有 Markdown 封装，整理 components、remarkPlugins、rehypePlugins、HTML 策略和样式的实际用途。
2. 安装 fluxdown，把 children 改为 text。静态内容不启用 streaming；流式内容传入累积文本，并用请求状态控制结束。
3. 优先使用已有预设与 build 开关；将组件覆盖迁移到 Slot 插件，仍需保留的 unified 扩展包装为 Remark 或 Rehype 插件。不要把旧插件数组直接复制到 plugins。
4. 核对换行、脚注、缩进代码、Setext 标题和 HTML 的解析差异。保留客户端边界、路由与 URL 策略，通过 theme 调整排版，只删除确认不再使用的依赖。

# 验收

运行项目已有的类型检查、测试和构建；用真实 Markdown 检查代码块、链接、表格、公式、原始 HTML 和自定义组件。完成实际修改，汇报检查结果及尚未等价的行为，不静默丢弃功能。
```

</div>
</details>

## 替换组件

```sh
pnpm add fluxdown
```

迁移前：

```tsx
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type ArticleProps = {
  text: string;
};

export function Article({ text }: ArticleProps) {
  return <Markdown remarkPlugins={[remarkGfm]}>{text}</Markdown>;
}
```

迁移后：

```tsx
import { Fluxdown } from 'fluxdown';

type ArticleProps = {
  text: string;
};

export function Article({ text }: ArticleProps) {
  return (
    <Fluxdown
      build={{ footnote: true, indentedCode: true, setextHeading: true }}
      text={text}
    />
  );
}
```

表格、任务列表、删除线和自动链接已经内置。这里显式开启了脚注、缩进代码块和 Setext 标题，以保留常见的文章语法。Fluxdown 默认把普通换行显示为换行；若原来依赖 CommonMark 的软换行表现，需要检查已有内容。

公式改用 `build.tex` 开关，不需要为默认 Full 组件再配置 `remark-math` 与 `rehype-katex`：

```tsx
<Fluxdown build={{ tex: true, footnote: true }} text={text} />
```

Next.js App Router 中，将 Fluxdown 放进文件顶部带有 `'use client';` 的包装组件。数据获取仍可留在服务端页面；插件类和回调在客户端组件内定义，不通过服务端属性传递。

## 迁移自定义组件

`components` 中的链接、图片或代码块，分别对应 `Link`、`Image`、`CodeBlock` 等插槽。先安装扩展包：

```sh
pnpm add @fluxdown/react-plugins
```

例如，为链接添加类名，同时保留默认链接处理：

```tsx
import type { LinkProps } from '@fluxdown/react-plugins/base';

import { BaseSlotPlugin } from '@fluxdown/react-plugins/base';
import { Fluxdown } from 'fluxdown';

type ArticleProps = {
  text: string;
};

function ArticleLink({ Raw, ...props }: LinkProps) {
  return Raw ? <Raw {...props} className="article-link" /> : null;
}

class ArticleLinkPlugin extends BaseSlotPlugin<'Link'> {
  static readonly key = 'article-link';

  readonly type = 'Link';
  readonly Component = ArticleLink;
}

export function Article({ text }: ArticleProps) {
  return <Fluxdown plugins={{ slots: [ArticleLinkPlugin] }} text={text} />;
}
```

插槽属性不是原来的 `components` 属性，按 [Slot 插件](../plugins/slot.md) 的类型适配即可。已有的 `urlTransform`、元素过滤与路由跳转也要明确迁移，不能只替换标签名。

## 保留需要的扩展

- 额外语法与 AST 转换：分别使用 [Remark](../../core/plugins/remark.mdx) 和 [Rehype](../../core/plugins/rehype.mdx) 插件包装现有 unified 扩展。
- 原始 HTML：Fluxdown 默认会解析允许的标签并清理输出，与 react-markdown 默认转义 HTML 的行为不同。检查原有 `skipHtml` 或 `rehype-raw` 用法，按需调整标签与属性允许列表。
- 外观：默认组件自带样式，先用 [theme](../customization.md) 调整排版。原来针对 `prose` 或 `react-markdown` 输出结构的 CSS 需要重新核对；必要时在应用入口引入 `fluxdown/styles.css`。

若内容来自流式请求，继续阅读[流式内容](../streaming.md)。确认旧插件没有其他使用方后，再移除 `react-markdown` 及不再需要的依赖。
