# Streamdown

从 [Streamdown](https://streamdown.ai/docs/usage) 迁移时，可以保留现有的数据流和消息状态。先把 Markdown 改为传入 `text`，再调整插件、主题和交互。

<details className="agent-assistance">
<summary>使用 Agent 协助</summary>
<div className="agent-assistance-content">

把下面的提示词交给能访问项目的 Agent：

```markdown
# 目标

将当前 React 项目中的 Streamdown 迁移到 fluxdown，保留已有的内容、流式状态和交互。

# 参考

- Fluxdown：https://hexmora.github.io/fluxdown/zh/guide/react/quick-start.html
- 配置与扩展：https://hexmora.github.io/fluxdown/zh/guide/react/configuration.html
- Streamdown：https://streamdown.ai/docs/configuration

# 执行

1. 检查依赖版本、Streamdown 调用及其封装，列出正在使用的插件、组件替换、样式和链接行为。
2. 安装 fluxdown，将 children 改为 text，使用真实请求状态控制 streaming；保留网络层和消息数据结构。
3. 按现有需求迁移：常用能力优先使用预设，公式开启 build.tex；组件定制使用 Slot 插件，主题使用 theme。逐项核对 Mermaid、HTML 和链接安全策略，不把同名配置直接照搬。
4. 保留必要的客户端边界，按项目方式加载样式。完成替换后，只清理已无引用的依赖和样式。

# 验收

运行项目已有的类型检查、测试和构建；检查静态消息、流式中间态与结束态，以及实际使用的代码块、公式、图表和自定义交互。直接完成可验证的修改，说明检查结果与仍需处理的差异，不静默删掉功能。
```

</div>
</details>

## 替换组件

```sh
pnpm add fluxdown
```

迁移前：

```tsx
import { Streamdown } from 'streamdown';

type MessageProps = {
  text: string;
  pending: boolean;
};

export function Message({ text, pending }: MessageProps) {
  return <Streamdown isAnimating={pending}>{text}</Streamdown>;
}
```

迁移后：

```tsx
import { Fluxdown } from 'fluxdown';

type MessageProps = {
  text: string;
  pending: boolean;
};

export function Message({ text, pending }: MessageProps) {
  return <Fluxdown streaming={pending} text={text} />;
}
```

`text` 仍然是累积的完整 Markdown。请求完成或中止后，将 `pending` 设为 `false`。静态文章省略 `streaming` 即可。

Fluxdown 开启流式模式时，默认同时启用末尾修复、平滑输出和缩放效果。只想保留末尾修复，可以这样写：

```tsx
<Fluxdown
  streaming={pending ? { smooth: false, effect: false } : false}
  text={text}
/>
```

## 调整已有配置

| Streamdown 中的用法             | Fluxdown 中的处理                                                                       |
| ------------------------------- | --------------------------------------------------------------------------------------- |
| `plugins.code`、`plugins.cjk`   | 默认 Full 预设已包含代码高亮与 CJK 支持。                                               |
| `plugins.math`                  | 使用 `build={{ tex: true }}` 开启公式解析。                                             |
| `plugins.mermaid`               | 保留 `mermaid` 代码块；默认由 Pele 渲染，核对[图表兼容差异](../features/diagrams.mdx)。 |
| `components`                    | 将需要保留的组件改为 [Slot 插件](../plugins/slot.md)。                                  |
| `shikiTheme`、Tailwind 排版样式 | 使用 [theme](../customization.md) 调整颜色、代码配色和排版。                            |
| `controls`、`linkSafety`        | 根据原有交互定制 `CodeHeader`、`Table` 或 `Link` 插槽。没有可直接复制的同名开关。       |

Streamdown 的插件对象不能直接传给 Fluxdown。已有的 remark / rehype 扩展需要包装为对应插件，见 [Remark](../../core/plugins/remark.mdx) 与 [Rehype](../../core/plugins/rehype.mdx)。

Fluxdown 的 HTML 允许列表和链接处理也与 Streamdown 不同。项目若使用 `allowedTags`、`urlTransform` 或链接确认弹窗，迁移时要单独保留这些行为。

组件会加载基础样式；打包器未自动加载时，在应用入口引入：

```ts
import 'fluxdown/styles.css';
```

用已有消息检查代码复制、公式和图表后，再移除未被其他组件使用的 `streamdown`、`@streamdown/*` 依赖及专用样式。
