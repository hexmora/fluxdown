# 自定义配置

基本用法与 [React](../react/configuration.md) 相同。表中链接指向各参数的完整说明，下方补充 `style` 的平台用法。

| 属性                                               | 类型                           | 默认值与用途                                                      |
| -------------------------------------------------- | ------------------------------ | ----------------------------------------------------------------- |
| [`text`](../react/configuration.md#text)           | `string`                       | 必填，当前完整 Markdown。                                         |
| [`streaming`](../react/configuration.md#streaming) | `boolean \| StreamingConfig`   | `false`，控制末尾修复、平滑输出和效果。                           |
| [`build`](../react/configuration.md#build)         | `BaseBuildConfig`              | `{}`，选择公式、脚注等解析能力。                                  |
| [`theme`](../react/configuration.md#theme)         | `Theme`                        | `'light'`，主题预设或局部覆盖，见[样式指南](./customization.md)。 |
| [`plugins`](../react/configuration.md#plugins)     | `IPluginItem \| IPluginItem[]` | `[]`，扩展当前平台的预设；Raw 入口必填。                          |
| [`patches`](../react/configuration.md#patches)     | `IPatchItem<ReactNode>[]`      | `[]`，用原生组件替换或插入指定文本。                              |
| [`style`](../react/configuration.md#style)         | `StyleProp<ViewStyle>`         | `undefined`，最外层 `View` 的样式，支持数组。                     |
| [`ref`](../react/configuration.md#ref)             | `Ref<FluxdownRef>`             | `undefined`，读取响应式渲染结果，不是原生视图引用。               |

<details>
<summary>导入方式</summary>

`BaseBuildConfig`、`StreamingConfig` 和 `FluxdownRef` 从 `@fluxdown/react-native` 导入；`Theme` 从 `@fluxdown/react-native-plugins/typings` 导入；`IPluginItem` 从 `@fluxdown/react-base-plugins/typings` 导入。

</details>

## style <span className="field-tag">可选</span> {#style}

**类型：** `StyleProp<ViewStyle>`

**默认值：** `undefined`

最外层 `View` 的 React Native 样式，支持普通对象、`StyleSheet.create` 和样式数组。没有 `className` 属性，容器布局通过 `style` 设置：

```tsx
<Fluxdown style={{ padding: 16, maxWidth: 720 }} text={text} />
```

内容内部的颜色与排版见[样式指南](./customization.md)，组件与交互调整使用 [Slot 插件](./plugins/slot.md)。
