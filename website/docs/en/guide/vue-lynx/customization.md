# Styling

Use Vue `class` and `style` bindings for the outer Lynx `view`, and `theme` for content colors and typography.

## Page layout

```vue
<Fluxdown
  class="conversation-message"
  :style="{ padding: '16px', maxWidth: '720px' }"
  :text="text"
/>
```

Use styles supported by Lynx. The parent page supplies scrolling and viewport dimensions.

## Light and dark

```vue
<Fluxdown :theme="isDark ? 'dark' : 'light'" :text="text" />
```

## Override a theme

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

Import `Theme`, `ThemeTokens` and `PartialThemeConfig` from `@fluxdown/vue-lynx-plugins/base`. Token groups and native style behavior match the [React Lynx styling guide](../react-lynx/customization.md). Every group accepts partial overrides.

Text styles propagate to native text elements explicitly. Fonts and glyphs come from the host. Use [slot plugins](./plugins/slot.md) for native navigation, code copying and image interactions.
