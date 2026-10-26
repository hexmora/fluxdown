# Styling

Use `className` and `style` for outer layout, and `theme` for colors and typography within the content.

## Page layout

`style` accepts a Lynx style object:

```tsx
import { Fluxdown } from '@fluxdown/lynx';

<Fluxdown
  className="conversation-message"
  style={{ padding: '16px', maxWidth: '720px' }}
  text={text}
/>;
```

## Light and dark

Choose a preset with `theme="light"` or `theme="dark"`. Connect it to your app's theme state to follow the surrounding interface:

```tsx
<Fluxdown theme={isDark ? 'dark' : 'light'} text={text} />
```

## Override a theme

Themes accept a preset name, partial overrides, or `[preset, overrides]`. Use strings with units for dimensions and fonts loaded by your host:

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

> Import `Theme`, `ThemeTokens` and `PartialThemeConfig` from `@fluxdown/lynx-plugins/typings`.

| Group                             | Controls                                                |
| --------------------------------- | ------------------------------------------------------- |
| `colors`                          | Text, backgrounds, borders and accent colors.           |
| `typography`, `heading`           | Body fonts, sizes, line heights and heading typography. |
| `paragraph`, `code`, `inlineCode` | Paragraph spacing, code sizes and inline code styles.   |
| `divider`, `footnotes`            | Thematic breaks and footnote sections.                  |
| `syntax`                          | Syntax highlighting colors.                             |
| `radius`, `spacing`               | Shared border radii and spacing.                        |

Every group accepts partial overrides; you do not need to copy a complete theme. Use [slot plugins](./plugins/slot.md) to replace navigation, code toolbars or image components.
