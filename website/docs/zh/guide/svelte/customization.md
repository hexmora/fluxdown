# 样式指南

外部布局交给 `class` 和 `style`，内容内部的颜色与排版交给 `theme`。

## 页面布局

`style` 使用 CSS 字符串。通过 `class` 传入应用已有的类名：

```svelte
<Fluxdown
  class="conversation-message"
  style="padding: 16px; max-width: 720px"
  {text}
/>
```

Svelte 的组件样式默认有作用域。需要通过类名设置组件最外层的样式时，使用全局选择器：

```svelte
<style>
  :global(.conversation-message) {
    margin: 0 auto;
  }
</style>
```

## 浅色与深色

通过 `theme="light"` 或 `theme="dark"` 选择预设。连接应用的主题状态即可随界面切换：

```svelte
<Fluxdown theme={isDark ? 'dark' : 'light'} {text} />
```

## 覆盖主题

主题支持预设名称、局部覆盖，以及 `[预设名称, 局部覆盖]`：

```svelte
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
  {text}
/>
```

> `Theme`、`ThemeTokens` 与 `PartialThemeConfig` 从 `@fluxdown/svelte` 导入。

| 分组                              | 可调整的内容                       |
| --------------------------------- | ---------------------------------- |
| `colors`                          | 文字、背景、边框和强调色。         |
| `typography`、`heading`           | 字体、字号、行高和各级标题的排版。 |
| `paragraph`、`code`、`inlineCode` | 段落间距、代码字号和行内代码样式。 |
| `divider`、`footnotes`            | 分隔线和脚注区域。                 |
| `radius`、`spacing`               | 共用圆角和间距。                   |

各组都支持局部覆盖，无需复制完整主题。替换代码工具栏、链接或图片组件时，使用 [Slot 插件](./plugins/slot.md)。
