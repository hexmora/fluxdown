# 自定义配置

基本用法与 [React](../react/configuration.md) 相同。表中链接指向各参数的完整说明，下方补充 Taro 的 `style` 用法。

| 属性                                               | 类型                           | 默认值与用途                                                      |
| -------------------------------------------------- | ------------------------------ | ----------------------------------------------------------------- |
| [`text`](../react/configuration.md#text)           | `string`                       | 必填，当前完整 Markdown。                                         |
| [`streaming`](../react/configuration.md#streaming) | `boolean \| StreamingConfig`   | `false`，控制末尾修复、平滑输出和效果。                           |
| [`build`](../react/configuration.md#build)         | `BaseBuildConfig`              | `{}`，选择公式、脚注等解析能力。                                  |
| [`theme`](../react/configuration.md#theme)         | `Theme`                        | `'light'`，主题预设或局部覆盖，见[样式指南](./customization.md)。 |
| [`plugins`](../react/configuration.md#plugins)     | `IPluginItem \| IPluginItem[]` | `[]`，扩展 [Taro 预设](./plugins/matrix.mdx)；Raw 入口必填。      |
| [`patches`](../react/configuration.md#patches)     | `IPatchItem<ReactNode>[]`      | `[]`，用 Taro 组件替换或插入指定文本。                            |
| [`className`](../react/configuration.md#classname) | `string`                       | `undefined`，添加到最外层 `View` 的类名。                         |
| [`style`](../react/configuration.md#style)         | `string \| CSSProperties`      | `undefined`，最外层 `View` 的样式对象或字符串。                   |
| [`ref`](../react/configuration.md#ref)             | `Ref<FluxdownRef>`             | `undefined`，读取响应式渲染结果，不是视图引用。                   |

<details>
<summary>导入方式</summary>

`BaseBuildConfig`、`StreamingConfig`、`Theme` 和 `FluxdownRef` 从 `@fluxdown/taro` 导入；`IPluginItem` 从 `@fluxdown/react-base-plugins/typings` 导入；`IPatchItem` 从 `@fluxdown/core` 导入；`CSSProperties`、`ReactNode` 和 `Ref` 来自 `react`。

</details>

## style <span className="field-tag">可选</span> {#style}

**类型：** `string | CSSProperties`

**默认值：** `undefined`

最外层 Taro `View` 的样式，沿用 Taro `style` 属性的用法，支持对象或 CSS 声明字符串。也可以通过 `className` 使用应用中的样式：

```tsx
<Fluxdown
  className="conversation-message"
  style={{ padding: '16px', maxWidth: '720px' }}
  text={text}
/>
```

同样的样式也可以写成字符串：

```tsx
<Fluxdown style="padding: 16px; max-width: 720px" text={text} />
```

内容内部的颜色与排版见[样式指南](./customization.md)。

## 组件与插件

调整组件或交互时，在 [Slot 插件](./plugins/slot.md)或 [patch 的 `render` 函数](../react/configuration.md#patchesrender)中返回 Taro 组件。

Full 与 Lite 包含不同的 Taro 插件，具体见[插件矩阵](./plugins/matrix.mdx)。Full 使用 Prism 高亮代码。公式先尝试通过 Taro `RichText` 展示 KaTeX 输出，失败时改用 Taro `Image` 展示 MathJax SVG，仍无法渲染时保留源码。实际呈现遵循目标平台对富文本和 SVG 图片的支持。
