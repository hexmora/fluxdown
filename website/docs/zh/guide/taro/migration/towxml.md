# Towxml

在 Taro React 项目中，将 Towxml 的“解析成节点，再交给小程序组件”改为直接传入 Markdown。本文迁移 Markdown 展示；如果同一页面还用 Towxml 展示 HTML，需要单独保留或适配那部分。

<details className="agent-assistance">
<summary>使用 Agent 协助</summary>
<div className="agent-assistance-content">

把下面的内容发送给能访问项目代码的 Agent：

```markdown
# 目标

将 Taro React 项目中使用 Towxml 展示 Markdown 的位置迁移到 @fluxdown/taro，直接修改代码，保留页面内容与业务交互。

# 参考文档

- Towxml：https://github.com/sbfkcel/towxml/wiki
- Fluxdown：https://hexmora.github.io/fluxdown/zh/guide/taro/quick-start.html
- 自定义组件：https://hexmora.github.io/fluxdown/zh/guide/taro/plugins/slot.html

# 执行方式

1. 检查 Taro、React 版本，定位 Towxml 解析调用、usingComponents、样式、事件和资源路径配置。区分 Markdown、HTML 和专用图表的使用位置。
2. 安装兼容的 @fluxdown/taro，按文档引入全局样式与必要的构建配置。用原始 Markdown 的 text 替换节点输入，保留数据请求；流式场景传入累积全文与 streaming。
3. 有公式时开启 build.tex；将主题迁入 theme，将导航、图片预览等事件迁入 Slot 插件，保留相对资源的地址解析逻辑。不要假定 HTML、ECharts 或 yUML 有直接等价替代。
4. 对不兼容功能实现适配或保留旧渲染路径；仅在所有使用处迁完后清理 Towxml 文件、组件注册和构建复制配置。

# 验收

运行项目已有检查，构建实际使用的小程序与 H5 目标。验证正文、代码、公式、图片预览、链接跳转及流式结束；说明完成项、兼容性差异和未验证的平台。
```

</div>
</details>

## 安装与替换

Fluxdown 的 Taro 版用于 Taro React。先按[快速开始](../quick-start.md)确认版本及 H5 构建配置，再安装依赖：

```sh
pnpm add @fluxdown/taro @tarojs/components-react@4.3.1
```

应用中的 `@tarojs/*` 包保持同一版本。在全局入口引入样式：

```ts
import '@fluxdown/taro/styles.css';
```

[Towxml 3](https://github.com/sbfkcel/towxml/wiki/3.0-%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8) 通过解析函数生成节点，再传给注册过的原生小程序组件。Taro 中的已有代码通常类似下面这样，导入路径以项目为准：

```jsx
import towxml from '../../towxml';

export function Article({ text }) {
  const nodes = towxml(text, 'markdown', { theme: 'dark' });

  return <towxml nodes={nodes} />;
}
```

迁移后，直接使用原始文本：

```tsx
import { Fluxdown } from '@fluxdown/taro';

type ArticleProps = {
  text: string;
  pending: boolean;
};

export function Article({ text, pending }: ArticleProps) {
  return <Fluxdown text={text} streaming={pending} theme="dark" />;
}
```

静态文章可以省略 `streaming`。流式消息传入截至目前收到的完整内容，请求结束后将 `pending` 设为 `false`，不再手动维护 Towxml 节点树。

## 接回样式与交互

浅色、深色主题可直接用 `theme="light"` 或 `theme="dark"`；Towxml 的自定义样式类改为 [`theme.tokens`](../customization.md) 或自己的插槽组件。

原来的 `events` 不直接传入 Fluxdown。链接导航、图片预览分别放到 `Link`、`Image` [Slot 插件](../plugins/slot.md)，并保留小程序的跳转和资源限制。若使用了 Towxml 的 `base`，仍需在数据层或插件中将相对链接与图片地址补全。

文章包含公式时，显式开启解析：

```tsx
<Fluxdown text={text} build={{ tex: true }} />
```

公式和图表应使用项目的实际内容检查。Towxml 的 ECharts、yUML 配置不会自动变成 Fluxdown 插件；完整 HTML 页面也不适合直接作为 Markdown 迁入。Taro 公式的呈现还取决于目标平台的富文本和 SVG 支持，见[自定义配置](../configuration.md)。

确认所有页面都已迁移后，再清理对应的 `usingComponents.towxml`、复制到项目中的 Towxml 文件和相关构建配置。
