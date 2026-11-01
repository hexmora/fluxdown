# markdown-it

markdown-it 通常把 Markdown 转成 HTML 字符串；Core 则保留可订阅的内容块，方便持续更新。迁移时，先确定下游仍需要 HTML，还是准备接入自己的渲染器。

<details className="agent-assistance">
<summary>使用 Agent 协助</summary>
<div className="agent-assistance-content">

把下面的内容发给项目中的 Agent：

```markdown
# 目标

将项目中 markdown-it 的 Markdown 处理迁移到 @fluxdown/core，完成代码修改并保留现有内容和业务行为。

# 参考

- markdown-it：https://markdown-it.github.io/markdown-it/
- Fluxdown Core：https://hexmora.github.io/fluxdown/zh/guide/core/quick-start.html
- Core 插件：https://hexmora.github.io/fluxdown/zh/guide/core/plugins.html

# 执行

1. 检查版本、render/renderInline 调用、插件、renderer.rules、env 和 HTML 使用位置，区分完整文档与行内渲染。单纯的框架展示优先使用对应的 Fluxdown 渲染器。
2. 为需要 Core 的内容创建稳定实例，以完整 Markdown 更新输入。根据下游需要选择 HAST 内容块、框架视图或 HTML 序列化；不要把 Core 当成同步 render 函数直接替换。
3. 按语法、AST 处理和输出职责迁移插件，核对换行、HTML、自动链接、排版替换及自定义节点。不要将 markdown-it 插件或 Token 对象直接传入 Core，保留仍有用途的 env 数据和安全约束。
4. 处理块订阅和资源释放，运行项目检查，用真实内容验证静态结果、流式追加和自定义规则。仅移除确认不再使用的依赖。

# 交付

说明修改的入口、验证结果和无法等价迁移的行为；不要为了通过构建而删除已有功能。
```

</div>
</details>

## 替换渲染入口

原来的完整文档渲染：

```ts
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();
const html = md.render('# Hello');
```

安装 Core；如果下游仍接收 HTML，再使用序列化工具：

```sh
pnpm add @fluxdown/core @fluxdown/types stative hast-util-to-html
pnpm add -D @types/hast
```

按[快速开始](../quick-start.md#获取内容块)建立 `BlocksRenderer`、`text` 和 `core`，然后读取各块的当前值：

```ts
import { toHtml } from 'hast-util-to-html';

const readHtml = () =>
  core.value.value.map((block) => toHtml(block.value.value)).join('');

text.next('# Hello\n\nUpdated content');
const html = readHtml();
```

这段代码适用于读取快照。持续更新的界面应同时订阅列表和块内容，见[状态与更新](../streaming.md)。`renderInline` 没有直接对应的 Core 入口；原来只允许行内内容的位置，需要单独适配，不能简单删掉输出中的 `<p>` 标签。

## 对照原来的配置

| markdown-it 中的用法                       | 迁移方式                                                            |
| ------------------------------------------ | ------------------------------------------------------------------- |
| `md.use(plugin)`、语法规则                 | 查看 [remark](../plugins/remark.mdx) 预设；自定义语法按新契约改写。 |
| `renderer.rules`                           | 在自定义渲染器或 [rehype](../plugins/rehype.mdx) 中处理 HAST 节点。 |
| `env`                                      | 保留为应用上下文，明确传给需要它的自定义处理逻辑。                  |
| `html`、`breaks`、`linkify`、`typographer` | 对照原来的样本逐项确认；这些选项没有同名透传接口。                  |

快速开始示例将 `build.indentedCode` 和 `build.setextHeading` 设为 `false`，静态文章需要时应显式开启。接收最终文本后关闭 `build.repairEnding`。完整字段见[自定义配置](../configuration.md)。

Core 会处理并过滤嵌入的 HTML，与 markdown-it 默认关闭 HTML 的行为不同。原来禁止 HTML 的页面需要明确保留这个约束；原来允许 HTML 的页面也要核对标签、属性和链接的处理。不要假设两套默认值会得到完全相同的结果。

## 收尾

验证现有内容、插件行为与资源清理后，再移除 markdown-it。内容不再使用时，取消外部订阅并释放 Core 和输入：

```ts
core.destroy();
text.destroy();
```

如果项目还用 markdown-it 构建静态站点或编辑器，这些调用可以保留，只迁移本次需要的运行时入口。
