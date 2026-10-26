# Styling guide

The native component uses React Native styles. Use `style` for the outer layout and `theme` for the content's colors and typography.

## Layout

`style` accepts `StyleProp<ViewStyle>`: an object, a `StyleSheet.create` result, or a style array.

```tsx
import { Fluxdown } from '@fluxdown/react-native';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  message: { padding: 16, maxWidth: 720 },
});

<Fluxdown style={styles.message} text={text} />;
```

## Light and dark

```tsx
import { useColorScheme } from 'react-native';

const theme = useColorScheme() === 'dark' ? 'dark' : 'light';

<Fluxdown theme={theme} text={text} />;
```

## Override tokens

Pass a preset name, partial overrides, or `[preset, overrides]`. Sizes use React Native numeric units. Font names refer to fonts installed or loaded by your app.

```tsx
<Fluxdown
  theme={[
    'dark',
    {
      tokens: {
        colors: { accent: '#82d8cf' },
        typography: { fontSize: { md: 16 } },
        paragraph: { marginBottom: 16 },
      },
    },
  ]}
  text={text}
/>
```

> Import `Theme`, `ThemeTokens`, and `PartialThemeConfig` from `@fluxdown/react-native-plugins/typings`.

Override colors, headings, paragraphs, code, radii, or spacing without copying the entire theme.

Use a [slot plugin](./plugins/slot.md) to replace link navigation, code controls, or images. A patch's `render` callback also returns native components; use `Text` for content inserted inside a paragraph.

Links open through React Native `Linking` by default. Use a custom `Link` slot for in-app routes or footnote navigation so they follow your app's navigation model.
