# 样式指南

用主题设置颜色与代码高亮，用 `styles` 调整 Markdown 的字体和间距，再通过 `style` 安排外层容器。要改变组件或交互，使用 [Slot 插件](./plugins.md)。

## 跟随应用主题

```tsx
import { Fluxdown } from '@fluxdown/react-native';

type ArticleProps = {
  text: string;

  dark: boolean;
};

export function Article({ text, dark }: ArticleProps) {
  return <Fluxdown text={text} theme={dark ? 'dark' : 'light'} />;
}
```

> 默认主题为 `light`，不会自动跟随系统。将应用已有的主题状态传进来即可。

## 调整字体与颜色

以预设为起点，只覆盖需要改变的字段：

```tsx
import type { MarkdownStyles, Theme } from '@fluxdown/react-native';

import { Fluxdown } from '@fluxdown/react-native';
import { StyleSheet } from 'react-native';

const theme: Theme = [
  'light',
  { colors: { link: '#567153' }, syntax: { keyword: '#8855aa' } },
];

const styles = StyleSheet.create({
  text: { fontSize: 17, lineHeight: 28 },
  heading1: { fontSize: 30, lineHeight: 38 },
  paragraph: { marginBottom: 18 },
}) satisfies MarkdownStyles;

export function Article({ text }: { text: string }) {
  return (
    <Fluxdown
      style={{ padding: 16 }}
      styles={styles}
      text={text}
      theme={theme}
    />
  );
}
```

主题对象包含 `colors`、`syntax` 和可选的 `styles`。直接传对象时，以 `light` 为基础；使用 `['dark', overrides]` 则以深色主题为基础。原生主题不使用 Web 的 `tokens` 结构。

样式值遵循 React Native：尺寸使用数字，颜色使用原生支持的值，字体需要在应用中可用。`MarkdownStyles` 的每个字段都接受样式对象、`StyleSheet` 条目或样式数组。

## 样式字段

完整类型 `MarkdownStyles` 可从 `@fluxdown/react-native` 导入。

| 字段                                          | 原生样式类型 | 可以调整的内容                     |
| --------------------------------------------- | ------------ | ---------------------------------- |
| `text`                                        | `TextStyle`  | 内置文字渲染器使用的公共文字样式。 |
| `paragraph`、`heading1`–`heading6`            | `TextStyle`  | 段落与标题的字体和间距。           |
| `strong`、`emphasis`、`link`                  | `TextStyle`  | 行内强调与链接外观。               |
| `listMarker`、`code`、`inlineCode`、`tex`     | `TextStyle`  | 列表标记、代码与公式呈现。         |
| `image`                                       | `ImageStyle` | 图片尺寸与外观。                   |
| `list`、`listItem`、`blockquote`、`breakLine` | `ViewStyle`  | 块级布局、间距与分隔线。           |
| `table`、`tableRow`、`tableCell`              | `ViewStyle`  | 表格容器、行与单元格。             |
| `codeBlock`、`codeHeader`                     | `ViewStyle`  | 代码容器与工具栏布局。             |

`styles.text` 由内置文字渲染器应用，不会像 CSS 一样自动继承到所有后代。需要时使用具体元素的样式字段。SVG 公式的颜色来自 `theme.colors.text`，尺寸由公式测量结果决定；如果需要不同的公式布局，可以替换 `Tex` 插槽。

## 主题字段

颜色与高亮字段都支持局部覆盖，未设置的字段沿用所选预设。

| 分组     | 字段                                                                                                                   |
| -------- | ---------------------------------------------------------------------------------------------------------------------- |
| `colors` | `text`、`muted`、`background`、`border`、`borderEmphasis`、`surfaceMuted`、`link`、`codeBackground`、`quoteBackground` |
| `syntax` | `comment`、`keyword`、`string`、`number`、`function`、`variable`、`punctuation`、`inserted`、`deleted`                 |
| `styles` | 与 `styles` 属性相同的字段。                                                                                           |

`styles` 属性会按字段覆盖 `theme.styles`。例如，传入 `styles.paragraph` 会替换主题中的 `paragraph` 覆盖项，渲染器的默认段落样式仍然生效。需要组合多个覆盖项时，可以使用样式数组。

## 容器布局

`style` 应用于根 `View`，排在主题背景色之后。可以用它设置宽度、内边距或与父容器之间的间距；文字样式则放进 `styles` 或 slot 插件。

纵向滚动由应用控制，宽表格和代码块使用横向滚动容器。文字断行、字体和行内背景遵循原生平台的布局行为。

文字选择、语法开关与其他属性见[自定义配置](./configuration.md)。
