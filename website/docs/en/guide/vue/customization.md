# Styling guide

Themes control Markdown colors, typography and spacing. Container styles handle layout. Use [Slot plugins](./plugins/slot.md) to change components or interactions.

## Follow your app's theme

```vue
<script setup lang="ts">
import { Fluxdown } from '@fluxdown/vue';

type ArticleProps = {
  text: string;
  dark: boolean;
};

const props = defineProps<ArticleProps>();
</script>

<template>
  <Fluxdown :text="props.text" :theme="props.dark ? 'dark' : 'light'" />
</template>
```

> The default theme is `light`; it does not follow the system automatically. Pass your app's existing theme state.

## Adjust typography and color

Start with a preset and override only the tokens you need:

```vue
<script setup lang="ts">
import type { Theme } from '@fluxdown/vue';

import { Fluxdown } from '@fluxdown/vue';

type ArticleProps = {
  text: string;
};

const props = defineProps<ArticleProps>();

const theme: Theme = [
  'light',
  {
    tokens: {
      colors: { accent: '#567153' },
      typography: { fontSans: 'Inter, sans-serif' },
      heading: { h1: { fontSize: '2rem' } },
      paragraph: { marginBottom: '1rem' },
    },
  },
];
</script>

<template>
  <Fluxdown :text="props.text" :theme="theme" />
</template>
```

A token object on its own uses `light` as its base. Use `['dark', overrides]` to start from the dark theme. Set `colors.bg: 'transparent'` to blend into the surrounding container.

## Arrange the container

Vue's `class` and `style` apply to the outer element. Scoped styles can arrange that container; use tokens for internal presentation:

```vue
<template>
  <Fluxdown class="article" :text="text" />
</template>

<style scoped>
.article {
  max-width: 72ch;
  margin-inline: auto;
}
</style>
```

See [configuration](./configuration.md) for syntax options such as math and footnotes.

## Style fields

All fields below live under `theme.tokens` and support partial overrides. Colors, dimensions, and spacing accept CSS values; line heights and font weights also accept numbers. Omitted fields inherit from the selected theme.

> Import `ThemeTokens` from `@fluxdown/vue` for the full type.

### Colors

| Field                   | Meaning                                                                        |
| ----------------------- | ------------------------------------------------------------------------------ |
| `colors.fg`             | Primary text color.                                                            |
| `colors.fgMuted`        | Secondary text for quotes and supporting information.                          |
| `colors.bg`             | Content background color.                                                      |
| `colors.border`         | Default border color.                                                          |
| `colors.accent`         | Accent color for links and interactive controls.                               |
| `colors.accentHover`    | Hover color for links and interactive controls.                                |
| `colors.surfaceMuted`   | Muted surface color for code toolbars, table headers, and inline code.         |
| `colors.surfaceSubtle`  | Subtle surface color for code blocks, blockquotes, and alternating table rows. |
| `colors.borderEmphasis` | Emphasized border color for areas such as blockquotes.                         |

### Typography

| Field                          | Meaning                                                           |
| ------------------------------ | ----------------------------------------------------------------- |
| `typography.fontSans`          | Font family for body text and headings.                           |
| `typography.fontMono`          | Monospace family for code and formula placeholders.               |
| `typography.fontSmoothing`     | Font smoothing, such as `antialiased`.                            |
| `typography.fontSize.xs`       | Smallest font size, used for code toolbars and supporting labels. |
| `typography.fontSize.sm`       | Small font size, used for tables and footnotes.                   |
| `typography.fontSize.md`       | Body font size.                                                   |
| `typography.lineHeight.sm`     | Compact line height.                                              |
| `typography.lineHeight.md`     | Default line height for body content.                             |
| `typography.lineHeight.lg`     | Relaxed line height.                                              |
| `typography.fontWeight.normal` | Body font weight.                                                 |
| `typography.fontWeight.medium` | Medium weight for table headers and toolbar labels.               |
| `typography.fontWeight.bold`   | Weight for bold text.                                             |

### Headings

Replace `<level>` with `h1`, `h2`, `h3`, `h4`, `h5`, or `h6` to configure each heading level independently.

| Field                          | Meaning                             |
| ------------------------------ | ----------------------------------- |
| `heading.<level>.fontSize`     | Font size for this heading level.   |
| `heading.<level>.fontWeight`   | Font weight for this heading level. |
| `heading.<level>.lineHeight`   | Line height for this heading level. |
| `heading.<level>.marginTop`    | Space above the heading.            |
| `heading.<level>.marginBottom` | Space below the heading.            |

### Paragraphs and code blocks

| Field                    | Meaning                 |
| ------------------------ | ----------------------- |
| `paragraph.marginTop`    | Space above paragraphs. |
| `paragraph.marginBottom` | Space below paragraphs. |
| `code.fontSize`          | Code block font size.   |
| `code.lineHeight`        | Code block line height. |

### Inline code

| Field                      | Meaning                                                   |
| -------------------------- | --------------------------------------------------------- |
| `inlineCode.paddingBlock`  | Top and bottom padding.                                   |
| `inlineCode.paddingInline` | Inline padding on both sides.                             |
| `inlineCode.border`        | Full border declaration, such as `1px solid #ddd`.        |
| `inlineCode.borderRadius`  | Corner radius.                                            |
| `inlineCode.background`    | Background color or background declaration.               |
| `inlineCode.fontFamily`    | Font family.                                              |
| `inlineCode.fontSize`      | Font size.                                                |
| `inlineCode.whiteSpace`    | Whitespace and wrapping behavior, such as `break-spaces`. |

### Dividers

| Field                    | Meaning                                     |
| ------------------------ | ------------------------------------------- |
| `divider.height`         | Divider height.                             |
| `divider.marginBlock`    | Top and bottom margins.                     |
| `divider.marginInline`   | Inline margins on both sides.               |
| `divider.border`         | Full border declaration.                    |
| `divider.borderBlockEnd` | Bottom border declaration.                  |
| `divider.background`     | Background color or background declaration. |

### Footnotes

| Field                  | Meaning                             |
| ---------------------- | ----------------------------------- |
| `footnotes.marginTop`  | Margin above the footnote section.  |
| `footnotes.paddingTop` | Padding above footnote content.     |
| `footnotes.borderTop`  | Top border of the footnote section. |
| `footnotes.color`      | Footnote text color.                |
| `footnotes.fontSize`   | Footnote font size.                 |

### Syntax highlighting

| Field                | Meaning                          |
| -------------------- | -------------------------------- |
| `syntax.comment`     | Comment color.                   |
| `syntax.keyword`     | Keyword color.                   |
| `syntax.string`      | String color.                    |
| `syntax.number`      | Numeric literal color.           |
| `syntax.function`    | Function name color.             |
| `syntax.variable`    | Variable name color.             |
| `syntax.punctuation` | Punctuation and delimiter color. |
| `syntax.inserted`    | Color for inserted diff content. |
| `syntax.deleted`     | Color for deleted diff content.  |

### Radii and spacing

| Field        | Meaning                                                      |
| ------------ | ------------------------------------------------------------ |
| `radius.sm`  | Small radius for inline code and compact controls.           |
| `radius.md`  | Medium radius for containers such as blockquotes.            |
| `radius.lg`  | Large radius for code blocks, images, and tables.            |
| `spacing.xs` | Extra-small spacing.                                         |
| `spacing.sm` | Small spacing.                                               |
| `spacing.md` | Medium spacing.                                              |
| `spacing.lg` | Large spacing.                                               |
| `spacing.xl` | Extra-large spacing, used for list indentation and dividers. |
