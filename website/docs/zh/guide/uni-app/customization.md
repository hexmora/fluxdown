# 样式指南

通过 `theme` 调整内容的字体、颜色与间距。布局和单个内容的交互分别由外层容器与 Slot 插件负责。

## 选择主题

```vue
<Fluxdown theme="light" :text="text" />
<Fluxdown theme="dark" :text="text" />
```

主题默认为 `light`，不会自动跟随系统。应用切换亮暗色时，把当前值一起传给组件。

## 覆盖主题字段

对象会覆盖浅色主题的指定字段；`[预设名称, 对象]` 会覆盖所选主题。嵌套字段只需填写需要修改的部分：

```vue
<script setup lang="ts">
import type { Theme } from '@fluxdown/uni-app-plugins/typings';

import { Fluxdown } from '@fluxdown/uni-app';

type MessageProps = {
  text: string;
};

const props = defineProps<MessageProps>();

const theme: Theme = [
  'dark',
  {
    tokens: {
      colors: { accent: '#82d8cf' },
      typography: {
        fontSize: { md: 17 },
        lineHeight: { md: 1.7 },
      },
      paragraph: { marginBottom: 18 },
    },
  },
];
</script>

<template>
  <Fluxdown :text="props.text" :theme="theme" />
</template>
```

> `Theme`、`ThemeTokens` 与 `PartialThemeConfig` 从 `@fluxdown/uni-app-plugins/typings` 导入。

尺寸与间距使用数值，单位为 px；行高使用相对字号的倍数。例如 `fontSize.md: 16` 配合 `lineHeight.md: 1.65`，正文行高为 26.4 px。

## 可调整的字段

所有字段均位于 `tokens` 下：

| 分组                        | 字段                                                                                                        | 用途                             |
| --------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `colors`                    | `fg`、`fgMuted`、`bg`、`border`、`accent`、`accentHover`、`surfaceMuted`、`surfaceSubtle`、`borderEmphasis` | 文字、链接、背景、边框与强调色。 |
| `typography`                | `fontSans`、`fontMono`                                                                                      | 正文与等宽字体。                 |
| `typography.fontSize`       | `xs`、`sm`、`md`                                                                                            | 小号文字、次要文字与正文大小。   |
| `typography.lineHeight`     | `sm`、`md`、`lg`                                                                                            | 行高倍数。                       |
| `typography.fontWeight`     | `normal`、`medium`、`bold`                                                                                  | 普通、强调与粗体的字重。         |
| `heading.h1` … `heading.h6` | `fontSize`、`fontWeight`、`lineHeight`、`marginTop`、`marginBottom`                                         | 各级标题的字体与上下间距。       |
| `paragraph`                 | `marginTop`、`marginBottom`                                                                                 | 段落上下间距。                   |
| `code`                      | `fontSize`、`lineHeight`                                                                                    | 代码字号与行高倍数。             |
| `syntax`                    | `comment`、`keyword`、`string`、`number`、`function`、`variable`、`punctuation`、`inserted`、`deleted`      | 代码高亮颜色。                   |
| `radius`                    | `sm`、`md`、`lg`                                                                                            | 圆角大小。                       |
| `spacing`                   | `xs`、`sm`、`md`、`lg`、`xl`                                                                                | 共用间距。                       |

默认正文为 16 px，行高 1.65，代码为 14 px。字体是否可用取决于应用与设备；选用自定义字体时，先按 uni-app 的方式加载字体。

## 容器与自定义组件

外层使用 uni-app 的 `view`，可以在应用中控制宽度和留白：

```vue
<view :style="{ padding: '16px' }">
  <Fluxdown :text="text" />
</view>
```

需要改变链接行为、引用块结构或代码工具栏时，使用 [Slot 插件](./plugins/slot.md)。自定义组件可以通过 `useTheme()` 读取当前主题。

> `useTheme` 从 `@fluxdown/uni-app-plugins/base` 导入。
