# 自定义配置 - Fluxdown Vue Lynx {#自定义配置}

Vue Lynx 的 `text`、`build`、`streaming`、`plugins`、`patches` 和模板 ref 沿用 [Vue 自定义配置](../vue/configuration.md)。本页仅说明 Lynx 平台的差异。

| Prop                                             | Vue Lynx 中的行为                                                               |
| ------------------------------------------------ | ------------------------------------------------------------------------------- |
| [`text`](../vue/configuration.md#text)           | 传入当前完整的 Markdown 字符串。                                                |
| [`streaming`](../vue/configuration.md#streaming) | 使用相同的修复、平滑输出和效果配置，四种效果均由 Lynx 元素呈现。                |
| [`build`](../vue/configuration.md#build)         | 共享解析能力；开启 `tex` 后，Full 使用 SVG 呈现公式。                           |
| [`plugins`](../vue/configuration.md#plugins)     | 使用 `@fluxdown/vue-base-plugins/typings` 的 `IPluginItem` 和 Vue Lynx 插件包。 |
| [`patches`](../vue/configuration.md#patches)     | 返回包含 `text`、`view` 等 Lynx 元素的 Vue VNode。                              |
| [`ref`](../vue/configuration.md#ref)             | 从 `@fluxdown/vue-lynx` 导入 `FluxdownRef`，读取响应式渲染结果。                |

## class 和 style {#style}

外层容器为 Lynx `view`。使用 Vue 的 `class`、`style` 绑定，属性和值遵循 Lynx CSS：

```vue
<Fluxdown
  class="conversation-message"
  :style="{ padding: '16px', maxWidth: '720px' }"
  :text="text"
/>
```

DOM 专属属性、浏览器 CSS 单位和 DOM 事件处理函数不会提供原生行为。通过[插槽](./plugins/slot.md)接入原生交互。

## theme {#theme}

支持 `light`、`dark`、部分 token 覆盖或 `[preset, overrides]`。从 `@fluxdown/vue-lynx` 或 `@fluxdown/vue-lynx-plugins/base` 导入 `Theme`、`ThemeTokens`。

主题值直接应用到原生元素。尺寸使用带单位的值，字体需由宿主提供。示例见[样式指南](./customization.md)，无需浏览器 CSS 变量或 DOM 选择器。
