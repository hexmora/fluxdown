# react-native-markdown-display

将 `Markdown` 的子内容改为 Fluxdown 的 `text`，就能继续使用原来的 Markdown 字符串。外层的滚动容器和消息列表可以保留；样式与自定义规则需要分别迁移。

<details className="agent-assistance">
<summary>使用 Agent 协助</summary>
<div className="agent-assistance-content">

把下面的内容发送给能访问项目代码的 Agent：

```markdown
# 目标

将项目中的 react-native-markdown-display 迁移到 @fluxdown/react-native，直接完成代码修改，保留现有内容、布局和交互。

# 参考文档

- 原库：https://github.com/iamacup/react-native-markdown-display
- Fluxdown：https://hexmora.github.io/fluxdown/zh/guide/react-native/quick-start.html
- 自定义组件：https://hexmora.github.io/fluxdown/zh/guide/react-native/plugins/slot.html

# 执行方式

1. 检查依赖版本、Markdown 使用位置，以及 style、rules、markdownit 和链接/图片处理逻辑；先确认 React Native 与 SVG 依赖满足目标库要求。
2. 将 Markdown 字符串传入 text，保留请求和列表状态；流式场景传入累积全文，并用请求状态控制 streaming。
3. 将内容样式迁入 theme.tokens，外部布局保留在 style。按实际用途把规则和事件迁入 Slot 或解析插件，不直接复制 markdown-it 的 token 回调。
4. 保留导航、图片地址限制和业务校验。遇到不等价的功能，先找到可验证的替代方案，不静默删除。

# 验收

运行项目已有检查，在支持的移动端验证长文本、代码、表格、链接、图片和流式结束状态。确认所有使用处迁完后才删除无用依赖；说明变更、验证结果和仍需人工验证的差异。
```

</div>
</details>

## 替换组件

先确认项目使用 React 19 和 React Native 0.83 或更新版本，再安装：

```sh
pnpm add @fluxdown/react-native react-native-svg
```

`react-native-svg` 需要 15.16 或更新版本。Expo 的安装方式和 iOS 原生依赖步骤见[快速开始](../quick-start.md)。

迁移前：

```tsx
import Markdown from 'react-native-markdown-display';

<Markdown style={{ body: { color: '#334155', fontSize: 16 } }}>
  {text}
</Markdown>;
```

迁移后：

```tsx
import { Fluxdown } from '@fluxdown/react-native';

<Fluxdown
  text={text}
  theme={{
    tokens: {
      colors: { fg: '#334155' },
      typography: { fontSize: { md: 16 } },
    },
  }}
/>;
```

Fluxdown 的 `style` 只控制外层 `View`，不会把 `body`、`heading1` 等样式规则应用到内容。字体、颜色和段落间距改用 [`theme.tokens`](../customization.md)。

## 迁移规则与交互

[原库](https://github.com/iamacup/react-native-markdown-display)的 `rules` 接收 markdown-it 节点；Fluxdown 的插槽接收已整理好的组件属性。链接、图片和代码块通常对应 `Link`、`Image`、`CodeBlock` [Slot 插件](../plugins/slot.md)。原有 `markdownit` 扩展需要按用途改为 Core 插件，不能直接传给 `plugins`。

默认链接通过 React Native `Linking` 打开。如果原来用 `onLinkPress` 拦截导航，或用 `allowedImageHandlers` 限制图片地址，需要在对应插槽中保留这些逻辑。

已有流式消息只需加上请求状态：

```tsx
<Fluxdown text={text} streaming={isStreaming} />
```

`text` 是当前累积全文，结束时将 `isStreaming` 设为 `false`。先验证原有页面，再移除不再使用的旧库和规则代码。
