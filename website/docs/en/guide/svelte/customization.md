# Styling

Use `class` and `style` for outer layout, and `theme` for colors and typography inside the content.

## Page layout

`style` accepts a CSS string. Pass an existing application class through `class`:

```svelte
<Fluxdown
  class="conversation-message"
  style="padding: 16px; max-width: 720px"
  {text}
/>
```

Svelte scopes component styles by default. Use a global selector when styling the component's outer element through this class:

```svelte
<style>
  :global(.conversation-message) {
    margin: 0 auto;
  }
</style>
```

## Light and dark

Choose a preset with `theme="light"` or `theme="dark"`. Connect it to your application's theme state:

```svelte
<Fluxdown theme={isDark ? 'dark' : 'light'} {text} />
```

## Override the theme

A theme accepts a preset name, partial overrides, or a `[preset, overrides]` tuple:

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

> Import `Theme`, `ThemeTokens` and `PartialThemeConfig` from `@fluxdown/svelte`.

| Group                             | What it controls                               |
| --------------------------------- | ---------------------------------------------- |
| `colors`                          | Text, backgrounds, borders and accents.        |
| `typography`, `heading`           | Fonts, sizes, line heights and heading layout. |
| `paragraph`, `code`, `inlineCode` | Paragraph spacing and code typography.         |
| `divider`, `footnotes`            | Separators and footnotes.                      |
| `radius`, `spacing`               | Shared radii and spacing.                      |

Each group accepts partial overrides. Use [slot plugins](./plugins/slot.md) to replace code toolbars, links or image components.
