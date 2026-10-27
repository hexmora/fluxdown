# 样式指南

外部布局交给 `className` 和 `style`，内容内部的颜色与排版交给 `theme`。

## 页面布局

`style` 接受 Lynx 的样式对象：

```tsx
import { Fluxdown } from '@fluxdown/lynx';

<Fluxdown
  className="conversation-message"
  style={{ padding: '16px', maxWidth: '720px' }}
  text={text}
/>;
```

## 浅色与深色

通过 `theme="light"` 或 `theme="dark"` 选择预设。将它连接到应用的主题状态，就能随界面切换：

```tsx
<Fluxdown theme={isDark ? 'dark' : 'light'} text={text} />
```

## 覆盖主题

主题支持预设名称、局部覆盖，以及 `[预设名称, 局部覆盖]`。尺寸使用带单位的字符串，字体使用宿主已加载的字体：

```tsx
<Fluxdown
  theme={[
    'dark',
    {
      tokens: {
        colors: { accent: '#82d8cf' },
        typography: { fontSize: { md: '16px' } },
        paragraph: { marginBottom: '16px' },
      },
    },
  ]}
  text={text}
/>
```

> `Theme`、`ThemeTokens` 与 `PartialThemeConfig` 从 `@fluxdown/lynx-plugins/typings` 导入。

| 分组                              | 可调整的内容                               |
| --------------------------------- | ------------------------------------------ |
| `colors`                          | 文字、背景、边框和强调色。                 |
| `typography`、`heading`           | 正文字体、字号、行高，以及各级标题的排版。 |
| `paragraph`、`code`、`inlineCode` | 段落间距、代码字号和行内代码样式。         |
| `divider`、`footnotes`            | 分隔线和脚注区域。                         |
| `syntax`                          | 代码高亮颜色。                             |
| `radius`、`spacing`               | 共用圆角和间距。                           |

各组都支持局部覆盖，无需复制完整主题。要替换链接导航、代码工具栏或图片组件，使用 [Slot 插件](./plugins/slot.md)。
