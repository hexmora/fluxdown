# Styling guide

Use a theme to match your app's colors, typography, and spacing, then use container styles for layout. For components and interactions, use [slot plugins](./plugins/slot.md).

## Follow your app's theme

```tsx
import { Fluxdown } from 'fluxdown';

type ArticleProps = {
  text: string;
  dark: boolean;
};

export function Article({ text, dark }: ArticleProps) {
  return <Fluxdown text={text} theme={dark ? 'dark' : 'light'} />;
}
```

> The default theme is `light`. Fluxdown does not automatically follow the system theme; pass in your app's existing theme state.

## Adjust typography and color

Start from a preset and override only the tokens you need:

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

Tokens cover colors, typography, headings, paragraph spacing, code highlighting, corner radii, and spacing. Passing a token object directly extends `light`; use `['dark', overrides]` to extend the dark preset.

Use `className` or `style` for the container's size and layout:

```tsx
<Fluxdown
  style={{
    maxWidth: '72ch',
    marginInline: 'auto',
  }}
  text={text}
/>
```

See [Configuration](./configuration.md#theme) for all theme options. Formulas, footnotes, and other Markdown syntax switches are covered under [`build`](./configuration.md#build).

## Style fields

All fields below live under `theme.tokens` and support partial overrides. Colors, dimensions, and spacing accept CSS values; line heights and font weights also accept numbers. Omitted fields inherit from the selected theme.

> Import `ThemeTokens` from `fluxdown` for the full type.

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
