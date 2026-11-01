# Marked

把 Marked 接入 Core，主要变化是从一次返回 HTML，改为持有一组可更新的内容块。如果只是要在应用里显示 Markdown，可以直接选择[对应框架的渲染器](../../common/features/renderers.mdx)。本页适合需要自己处理输出的项目。

<details className="agent-assistance">
<summary>使用 Agent 协助</summary>
<div className="agent-assistance-content">

把下面的内容发给项目中的 Agent：

```markdown
# 目标

将项目中 Marked 的 Markdown 处理流程迁移到 @fluxdown/core，保留现有输入、输出约定和业务行为，并完成代码修改。

# 参考

- Marked：https://marked.js.org/
- Fluxdown Core：https://hexmora.github.io/fluxdown/zh/guide/core/quick-start.html
- 配置与插件：https://hexmora.github.io/fluxdown/zh/guide/core/configuration.html

# 执行

1. 检查依赖版本和所有 Marked 调用，梳理 HTML 输出、扩展、异步处理与安全过滤。若只是框架内展示，优先使用对应的 Fluxdown 渲染器。
2. 需要 Core 的地方，建立可复用的内容生命周期：累积文本作为输入，渲染器处理 HAST 内容块；原来需要 HTML 字符串的边界保留序列化适配。
3. 按职责迁移 tokenizer、walkTokens、renderer 和 hooks，不照搬 token 类型。对照真实内容检查换行、HTML、代码块和自定义语法；保留仍有用途的异步逻辑和安全过滤。
4. 正确处理输入更新、块订阅与资源释放。运行项目现有检查，验证静态内容、连续追加、内容替换和销毁；确认没有引用后再移除 Marked 及其专用依赖。

# 交付

说明已迁移的入口、验证结果，以及需要人工决定的差异。遇到没有等价能力的功能，明确说明，不静默删除。
```

</div>
</details>

## 替换 HTML 输出入口

原来的代码通常只需要一次调用：

```ts
import { marked } from 'marked';

const html = await marked.parse('# Hello');
```

安装 Core，以及用于保留 HTML 输出的序列化工具：

```sh
pnpm add @fluxdown/core @fluxdown/types stative hast-util-to-html
pnpm add -D @types/hast
```

按[快速开始](../quick-start.md#获取内容块)创建 `BlocksRenderer`、`text` 和 `core`。读取 HTML 时，把每个块的当前 HAST 交给 [`hast-util-to-html`](https://github.com/syntax-tree/hast-util-to-html)：

```ts
import { toHtml } from 'hast-util-to-html';

const readHtml = () =>
  core.value.value.map((block) => toHtml(block.value.value)).join('');

console.log(readHtml());

text.next('# Hello\n\nMore content');
console.log(readHtml());
```

这里读取的是当前快照。接到界面时，需要同时订阅块列表和每个块的内容，见[状态与更新](../streaming.md#订阅列表和内容)。不要只在 `renderItem` 中返回一次 HTML 字符串，否则已有块继续增长时会漏掉更新。

## 迁移扩展与配置

| Marked 中的用法         | Core 中的落点                                                                                                                                                          |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tokenizer`、自定义语法 | [remark 插件](../plugins/remark.mdx)，处理 Markdown 语法。                                                                                                             |
| `walkTokens`            | Markdown AST 转换使用 [remark](../plugins/remark.mdx)，HTML AST 转换使用 [rehype](../plugins/rehype.mdx)；需跟随修复开关的处理才放入 [repair](../plugins/repair.mdx)。 |
| `renderer`              | 自定义渲染器；只调整 HTML 节点时也可以使用 rehype。                                                                                                                    |
| 异步 `hooks`、数据加载  | 在输入 Core 前完成，或保留在应用的数据层。                                                                                                                             |

快速开始的语法配置面向流式内容。迁移静态文章时，按原文需要启用 `build.indentedCode`、`build.setextHeading`，并关闭 `build.repairEnding`；这些设置见[自定义配置](../configuration.md)。换行、链接和 HTML 输出也应对照原来的样本检查。

Core 自带 HTML 过滤，但它的规则与项目已有过滤器并不相同。先保留原来的安全约束，再决定如何配置[允许的标签与属性](../plugins/rehype.mdx)。Core 本身也不提供代码高亮 UI；需要完整展示时使用框架渲染器，或在自己的输出流程中实现。

## 完成迁移

一个独立文档或消息使用一个 Core 实例。结束使用时，取消自己建立的订阅，再释放实例和外部输入：

```ts
core.destroy();
text.destroy();
```

确认其他调用入口不再依赖 Marked 后，再移除它及不再使用的扩展。
