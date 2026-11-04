# 样式指南

使用 Vue `class`、`style` 绑定设置外层 Lynx `view`，通过 `theme` 调整内容颜色和字体。

## 页面布局

```vue
<Fluxdown
  class="conversation-message"
  :style="{ padding: '16px', maxWidth: '720px' }"
  :text="text"
/>
```

使用 Lynx 支持的样式，滚动和视口尺寸由父级页面提供。

## 明暗主题

```vue
<Fluxdown :theme="isDark ? 'dark' : 'light'" :text="text" />
```

## 覆盖主题

```vue
<Fluxdown
  :theme="[
    'dark',
    {
      tokens: {
        colors: { accent: '#82d8cf' },
        typography: { fontSize: { md: '16px' } },
        paragraph: { marginBottom: '16px' },
      },
    },
  ]"
  :text="text"
/>
```

从 `@fluxdown/vue-lynx-plugins/base` 导入 `Theme`、`ThemeTokens`、`PartialThemeConfig`。Token 分组及原生样式行为与 [React Lynx 样式指南](../react-lynx/customization.md)一致，每组都可以只覆盖部分属性。

文字样式显式传递到原生文本元素，字体和字形由宿主提供。通过 [Slot 插件](./plugins/slot.md)连接原生跳转、代码复制和图片交互。
