# ngx-markdown

将 `<markdown [data]="text">` 换成 `<fluxdown [text]="text" />`，即可迁移普通展示。Fluxdown 当前需要 Angular 22；较旧的项目应先处理框架版本兼容。

<details className="agent-assistance">
<summary>使用 Agent 协助</summary>
<div className="agent-assistance-content">

把下面这段发给项目中的 Agent：

```markdown
请把项目的 ngx-markdown 展示组件迁移到 @fluxdown/angular，直接完成代码修改。

# 参考文档

- 原库：https://github.com/jfcere/ngx-markdown
- 目标：https://hexmora.github.io/fluxdown/zh/guide/angular/quick-start.html

# 迁移步骤

1. 确认 Angular 22 兼容性，检查 markdown 组件/指令、pipe、MarkdownService、providers 和全局资源。若框架不兼容，先说明升级范围，不要强装依赖。
2. 将展示组件替换为 Fluxdown，加入组件 imports，把 data 改为 text。保留原始 Markdown；远程 src 改由应用的 HttpClient 加载，保留加载与错误状态。
3. 根据目标文档迁移 Marked 扩展、自定义 renderer、公式、图表、复制按钮和样式。优先使用内置能力，再使用语法或 Slot 插件，不要照搬原库的 providers。
4. 检查 inline、ready 等特殊用法与 HTML 规则。流式场景传入累积文本，并用请求状态控制 streaming。
5. 运行现有检查，用真实页面验证。仅在所有使用点迁移后移除旧 providers、脚本、样式和依赖，保留仍被其他功能使用的 HttpClient 等公共设施。

完成后说明修改和验证结果，列出无法等价迁移的行为，不要静默删除功能。
```

</div>
</details>

## 替换展示组件

```sh
pnpm add @fluxdown/angular
```

迁移前，组件使用 `MarkdownComponent`，应用中已配置 `provideMarkdown()`：

```ts
import { Component } from '@angular/core';
import { MarkdownComponent } from 'ngx-markdown';

@Component({
  selector: 'app-article',
  imports: [MarkdownComponent],
  template: `<markdown [data]="text" />`,
})
export class Article {
  readonly text = '# Hello\n\nAn article.';
}
```

迁移后不需要 Markdown provider：

```ts
import { Component } from '@angular/core';
import { Fluxdown } from '@fluxdown/angular';

@Component({
  selector: 'app-article',
  imports: [Fluxdown],
  template: `<fluxdown [text]="text" />`,
})
export class Article {
  readonly text = '# Hello\n\nAn article.';
}
```

Fluxdown 内置组件样式。全部旧用法移除后，再清理 `provideMarkdown()` 或 `MarkdownModule` 的注册。

## 迁移加载与扩展

Fluxdown 接收 Markdown 文本，没有 `src` 下载属性。远程文件继续由应用的 `HttpClient` 获取，将响应正文传给 `text`；原来的 `load`、`error` 逻辑放到请求处理处。`MarkdownPipe` 或 `MarkdownService.parse()` 返回 HTML 的调用点也要检查：展示区域可直接用组件，其他需要 HTML 字符串的功能应保留到完成单独迁移。

完整预设已有代码高亮和复制按钮。Mermaid 代码块由 Pele 渲染，需要核对[图表支持范围](../../react/features/diagrams.mdx)；原来的 Mermaid 配置不能直接复用。公式解析需要开启 `build.tex`：

```html
<fluxdown [text]="text" [build]="{ tex: true }" />
```

自定义 Marked renderer 改用 [Slot 插件](../plugins/slot.md)，语法扩展参考 [Remark 插件](../../core/plugins/remark.mdx)。`inline`、`ready` 和原来的 sanitizer 配置没有同名替代属性，需按实际用途调整，HTML 处理见 [Rehype 插件](../../core/plugins/rehype.mdx)。

使用[主题配置](../customization.md)重建正文与代码配色，再确认 Prism 等全局资源是否还有其他使用者。原库的 providers 与各类用法见 [ngx-markdown 文档](https://github.com/jfcere/ngx-markdown)。

## 接入流式内容

```html
<fluxdown [text]="text()" [streaming]="pending()" />
```

这里的 `text`、`pending` 是应用已有的 signals。将累积文本写入 `text`，请求结束后把 `pending` 设为 `false`。
