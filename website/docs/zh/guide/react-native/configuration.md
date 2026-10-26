# 自定义配置

用组件属性控制内容、流式输出、样式与插件。

| 属性        | 类型                           | 默认值与用途                             |
| ----------- | ------------------------------ | ---------------------------------------- |
| `text`      | `string`                       | 必填，当前完整 Markdown。                |
| `streaming` | `boolean \| StreamingConfig`   | `false`，控制末尾修复、平滑输出和效果。  |
| `build`     | `BaseBuildConfig`              | `{}`，选择公式、脚注等解析能力。         |
| `theme`     | `Theme`                        | `'light'`，原生主题预设或局部覆盖。      |
| `style`     | `StyleProp<ViewStyle>`         | 最外层 `View` 的样式，支持数组。         |
| `plugins`   | `IPluginItem \| IPluginItem[]` | 扩展预设；Raw 入口必填。                 |
| `patches`   | `IPatchItem<ReactNode>[]`      | 用原生 React 内容替换或插入指定文本。    |
| `ref`       | `Ref<FluxdownRef>`             | 读取响应式渲染结果，不是原生 View 引用。 |

> `BaseBuildConfig`、`StreamingConfig` 和 `FluxdownRef` 从 `@fluxdown/react-native` 导入；`Theme` 从 `@fluxdown/react-native-plugins/typings` 导入；`IPluginItem` 从 `@fluxdown/react-base-plugins/typings` 导入。

## 编译与流式参数

`build`、`streaming`、`patches` 和 `ref` 是两个平台共用的配置，字段、默认值与用法见 [React 的自定义配置](../react/configuration.md)。内置插件支持的内容见[插件矩阵](./plugins/matrix.mdx)。

## 样式与交互

`style` 控制外层布局；字体和内部间距使用[主题](./customization.md)。链接、图片和任务状态由各自的插槽处理。

使用自定义 patch 时，返回原生组件：

```tsx
import { Text } from 'react-native';

<Fluxdown
  patches={[
    {
      key: 'person-ada',
      range: [3, 7],
      render: () => <Text onPress={() => openProfile('ada')}>@Ada</Text>,
    },
  ]}
  text="欢迎，@Ada。"
/>;
```
