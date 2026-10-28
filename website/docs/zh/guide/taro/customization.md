# 样式指南

用主题让 Markdown 融入应用的颜色、字体和间距，再通过容器样式安排布局。要改变组件或交互，使用 [Slot 插件](./plugins/slot.md)。

## 跟随应用主题

```tsx
import { Fluxdown } from '@fluxdown/taro';

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

以预设为起点，只覆盖需要改变的 token：

```tsx
<Fluxdown
  text={text}
  theme={[
    'light',
    {
      tokens: {
        colors: { accent: '#567153' },
        typography: { fontSans: 'Inter, sans-serif' },
        heading: { h1: { fontSize: '2rem' } },
        paragraph: { marginBottom: '1rem' },
      },
    },
  ]}
/>
```

可以调整颜色、字体、标题、段落间距、代码高亮、圆角和间距。直接传入 token 对象时，以 `light` 为基础；使用 `['dark', overrides]` 则以深色主题为基础。

容器的宽度和布局可以通过 `className` 或 `style` 设置：

```tsx
<Fluxdown
  style={{
    maxWidth: '720px',
    margin: '0 auto',
  }}
  text={text}
/>
```

完整主题选项见[React 自定义配置](../react/configuration.md#theme)。公式、脚注与其他 Markdown 语法开关见 [`build`](../react/configuration.md#build)。

## 样式字段

以下字段均位于 `theme.tokens`，支持局部覆盖。颜色、尺寸和间距接受 CSS 值；行高和字重也可以使用数字。未设置的字段沿用所选主题。

> 完整类型 `ThemeTokens` 可从 `@fluxdown/taro` 导入。

### 颜色

| 字段                    | 含义                                   |
| ----------------------- | -------------------------------------- |
| `colors.fg`             | 正文文字颜色。                         |
| `colors.fgMuted`        | 引用、辅助信息等次要文字颜色。         |
| `colors.bg`             | 内容背景色。                           |
| `colors.border`         | 默认边框颜色。                         |
| `colors.accent`         | 链接与交互控件的强调色。               |
| `colors.accentHover`    | 链接与交互控件悬停时的颜色。           |
| `colors.surfaceMuted`   | 代码工具栏、表头与行内代码的背景色。   |
| `colors.surfaceSubtle`  | 代码块、引用块和表格交替行的浅背景色。 |
| `colors.borderEmphasis` | 引用块等需要强调的边框颜色。           |

### 字体与排版

| 字段                           | 含义                                 |
| ------------------------------ | ------------------------------------ |
| `typography.fontSans`          | 正文与标题字体。                     |
| `typography.fontMono`          | 代码与公式占位内容的等宽字体。       |
| `typography.fontSmoothing`     | 字体平滑方式，如 `antialiased`。     |
| `typography.fontSize.xs`       | 最小字号，用于代码工具栏等辅助信息。 |
| `typography.fontSize.sm`       | 小字号，用于表格、脚注等内容。       |
| `typography.fontSize.md`       | 正文字号。                           |
| `typography.lineHeight.sm`     | 紧凑行高。                           |
| `typography.lineHeight.md`     | 正文等常规内容的行高。               |
| `typography.lineHeight.lg`     | 宽松行高。                           |
| `typography.fontWeight.normal` | 正文字重。                           |
| `typography.fontWeight.medium` | 表头、工具栏等内容的中等字重。       |
| `typography.fontWeight.bold`   | 加粗文字的字重。                     |

### 标题

将 `<level>` 换成 `h1`、`h2`、`h3`、`h4`、`h5` 或 `h6`，各级标题可以独立设置。

| 字段                           | 含义             |
| ------------------------------ | ---------------- |
| `heading.<level>.fontSize`     | 该级标题的字号。 |
| `heading.<level>.fontWeight`   | 该级标题的字重。 |
| `heading.<level>.lineHeight`   | 该级标题的行高。 |
| `heading.<level>.marginTop`    | 标题上方间距。   |
| `heading.<level>.marginBottom` | 标题下方间距。   |

### 段落与代码块

| 字段                     | 含义           |
| ------------------------ | -------------- |
| `paragraph.marginTop`    | 段落上方间距。 |
| `paragraph.marginBottom` | 段落下方间距。 |
| `code.fontSize`          | 代码块字号。   |
| `code.lineHeight`        | 代码块行高。   |

### 行内代码

| 字段                       | 含义                                    |
| -------------------------- | --------------------------------------- |
| `inlineCode.paddingBlock`  | 上下内边距。                            |
| `inlineCode.paddingInline` | 左右内边距。                            |
| `inlineCode.border`        | 完整边框声明，如 `1px solid #ddd`。     |
| `inlineCode.borderRadius`  | 圆角大小。                              |
| `inlineCode.background`    | 背景颜色或背景声明。                    |
| `inlineCode.fontFamily`    | 字体。                                  |
| `inlineCode.fontSize`      | 字号。                                  |
| `inlineCode.whiteSpace`    | 空白保留与换行方式，如 `break-spaces`。 |

### 分隔线

| 字段                     | 含义                 |
| ------------------------ | -------------------- |
| `divider.height`         | 分隔线高度。         |
| `divider.marginBlock`    | 上下外边距。         |
| `divider.marginInline`   | 左右外边距。         |
| `divider.border`         | 完整边框声明。       |
| `divider.borderBlockEnd` | 下边框声明。         |
| `divider.background`     | 背景颜色或背景声明。 |

### 脚注

| 字段                   | 含义                 |
| ---------------------- | -------------------- |
| `footnotes.marginTop`  | 脚注区域上方外边距。 |
| `footnotes.paddingTop` | 脚注区域上方内边距。 |
| `footnotes.borderTop`  | 脚注区域的上边框。   |
| `footnotes.color`      | 脚注文字颜色。       |
| `footnotes.fontSize`   | 脚注字号。           |

### 代码高亮

| 字段                 | 含义                |
| -------------------- | ------------------- |
| `syntax.comment`     | 注释颜色。          |
| `syntax.keyword`     | 关键字颜色。        |
| `syntax.string`      | 字符串颜色。        |
| `syntax.number`      | 数字字面量颜色。    |
| `syntax.function`    | 函数名颜色。        |
| `syntax.variable`    | 变量名颜色。        |
| `syntax.punctuation` | 标点与分隔符颜色。  |
| `syntax.inserted`    | diff 新增内容颜色。 |
| `syntax.deleted`     | diff 删除内容颜色。 |

### 圆角与间距

| 字段         | 含义                               |
| ------------ | ---------------------------------- |
| `radius.sm`  | 小圆角，用于行内代码和小控件。     |
| `radius.md`  | 中等圆角，用于引用块等容器。       |
| `radius.lg`  | 大圆角，用于代码块、图片和表格。   |
| `spacing.xs` | 最小间距。                         |
| `spacing.sm` | 小间距。                           |
| `spacing.md` | 中等间距。                         |
| `spacing.lg` | 大间距。                           |
| `spacing.xl` | 最大间距，用于列表缩进、分隔线等。 |
