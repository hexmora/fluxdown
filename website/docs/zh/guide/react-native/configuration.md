# 自定义配置

本页列出原生 `Fluxdown` 的公开属性，只有 `text` 必填。需要类型时，从 `@fluxdown/react-native` 导入 `BaseBuildConfig`、`StreamingConfig`、`Theme`、`MarkdownStyles`、`IPluginItem` 和 `FluxdownRef`。

Markdown 编译与插件配置和 React 版本共享。原生封装提供根 `View`、原生主题、样式和文字选择。

## text <span className="field-tag">必填</span> {#text}

**类型：** `string`

当前收到的完整 Markdown。在应用中累积新片段，再把完整字符串传入。

```tsx
<Fluxdown text="# 你好，Fluxdown" />
```

## streaming <span className="field-tag">可选</span> {#streaming}

**类型：** `boolean | StreamingConfig`

**默认值：** `false`

`true` 同时启用末尾语法修复、平滑输出和末尾效果；`false` 结束这些效果，显示全部已收到的内容。也可以传对象分别控制，对象中省略的字段默认为 `true`。

```tsx
<Fluxdown
  streaming={{
    repairEnding: true,
    smooth: true,
    shad: { enabled: true, length: 6 },
  }}
  text={text}
/>
```

| 字段           | 类型                      | 作用                                            |
| -------------- | ------------------------- | ----------------------------------------------- |
| `repairEnding` | `boolean`                 | 修复流式尾部尚未闭合的语法。                    |
| `smooth`       | `boolean \| SmoothConfig` | 使用共享的 ticker 和 scheduler 逐步展示新内容。 |
| `shad`         | `boolean \| ShadConfig`   | 对新展示的末尾文字应用透明度动画。              |

通常使用 `smooth: true` 即可。自定义平滑输出时，沿用[共享 smooth 配置](../react/configuration.md#streamingsmooth)，包括 `enabled`、`ticker` 和 `scheduler`。

原生 `ShadConfig` 包含 `enabled` 和 `length`，默认值分别为 `true` 和 `10`。它使用原生文字透明度，没有 `maskWidth` 或 CSS 遮罩。请求完成后仍需把 `streaming` 设为 `false`，即使最后一段内容已经收到。

## build <span className="field-tag">可选</span> {#build}

**类型：** `BaseBuildConfig`

**默认值：** `{}`

语法选项和默认值与 [React 的 build 配置](../react/configuration.md#build) 相同。表格、任务列表、删除线、自动链接和普通换行默认可用；公式、脚注、缩进代码块和 setext 标题需要开启。

```tsx
<Fluxdown build={{ tex: true, footnote: true }} text={text} />
```

开启 `tex` 后，公式通过 MathJax 和原生 SVG 显示。加载过程中或转换失败时保留可读源码；SVG 公式不支持原生文字选择。

HTML 仍先经过 Core 的标签过滤与清理，再把支持的节点映射成原生视图或文字。HTML `class` 和 CSS 样式不会应用到这些视图。开启脚注会生成内容和 ID，片段链接跳转需要自定义原生 Link 插槽。

## theme <span className="field-tag">可选</span> {#theme}

**类型：** `Theme`

**默认值：** `'light'`

- `'light'` 或 `'dark'`：使用内置主题。
- `PartialThemeConfig`：覆盖浅色主题中的部分字段。
- `['light' | 'dark', PartialThemeConfig]`：扩展指定预设。

原生主题的字段为 `colors`、`syntax` 和可选的 `styles`：

```tsx
<Fluxdown
  theme={[
    'dark',
    { colors: { link: '#82d8cf' }, syntax: { keyword: '#c4a7ff' } },
  ]}
  text={text}
/>
```

字段与合并规则见[样式指南](./customization.md)。组件不会自动跟随系统主题。

## styles <span className="field-tag">可选</span> {#styles}

**类型：** `MarkdownStyles`

**默认值：** `undefined`

Markdown 元素的原生样式，例如 `text`、`paragraph`、`heading1`、`link` 和 `codeBlock`。每个条目会覆盖 `theme.styles` 中同名的条目，内置渲染器的基础样式仍然保留。

```tsx
<Fluxdown
  styles={{ paragraph: { lineHeight: 28 }, codeBlock: { borderRadius: 8 } }}
  text={text}
/>
```

## selectable <span className="field-tag">可选</span> {#selectable}

**类型：** `boolean`

**默认值：** `false`

开启内置可选择文字元素的选择功能。选择行为由原生文字组件决定，不是整篇文档连续选择；SVG 公式不属于可选择的文字。

## plugins <span className="field-tag">可选</span> {#plugins}

**类型：** `IPluginItem | IPluginItem[]`

**默认值：** `[]`

传入一个插件包，或通过数组组合多个插件包。共享列表包括 `slots`、`renders`、`remarks`、`rehypes`、`repairs` 和 `mappers`，`config` 配置同一包里的插件。原生 slot 类型与导入路径见[使用与编写插件](./plugins.md)。

## patches <span className="field-tag">可选</span> {#patches}

**类型：** `IPatchItem<ReactNode>[]`

**默认值：** `[]`

替换源码范围，或在源码位置插入内容，沿用 [React 的 patch 规则](../react/configuration.md#patches)。行内替换内容必须可以放在原生 `Text` 中：

```tsx
import { Fluxdown } from '@fluxdown/react-native';
import { Text } from 'react-native';

export function Mention() {
  return (
    <Fluxdown
      patches={[
        {
          key: 'person-ada',
          range: [7, 11],
          render: () => <Text style={{ color: '#567153' }}>@Ada</Text>,
        },
      ]}
      text="Hello, @Ada."
    />
  );
}
```

位置基于原始字符串的索引。元组替换起点包含、终点不包含的范围；数字则在该位置插入。范围应位于同一个内容块内，且不要重叠。行内 patch 不要返回 DOM 标签或块级 `View`。

## style 与 View 属性 <span className="field-tag">可选</span> {#style}

**类型：** React Native `ViewProps`，不含 `children`

`style`、`testID`、`nativeID`、无障碍属性、`onLayout` 等 View 属性会传给根 `View`。根容器背景来自主题，显式 `style` 优先。

```tsx
<Fluxdown
  accessibilityLabel="助手消息"
  style={{ padding: 16 }}
  testID="assistant-message"
  text={text}
/>
```

Markdown 内部排版使用 `styles`。内容通过 `text` 传入，不使用 `children`。组件不创建纵向滚动容器，也不提供 Web 的 `className` 属性。

## ref <span className="field-tag">可选</span> {#ref}

**类型：** `Ref<FluxdownRef>`

**默认值：** `undefined`

与 React 相同的响应式渲染结果句柄，类型为 `IReadableClosure<ReactNode[]>`，不是原生 `View` 或 `ScrollView` 的 ref。需要控制滚动时，在应用自己的滚动容器上保存 ref。

普通渲染无需传 `ref`。Fluxdown 管理句柄生命周期；自行创建的订阅需要自行取消。
