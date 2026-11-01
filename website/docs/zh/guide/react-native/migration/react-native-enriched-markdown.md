# react-native-enriched-markdown

这篇指南迁移 `EnrichedMarkdownText` 的 Markdown 展示部分。Fluxdown 负责渲染，不替代富文本输入框；项目中的 `EnrichedMarkdownTextInput` 可以继续保留。

<details className="agent-assistance">
<summary>使用 Agent 协助</summary>
<div className="agent-assistance-content">

把下面的内容发送给能访问项目代码的 Agent：

```markdown
# 目标

将项目中 react-native-enriched-markdown 的 Markdown 展示迁移到 @fluxdown/react-native，完成代码与依赖调整，保持已有业务行为。

# 参考文档

- 原库：https://github.com/software-mansion/enriched-markdown
- Fluxdown：https://hexmora.github.io/fluxdown/zh/guide/react-native/quick-start.html
- 主题与交互：https://hexmora.github.io/fluxdown/zh/guide/react-native/customization.html

# 执行方式

1. 检查当前版本、展示组件、流式封装、样式和事件回调，确认目标库的 React Native 与 SVG 依赖要求。将展示与输入功能分开，保留仍在使用的编辑器。
2. 将 markdown 映射到 text，内容样式映射到 theme.tokens，布局保留在 style。保留原来的数据获取和消息状态，用累积全文与 streaming 接入流式输出。
3. 用 Slot 插件接回链接导航、图片操作和代码工具栏。检查任务列表、扩展语法、文本选择与复制菜单是否有等价实现，不把原生能力视为自动继承。
4. 对不可直接迁移的功能实现适配或保留原有组件，并明确说明差异。仅清理已无引用的包、原生配置和流式封装。

# 验收

运行项目已有检查和目标平台构建，验证静态与流式内容、主题、导航和原生交互。总结完成项、验证结果和需要人工验证的部分。
```

</div>
</details>

## 替换展示组件

项目需要 React 19、React Native 0.83 或更新版本，以及 `react-native-svg` 15.16 或更新版本：

```sh
pnpm add @fluxdown/react-native react-native-svg
```

Expo 安装与 iOS 原生依赖步骤见[快速开始](../quick-start.md)。

迁移前：

```tsx
import { EnrichedMarkdownText } from 'react-native-enriched-markdown';

<EnrichedMarkdownText markdown={text} flavor="github" />;
```

迁移后：

```tsx
import { Fluxdown } from '@fluxdown/react-native';

<Fluxdown text={text} />;
```

Fluxdown 默认支持 GFM 表格、删除线和任务列表，无需传入 `flavor`。任务列表的显示与可点击切换是两回事；如果页面依赖任务状态回写，需要另行接入交互。

## 样式与流式内容

将原来的 `markdownStyle` 按用途迁到 [`theme.tokens`](../customization.md)，外层尺寸、留白继续用 `style`：

```tsx
<Fluxdown
  text={text}
  streaming={isStreaming}
  style={{ padding: 16 }}
  theme={['dark', { tokens: { typography: { fontSize: { md: 16 } } } }]}
/>
```

`text` 始终传入累积全文，完成时把 `isStreaming` 设为 `false`。原有 `streamingAnimation` 或流式封装的参数不直接复用，输出节奏与末尾效果见[流式内容](../streaming.md)。

## 保留原生交互

[原库](https://github.com/software-mansion/enriched-markdown)的文本选择、复制菜单、图片菜单和编辑器有各自的原生实现，换掉展示组件后不会自动保留。需要这些功能时，先验证适配结果，再移除旧实现。

链接与图片操作分别接到 `Link`、`Image` [Slot 插件](../plugins/slot.md)，代码复制或分享可以放到 `CodeHeader`。Fluxdown 默认链接使用 `Linking`，代码工具栏默认不接剪贴板；应用内导航和复制行为需显式接入。

如果仍使用 `EnrichedMarkdownTextInput`，保留它的依赖和原生配置，只替换预览区域。
