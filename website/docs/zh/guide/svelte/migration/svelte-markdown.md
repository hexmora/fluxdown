# svelte-markdown

将 `SvelteMarkdown` 的字符串 `source` 交给 Fluxdown 的 `text` 即可开始迁移。Fluxdown 使用 Svelte 5；旧项目需要先确认框架版本。

<details className="agent-assistance">
<summary>使用 Agent 协助</summary>
<div className="agent-assistance-content">

把下面这段发给项目中的 Agent：

```markdown
请把项目的 svelte-markdown 迁移到 @fluxdown/svelte，直接完成代码修改。

# 参考文档

- 原库：https://github.com/pablo-abc/svelte-markdown
- 目标：https://hexmora.github.io/fluxdown/zh/guide/svelte/quick-start.html

# 迁移步骤

1. 确认项目使用 Svelte 5，检查 SvelteMarkdown 的 source、renderers、Marked options 和 parsed 事件。若框架不兼容，先说明升级范围，不要强装依赖。
2. 用 Fluxdown 替换组件，将字符串 source 改为 text，保留数据流；如果 source 是 token 数组，找到原始 Markdown，不要把 token 数组转成字符串传入。
3. 按目标文档迁移自定义 renderer、语法和样式。组件定制用 Slot 插件，并适配属性与 Svelte 5 snippet；Marked 的选项和 token 回调不能直接照搬。
4. 有流式内容时持续传入累积文本，并用请求状态控制 streaming。保留目录、链接和图片交互。
5. 运行现有检查，核对普通文章、定制组件与流式结束状态，仅删除已无引用的依赖。

完成后说明修改、验证结果和未解决的行为差异，不要静默删除已有功能。
```

</div>
</details>

## 替换组件

```sh
pnpm add @fluxdown/svelte
```

迁移前：

```svelte
<script lang="ts">
  import SvelteMarkdown from 'svelte-markdown';

  export let text: string;
</script>

<SvelteMarkdown source={text} />
```

迁移后：

```svelte
<script lang="ts">
  import { Fluxdown } from '@fluxdown/svelte';

  let { text }: { text: string } = $props();
</script>

<Fluxdown {text} />
```

组件会加载所需样式。主题与字体可按[样式指南](../customization.md)调整。

## 迁移自定义渲染

`renderers` 中的组件迁移到 [Slot 插件](../plugins/slot.md)。例如 `renderers.code` 对应 `CodeBlock`，`renderers.link` 对应 `Link`。原组件的 props 不能原样复用，应改用对应的 `CodeBlockProps`、`LinkProps` 等类型；子内容通过 `{@render children?.()}` 渲染。

Marked 的 `options` 和预解析 token 数组不属于 Fluxdown 输入。保留原始 Markdown，将额外语法与树转换放入 [Remark](../../core/plugins/remark.mdx) 或 [Rehype](../../core/plugins/rehype.mdx) 插件。依赖 `parsed` 事件生成目录的代码也需要重新连接标题处理。

Fluxdown 默认把普通换行显示为换行。文章使用缩进代码块或 Setext 标题时，可以开启：

```svelte
<Fluxdown {text} build={{ indentedCode: true, setextHeading: true }} />
```

## 接入流式内容

```svelte
<script lang="ts">
  import { Fluxdown } from '@fluxdown/svelte';

  let { text, pending }: { text: string; pending: boolean } = $props();
</script>

<Fluxdown {text} streaming={pending} />
```

`text` 是累积后的完整文本，结束时将 `pending` 设为 `false`。原组件的 renderer 与事件说明见 [svelte-markdown README](https://github.com/pablo-abc/svelte-markdown)。
