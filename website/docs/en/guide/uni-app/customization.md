# Styling guide

Use `theme` to adjust typography, colors, and spacing. Keep layout in the outer container and content-specific interactions in Slot plugins.

## Choose a theme

```vue
<Fluxdown theme="light" :text="text" />
<Fluxdown theme="dark" :text="text" />
```

The default is `light`; it does not automatically follow the system theme. Pass the current theme when your application switches between light and dark.

## Override tokens

An object overrides selected fields in the light theme. A `[preset, object]` tuple overrides the selected preset. Include only the nested fields you want to change:

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

> Import `Theme`, `ThemeTokens`, and `PartialThemeConfig` from `@fluxdown/uni-app-plugins/typings`.

Sizes and spacing are numbers measured in px. Line heights are font-size multipliers: `fontSize.md: 16` with `lineHeight.md: 1.65` produces a 26.4 px body line height.

## Available fields

All fields belong under `tokens`:

| Group                       | Fields                                                                                                      | Purpose                                                 |
| --------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `colors`                    | `fg`, `fgMuted`, `bg`, `border`, `accent`, `accentHover`, `surfaceMuted`, `surfaceSubtle`, `borderEmphasis` | Text, links, backgrounds, borders, and accents.         |
| `typography`                | `fontSans`, `fontMono`                                                                                      | Body and monospace fonts.                               |
| `typography.fontSize`       | `xs`, `sm`, `md`                                                                                            | Small, secondary, and body text sizes.                  |
| `typography.lineHeight`     | `sm`, `md`, `lg`                                                                                            | Line-height multipliers.                                |
| `typography.fontWeight`     | `normal`, `medium`, `bold`                                                                                  | Normal, medium, and bold weights.                       |
| `heading.h1` … `heading.h6` | `fontSize`, `fontWeight`, `lineHeight`, `marginTop`, `marginBottom`                                         | Typography and vertical spacing for each heading level. |
| `paragraph`                 | `marginTop`, `marginBottom`                                                                                 | Paragraph spacing.                                      |
| `code`                      | `fontSize`, `lineHeight`                                                                                    | Code font size and line-height multiplier.              |
| `syntax`                    | `comment`, `keyword`, `string`, `number`, `function`, `variable`, `punctuation`, `inserted`, `deleted`      | Syntax highlighting colors.                             |
| `radius`                    | `sm`, `md`, `lg`                                                                                            | Corner radii.                                           |
| `spacing`                   | `xs`, `sm`, `md`, `lg`, `xl`                                                                                | Shared spacing.                                         |

Body text defaults to 16 px with a 1.65 line height; code defaults to 14 px. Font availability depends on the application and device. Load custom fonts through uni-app before selecting them here.

## Containers and custom components

Use a uni-app `view` to control the surrounding layout:

```vue
<view :style="{ padding: '16px' }">
  <Fluxdown :text="text" />
</view>
```

Use [Slot plugins](./plugins/slot.md) to change link behavior, blockquote structure, or code headers. Custom components can read the active theme with `useTheme()`.

> Import `useTheme` from `@fluxdown/uni-app-plugins/base`.
